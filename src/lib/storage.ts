import type { Analysis } from "@/lib/analysis-types";
import { analysisSchema } from "@/lib/schemas";

export const STORAGE_KEY = "scopesignal.analyses.v1";
export const MAX_STORED_ANALYSES = 50;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function byNewest(a: Analysis, b: Analysis): number {
  return b.createdAt.localeCompare(a.createdAt);
}

export function loadAnalyses(): Analysis[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const valid: Analysis[] = [];

    for (const item of parsed) {
      const result = analysisSchema.safeParse(item);

      if (result.success) {
        valid.push(result.data);
      }
    }

    return valid.sort(byNewest).slice(0, MAX_STORED_ANALYSES);
  } catch {
    return [];
  }
}

export function saveAnalyses(analyses: Analysis[]): boolean {
  if (!canUseStorage()) {
    return false;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
    return true;
  } catch {
    return false;
  }
}

export function prependAnalysis(analyses: Analysis[], analysis: Analysis): Analysis[] {
  return [analysis, ...analyses].slice(0, MAX_STORED_ANALYSES);
}

export function removeAnalysis(analyses: Analysis[], id: string): Analysis[] {
  return analyses.filter((analysis) => analysis.id !== id);
}

export function findAnalysis(analyses: Analysis[], id: string): Analysis | undefined {
  return analyses.find((analysis) => analysis.id === id);
}

export function createAnalysisId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
                             }
