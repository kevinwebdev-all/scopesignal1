export type Severity = "low" | "medium" | "high";

export type OverallRisk = Severity;

export interface Risk {
  title: string;
  detail: string;
  severity: Severity;
}

export interface GeminiAnalysisFields {
  summary: string;
  overallRisk: OverallRisk;
  risks: Risk[];
  ambiguities: string[];
  clarifyingQuestions: string[];
}

export interface Analysis extends GeminiAnalysisFields {
  id: string;
  createdAt: string;
  title?: string;
  scopeText: string;
}
