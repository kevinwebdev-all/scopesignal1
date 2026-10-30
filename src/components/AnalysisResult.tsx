import type { Analysis } from "@/lib/analysis-types";
import { DeleteAnalysisButton } from "@/components/DeleteAnalysisButton";
import { RiskList, SeverityBadge } from "@/components/RiskList";

interface AnalysisResultProps {
  analysis: Analysis;
  onDelete: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface TextListSectionProps {
  heading: string;
  items: string[];
  emptyText: string;
}

function TextListSection({ heading, items, emptyText }: TextListSectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-slate-900">{heading}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText}</p>
      ) : (
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
          {items.map((item, index) => (
            <li key={`${index}-${item}`}>{item}</li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function AnalysisResult({ analysis, onDelete }: AnalysisResultProps) {
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">
            {analysis.title ?? "Untitled project"}
          </h1>
          <SeverityBadge severity={analysis.overallRisk} />
        </div>
        <time dateTime={analysis.createdAt} className="block text-sm text-slate-500">
          Analyzed {formatDate(analysis.createdAt)}
        </time>
      </header>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Summary</h2>
        <p className="text-sm leading-6 text-slate-700">{analysis.summary}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">Risks</h2>
        <RiskList risks={analysis.risks} />
      </section>

      <TextListSection
        heading="Ambiguities"
        items={analysis.ambiguities}
        emptyText="No ambiguous wording was identified."
      />

      <TextListSection
        heading="Clarifying questions"
        items={analysis.clarifyingQuestions}
        emptyText="No clarifying questions were suggested."
      />

      <details className="rounded-lg border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-900">
          Original scope description
        </summary>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {analysis.scopeText}
        </p>
      </details>

      <div className="flex justify-end border-t border-slate-200 pt-6">
        <DeleteAnalysisButton onDelete={onDelete} />
      </div>
    </article>
  );
        }
