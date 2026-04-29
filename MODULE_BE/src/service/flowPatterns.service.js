// flowPatterns.service.js
// Gọi Python script flow_miner.py, lưu và truy vấn flow patterns từ MongoDB.

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const FlowPatterns = require("../schemas/flowPatterns.schema");

const SCRIPT_PATH = path.resolve(__dirname, "../../scripts/flow_miner.py");
const ENV_PATH = path.resolve(__dirname, "../../.env");

// Đọc .env và inject vào env của Python process (cần URI_MONGODB)
const loadEnvVars = () => {
    if (!fs.existsSync(ENV_PATH)) return {};
    return fs.readFileSync(ENV_PATH, "utf8")
        .split("\n")
        .reduce((acc, line) => {
            const [key, ...rest] = line.split("=");
            if (key && rest.length) acc[key.trim()] = rest.join("=").trim();
            return acc;
        }, {});
};

// Spawn Python script, thu thập stdout và parse JSON
const runPythonScript = (args) => {
    return new Promise((resolve, reject) => {
        const env = { ...process.env, ...loadEnvVars() };
        // Set PYTHONIOENCODING để đảm bảo Python dùng UTF-8 trên Windows
        env.PYTHONIOENCODING = "utf-8";
        const proc = spawn("python", [SCRIPT_PATH, ...args], { env });
        let stdout = "";
        let stderr = "";

        proc.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
        proc.stderr.on("data", (chunk) => { stderr += chunk.toString(); });

        proc.on("close", (code) => {
            if (code !== 0) {
                return reject(new Error(`Python script exited with code ${code}: ${stderr}`));
            }
            try {
                resolve(JSON.parse(stdout));
            } catch {
                reject(new Error(`Invalid JSON output from Python script: ${stdout}`));
            }
        });

        proc.on("error", (err) => reject(new Error(`Failed to spawn Python: ${err.message}`)));
    });
};

// Chạy một thuật toán và lưu kết quả
const runAndSave = async ({ locationId, algorithm, minSupport, minConfidence, minLift }) => {
    const result = await runPythonScript([
        locationId,
        algorithm,
        String(minSupport),
        String(minConfidence),
        String(minLift)
    ]);

    if (result.error) throw new Error(`[${algorithm}] ${result.error}`);
    if (!result.patterns || result.patterns.length === 0) return [];

    await FlowPatterns.deleteMany({ location_id: locationId, algorithm });

    const now = new Date();
    const docs = result.patterns.map((p) => ({
        ...p,
        location_id: locationId,
        algorithm,
        update_at: now
    }));

    return await FlowPatterns.insertMany(docs);
};

// Chạy cả 2 thuật toán song song, lưu tất cả kết quả
const saveFlowPatterns = async ({
    locationId,
    minSupport = 0.1,
    minConfidence = 0.5,
    minLift = 1.0
} = {}) => {
    const [fpgrowthResults, prefixspanResults] = await Promise.allSettled([
        runAndSave({ locationId, algorithm: "fpgrowth", minSupport, minConfidence, minLift }),
        runAndSave({ locationId, algorithm: "prefixspan", minSupport, minConfidence, minLift })
    ]);

    const saved = [];
    const errors = [];

    if (fpgrowthResults.status === "fulfilled") saved.push(...fpgrowthResults.value);
    else errors.push(fpgrowthResults.reason?.message);

    if (prefixspanResults.status === "fulfilled") saved.push(...prefixspanResults.value);
    else errors.push(prefixspanResults.reason?.message);

    // Nếu cả 2 đều lỗi thì throw, còn không thì trả về kết quả có được
    if (errors.length === 2) throw new Error(errors.join(" | "));

    return saved;
};

// Lấy tất cả patterns theo locationId (không filter algorithm)
const getFlowPatterns = async ({ locationId } = {}) => {
    return await FlowPatterns.find({ location_id: locationId }).sort({ create_at: -1 });
};

module.exports = { saveFlowPatterns, getFlowPatterns };
