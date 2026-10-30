import "server-only";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const MODEL_NAME_PATTERN = /^[a-zA-Z0-9.\-]+$/;

export interface GeminiConfig {
  apiKey: string;
  model: string;
}

export function getGeminiConfig(): GeminiConfig {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env.local for local development or to Vercel environment variables for deployment.",
    );
  }

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  if (!MODEL_NAME_PATTERN.test(model)) {
    throw new Error("GEMINI_MODEL contains invalid characters.");
  }

  return { apiKey, model };
}
