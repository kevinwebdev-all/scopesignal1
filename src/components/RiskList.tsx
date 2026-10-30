import type { Risk, Severity } from "@/lib/analysis-types";

const SEVERITY_LABELS: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const SEVERITY_CLASSES: Record<Severity, string> = {
  low: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  medium: "bg-amber-100 text-amber-800 ring-amber-200",
  high: "bg-red-100 text-red-800 ring-red-200",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${SEVERITY_CLASSES[severity]}`}
    >
      {SEVERITY_LABELS[severity]} risk
    </span>
  );
}

interface RiskListProps {
  risks: Risk[];
}

export function RiskList({ risks }: RiskListProps) {
  if (risks.length === 0) {
    return <p className="text-sm text-slate-500">No specific risks were identified.</p>;
  }

  return (
    <ul className="space-y-3">
      {risks.map((risk, index) => (
        <li
          key={`${index}-${risk.title}`}
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900">{risk.title}</h3>
            <SeverityBadge severity={risk.severity} />
          </div>
          <p className="mt-2 text-sm text-slate-700">{risk.detail}</p>
        </li>
      ))}
    </ul>
  );
}
