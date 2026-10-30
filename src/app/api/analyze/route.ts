import { NextResponse } from "next/server";
import type { ZodError } from "zod";

import type { Analysis } from "@/lib/analysis-types";
import { AppError, toErrorPayload } from "@/lib/errors";
import { generateScopeAnalysis } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";
import { analyzeRequestSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 64_000;

function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();

  return realIp || "unknown";
}

function firstIssueMessage(error: ZodError): string {
  return error.issues[0]?.message ?? "The request is invalid.";
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const limit = checkRateLimit(getClientKey(request));

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: {
            code: "rate_limited",
            message: "You are submitting analyses too quickly. Please wait a moment and try again.",
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.retryAfterSeconds),
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.toLowerCase().includes("application/json")) {
      throw new AppError(
        415,
        "unsupported_media_type",
        "The request must be sent as JSON.",
      );
    }

    const declaredLength = Number(request.headers.get("content-length") ?? "0");

    if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
      throw new AppError(
        413,
        "payload_too_large",
        "The scope description is too large to process.",
      );
    }

    const rawBody = await request.text();

    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      throw new AppError(
        413,
        "payload_too_large",
        "The scope description is too large to process.",
      );
    }

    let json: unknown;

    try {
      json = JSON.parse(rawBody);
    } catch {
      throw new AppError(400, "invalid_json", "The request body is not valid JSON.");
    }

    const parsed = analyzeRequestSchema.safeParse(json);

    if (!parsed.success) {
      throw new AppError(400, "validation_error", firstIssueMessage(parsed.error));
    }

    const output = await generateScopeAnalysis(
      parsed.data.title,
      parsed.data.scopeText,
    );

    const analysis: Analysis = {
      id: globalThis.crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      title: parsed.data.title,
      scopeText: parsed.data.scopeText,
      ...output,
    };

    return NextResponse.json(
      { analysis },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    const { status, body } = toErrorPayload(error);

    return NextResponse.json(body, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  }
      }
