import Link from "next/link";

import type { Analysis } from "@/lib/analysis-types";
import { DeleteAnalysisButton } from "@/components/DeleteAnalysisButton";
import { SeverityBadge } from "@/components/RiskList";

interface AnalysisListProps {
  analyses: Analysis[];
  onDelete: (id: string) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function AnalysisList({ analyses, onDelete }: AnalysisListProps) {
  return (
    <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      {analyses.map((analysis) => (
        <li
          key={analysis.id}
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <Link
            href={`/analyses/${analysis.id}`}
            className="min-w-0 flex-1 rounded-md hover:text-indigo-700"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-medium text-slate-900">
                {analysis.title ?? "Untitled project"}
              </span>
              <SeverityBadge severity={analysis.overallRisk} />
            </div>
            <p className="mt-1 truncate text-sm text-slate-600">{analysis.summary}</p>
            <time dateTime={analysis.createdAt} className="mt-1 block text-xs text-slate-500">
              {formatDate(analysis.createdAt)}
            </time>
          </Link>
          <DeleteAnalysisButton onDelete={() => onDelete(analysis.id)} />
        </li>
      ))}
    </ul>
  );
}
