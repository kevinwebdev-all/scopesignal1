import { z } from "zod";

export const SCOPE_MIN_LENGTH = 40;
export const SCOPE_MAX_LENGTH = 8000;
export const TITLE_MAX_LENGTH = 120;

export const MAX_RISKS = 15;
export const MAX_LIST_ITEMS = 15;

export const severitySchema = z.enum(["low", "medium", "high"]);

export const analyzeRequestSchema = z.object({
  title: z
    .string()
    .trim()
    .max(TITLE_MAX_LENGTH, `Title must be ${TITLE_MAX_LENGTH} characters or fewer.`)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  scopeText: z
    .string()
    .trim()
    .min(
      SCOPE_MIN_LENGTH,
      `Scope description must be at least ${SCOPE_MIN_LENGTH} characters.`,
    )
    .max(
      SCOPE_MAX_LENGTH,
      `Scope description must be ${SCOPE_MAX_LENGTH} characters or fewer.`,
    ),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export const geminiOutputSchema = z.object({
  summary: z.string().trim().min(1).max(1000),
  overallRisk: severitySchema,
  risks: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(160),
        detail: z.string().trim().min(1).max(600),
        severity: severitySchema,
      }),
    )
    .max(MAX_RISKS),
  ambiguities: z.array(z.string().trim().min(1).max(300)).max(MAX_LIST_ITEMS),
  clarifyingQuestions: z
    .array(z.string().trim().min(1).max(300))
    .max(MAX_LIST_ITEMS),
});

export type GeminiOutput = z.infer<typeof geminiOutputSchema>;

export const analysisSchema = z.object({
  id: z.string().min(1).max(100),
  createdAt: z.string().datetime(),
  title: z.string().max(TITLE_MAX_LENGTH).optional(),
  scopeText: z.string().min(1).max(SCOPE_MAX_LENGTH),
  summary: z.string().max(1000),
  overallRisk: severitySchema,
  risks: z
    .array(
      z.object({
        title: z.string().max(160),
        detail: z.string().max(600),
        severity: severitySchema,
      }),
    )
    .max(MAX_RISKS),
  ambiguities: z.array(z.string().max(300)).max(MAX_LIST_ITEMS),
  clarifyingQuestions: z.array(z.string().max(300)).max(MAX_LIST_ITEMS),
});
