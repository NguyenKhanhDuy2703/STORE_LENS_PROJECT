import json
import argparse
import os
import sys
import pandas as pd
from pymongo import MongoClient
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import fpgrowth, association_rules
from prefixspan import PrefixSpan
from dotenv import load_dotenv

load_dotenv()

class ZoneDataFetcher:
    def __init__(self, location_id: str):
        self.location_id = location_id
        uri = os.getenv("MONGODB_URI") or os.getenv("URI_MONGODB")
        if not uri:
            raise ValueError("MONGODB_URI or URI_MONGODB environment variable is not set")
        client = MongoClient(uri, serverSelectionTimeoutMS=10000)
        try:
            db = client.get_default_database()
        except Exception:
            db = client["spacelens"]
        self.sessions = db["sessions"]
        self.zones = db["zones"]

    def _build_zone_name_map(self) -> dict:
        zone_docs = self.zones.find(
            {"location_id": self.location_id},
            {"zone_id": 1, "zone_name": 1}
        )
        return {z["zone_id"]: z["zone_name"] for z in zone_docs if z.get("zone_id") and z.get("zone_name")}

    def fetch_sequences(self) -> list:
        zone_name_map = self._build_zone_name_map()

        cursor = self.sessions.find(
            {"location_id": self.location_id},
            {"zone_sequence": 1}
        )
        sequences = []
        for doc in cursor:
            zones = doc.get("zone_sequence", [])
            sorted_zones = sorted(
                [z for z in zones if z.get("zone_id")],
                key=lambda z: z.get("entry_time") or 0
            )
            zone_labels = [
                zone_name_map.get(z["zone_id"], z["zone_id"].replace("_", " "))
                for z in sorted_zones
            ]
            if len(zone_labels) >= 2:
                sequences.append(zone_labels)
        return sequences
class FPGrowthMiner:
    def __init__(self, location_id: str, min_support: float = 0.1,
                 min_confidence: float = 0.5, min_lift: float = 1.0):
        self.fetcher = ZoneDataFetcher(location_id)
        self.min_support = min_support
        self.min_confidence = min_confidence
        self.min_lift = min_lift

    def _preprocess(self, sequences: list) -> pd.DataFrame:
        te = TransactionEncoder()
        te_array = te.fit(sequences).transform(sequences)
        return pd.DataFrame(te_array, columns=te.columns_)

    def run(self) -> dict:
        try:
            sequences = self.fetcher.fetch_sequences()
            if not sequences:
                return {"algorithm": "fpgrowth", "patterns": [], "error": None}

            df = self._preprocess(sequences)

            freq_items = fpgrowth(df, min_support=self.min_support, use_colnames=True)
            if freq_items.empty:
                return {"algorithm": "fpgrowth", "patterns": [], "error": None}

            rules = association_rules(
                freq_items,
                metric="confidence",
                min_threshold=self.min_confidence
            )
            rules = rules[rules["lift"] >= self.min_lift]
            if rules.empty:
                return {"algorithm": "fpgrowth", "patterns": [], "error": None}

            patterns = []
            for _, row in rules.iterrows():
                patterns.append({
                    "pattern_type": "association_rule",
                    "antecedent_zones": list(row["antecedents"]),  
                    "consequent_zones": list(row["consequents"]),  
                    "support_score": float(row["support"]),
                    "confidence_score": float(row["confidence"]),
                    "lift_score": float(row["lift"])
                })
            return {"algorithm": "fpgrowth", "patterns": patterns, "error": None}

        except Exception as e:
            return {"algorithm": "fpgrowth", "patterns": [], "error": str(e)}
class PrefixSpanMiner:
    def __init__(self, location_id: str, min_support: float = 0.1,
                 min_confidence: float = 0.5):
        self.fetcher = ZoneDataFetcher(location_id)
        self.min_support = min_support
        self.min_confidence = min_confidence

    def _is_subsequence(self, sub: list, seq: list) -> bool:
        it = iter(seq)
        return all(item in it for item in sub)

    def _generate_rules(self, freq_patterns: list, sequences: list) -> list:
        total = len(sequences)
        rules = []

        for count, pattern in freq_patterns:
            if len(pattern) < 2:
                continue
            for split in range(1, len(pattern)):
                prefix = pattern[:split]
                suffix = pattern[split:]

                prefix_count = sum(
                    1 for seq in sequences if self._is_subsequence(prefix, seq)
                )
                if prefix_count == 0:
                    continue

                confidence = count / prefix_count
                if confidence < self.min_confidence:
                    continue

                rules.append({
                    "pattern_type": "sequential_rule",
                    "antecedent_zones": prefix,   
                    "consequent_zones": suffix,   
                    "support_score": round(count / total, 4),
                    "support_count": count,
                    "confidence_score": round(confidence, 4),
                    "lift_score": None          
                })
        return rules

    def run(self) -> dict:
        try:
            sequences = self.fetcher.fetch_sequences()
            if not sequences:
                return {"algorithm": "prefixspan", "patterns": [], "error": None}

            total = len(sequences)
            min_count = max(2, int(total * self.min_support))

            ps = PrefixSpan(sequences)
            freq_patterns = ps.frequent(minsup=min_count)

            if not freq_patterns:
                return {"algorithm": "prefixspan", "patterns": [], "error": None}

            freq_seqs = []
            for count, pattern in freq_patterns:
                if len(pattern) >= 2:
                    freq_seqs.append({
                        "pattern_type": "frequent_sequence",
                        "sequence": pattern,
                        "support_score": round(count / total, 4),
                        "support_count": count,
                        "confidence_score": None,
                        "lift_score": None
                    })

            seq_rules = self._generate_rules(freq_patterns, sequences)

            patterns = freq_seqs + seq_rules
            return {"algorithm": "prefixspan", "patterns": patterns, "error": None}

        except Exception as e:
            return {"algorithm": "prefixspan", "patterns": [], "error": str(e)}

def parse_args():
    parser = argparse.ArgumentParser(description="Zone Flow Pattern Miner")
    parser.add_argument("location_id", type=str, help="Location ID to analyze")
    parser.add_argument(
        "algorithm", type=str, nargs="?", default="fpgrowth",
        choices=["fpgrowth", "prefixspan"],
        help="Algorithm to use: fpgrowth or prefixspan (default: fpgrowth)"
    )
    parser.add_argument("min_support", type=float, nargs="?", default=0.1)
    parser.add_argument("min_confidence", type=float, nargs="?", default=0.5)
    parser.add_argument("min_lift", type=float, nargs="?", default=1.0,
                        help="Only used by fpgrowth (default: 1.0)")
    return parser.parse_args()


if __name__ == "__main__":
    if sys.stdout.encoding != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")

    args = parse_args()

    if args.algorithm == "prefixspan":
        miner = PrefixSpanMiner(
            location_id=args.location_id,
            min_support=args.min_support,
            min_confidence=args.min_confidence
        )
    else:
        miner = FPGrowthMiner(
            location_id=args.location_id,
            min_support=args.min_support,
            min_confidence=args.min_confidence,
            min_lift=args.min_lift
        )

    result = miner.run()
    print(json.dumps(result, ensure_ascii=False))
