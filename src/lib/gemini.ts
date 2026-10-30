import "server-only";

import { getGeminiConfig } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { buildUserPrompt, SYSTEM_PROMPT } from "@/lib/prompts";
import { geminiOutputSchema, type GeminiOutput } from "@/lib/schemas";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const REQUEST_TIMEOUT_MS = 30_000;

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  error?: {
    message?: string;
  };
}

export async function generateScopeAnalysis(
  title: string | undefined,
  scopeText: string,
): Promise<GeminiOutput> {
  const { apiKey, model } = getGeminiConfig();

  let response: Response;

  try {
    response = await fetch(
      `${GEMINI_BASE_URL}/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: buildUserPrompt(title, scopeText) }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        cache: "no-store",
      },
    );
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw new AppError(
        504,
        "upstream_timeout",
        "The analysis took too long. Please try again with a shorter scope.",
      );
    }

    throw new AppError(
      502,
      "upstream_unreachable",
      "Could not reach the analysis service. Please try again in a moment.",
    );
  }

  if (response.status === 429) {
    throw new AppError(
      429,
      "upstream_rate_limited",
      "The analysis service is busy right now. Please wait a moment and try again.",
    );
  }

  let payload: GeminiGenerateResponse;

  try {
    payload = (await response.json()) as GeminiGenerateResponse;
  } catch {
    throw new AppError(
      502,
      "upstream_invalid_response",
      "The analysis service returned an unreadable response. Please try again.",
    );
  }

  if (!response.ok) {
    console.error(
      `Gemini request failed with status ${response.status}: ${payload.error?.message ?? "no message"}`,
    );
    throw new AppError(
      502,
      "upstream_error",
      "The analysis service returned an error. Please try again.",
    );
  }

  const rawText = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!rawText) {
    throw new AppError(
      502,
      "empty_model_output",
      "The analysis came back empty. Please try again.",
    );
  }

  const jsonText = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(jsonText);
  } catch {
    throw new AppError(
      502,
      "invalid_model_output",
      "The analysis could not be read. Please try again.",
    );
  }

  const result = geminiOutputSchema.safeParse(parsedJson);

  if (!result.success) {
    console.error("Gemini output failed validation:", result.error.issues);
    throw new AppError(
      502,
      "invalid_model_output",
      "The analysis did not match the expected format. Please try again.",
    );
  }

  return result.data;
      }
