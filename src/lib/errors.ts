export class AppError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export interface ErrorPayload {
  error: {
    code: string;
    message: string;
  };
}

export function toErrorPayload(error: unknown): {
  status: number;
  body: ErrorPayload;
} {
  if (error instanceof AppError) {
    return {
      status: error.status,
      body: {
        error: {
          code: error.code,
          message: error.message,
        },
      },
    };
  }

  console.error("Unexpected server error:", error);

  return {
    status: 500,
    body: {
      error: {
        code: "internal_error",
        message:
          "Something went wrong while analyzing the scope. Please try again.",
      },
    },
  };
}
