/**
 * ChartSection — reusable card wrapper for dashboard chart panels.
 *
 * Props:
 *   title      {string}    — section heading
 *   subtitle   {string}    — secondary descriptor below the title
 *   badgeLabel {string}    — label rendered as a pill badge on the right
 *   children   {ReactNode} — chart / content rendered inside the card body
 */
const ChartSection = ({ title, subtitle, badgeLabel, children }) => (
  <section className="border border-border rounded-2xl bg-card shadow-sm overflow-hidden">
    {/* ── Header ─────────────────────────────────────────────────────────── */}
    <div className="p-6 border-b border-border flex items-start justify-between">
      {/* Left — title + subtitle */}
      <div>
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right — badge */}
      {badgeLabel && (
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {badgeLabel}
        </span>
      )}
    </div>

    {/* ── Content ────────────────────────────────────────────────────────── */}
    <div className="px-6 pb-6 pt-4">{children}</div>
  </section>
);

export default ChartSection;
