"use client";

import { useState, type FormEvent } from "react";

import { ErrorBanner } from "@/components/ErrorBanner";
import type { Analysis } from "@/lib/analysis-types";
import {
  analysisSchema,
  SCOPE_MAX_LENGTH,
  SCOPE_MIN_LENGTH,
  TITLE_MAX_LENGTH,
} from "@/lib/schemas";

interface ScopeFormProps {
  onAnalysisCreated: (analysis: Analysis) => void;
}

const DEFAULT_ERROR = "Something went wrong. Please try again.";
const NETWORK_ERROR =
  "Could not reach ScopeSignal. Check your connection and try again.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readErrorMessage(data: unknown): string {
  if (
    isRecord(data) &&
    isRecord(data.error) &&
    typeof data.error.message === "string"
  ) {
    return data.error.message;
  }

  return DEFAULT_ERROR;
}

export function ScopeForm({ onAnalysisCreated }: ScopeFormProps) {
  const [title, setTitle] = useState("");
  const [scopeText, setScopeText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scopeLength = scopeText.trim().length;
  const isTooShort = scopeLength < SCOPE_MIN_LENGTH;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (isTooShort) {
      setError(
        `Please describe the scope in at least ${SCOPE_MIN_LENGTH} characters so there is enough to analyze.`,
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const trimmedTitle = title.trim();

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle.length > 0 ? trimmedTitle : undefined,
          scopeText: scopeText.trim(),
        }),
      });

      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setError(readErrorMessage(data));
        return;
      }

      const parsed = isRecord(data)
        ? analysisSchema.safeParse(data.analysis)
        : null;

      if (!parsed || !parsed.success) {
        setError("The analysis came back in an unexpected format. Please try again.");
        return;
      }

      onAnalysisCreated(parsed.data);
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="project-title" className="block text-sm font-medium text-slate-900">
          Project title <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <input
          id="project-title"
          name="title"
          type="text"
          value={title}
          maxLength={TITLE_MAX_LENGTH}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="For example: Customer portal redesign"
          disabled={isSubmitting}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="scope-text" className="block text-sm font-medium text-slate-900">
          Scope description
        </label>
        <textarea
          id="scope-text"
          name="scopeText"
          rows={12}
          value={scopeText}
          maxLength={SCOPE_MAX_LENGTH}
          onChange={(event) => setScopeText(event.target.value)}
          placeholder="Paste or write the project scope here. Include goals, deliverables, users, integrations, deadlines, and anything out of scope."
          disabled={isSubmitting}
          aria-describedby="scope-text-hint"
          className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
        />
        <p
          id="scope-text-hint"
          className={`text-xs ${isTooShort && scopeLength > 0 ? "text-amber-700" : "text-slate-500"}`}
        >
          {scopeLength} / {SCOPE_MAX_LENGTH} characters. At least {SCOPE_MIN_LENGTH} are needed.
        </p>
      </div>

      {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          Your analysis is saved only in this browser.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Analyzing…" : "Analyze scope"}
        </button>
      </div>
    </form>
  );
    }
