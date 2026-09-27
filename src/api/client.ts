import { API_BASE_URL } from "@/config/env";
import { ERROR_MESSAGES } from "@/config/errorMessages";

type RequestBody = FormData | URLSearchParams | Record<string, unknown> | null;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: RequestBody;
  headers?: Record<string, string> | Headers;
}

export class RequestError extends Error {
  status: number;
  error_code: string;

  constructor(status: number, error_code: string, message: string) {
    super(message);
    this.status = status;
    this.error_code = error_code;
  }
}

interface ApiErrorBody {
  // Application errors
  debug_message?: string;
  error_code?: string | null;

  // Validation errors
  detail?: Array<{ msg?: string }>;

  // Unexpected/system errors
}

/**
 * Handles an API response by parsing its body and converting non-2xx
 * responses into a consistent RequestError with a user-facing message.
 */
async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type");
  const isJson = contentType?.includes("application/json") ?? false;

  const body: unknown = await (isJson ? res.json() : res.text());

  if (!res.ok) {
    console.log("body", body, "status", res.status);
    const errorBody = body as ApiErrorBody;

    // {"debug_message": "Bad Credential", "error_code": "INVALID_CREDENTIALS"}
    const error_code = errorBody.error_code ?? "UNKNOWN_ERROR";

    const message =
      ERROR_MESSAGES[error_code] ||
      errorBody?.detail?.[0]?.msg ||
      `Error ${res.status}`;

    throw new RequestError(res.status, error_code, message);
  }

  return body as T;
}

/**
 * A universal fetch wrapper for API calls with automatic credential/cookie handling.
 *
 * @param endpoint - The API path (appended to API_BASE_URL).
 * @param options - Configuration including method, body, custom headers.
 * @returns Parsed JSON or raw text response of type T.
 * @throws {RequestError} If the response status is not 2xx.
 *
 * @example
 * // 1. Simple GET (Auth is included by default)
 * const data = await request<Learner>("/learners/me");
 *
 * @example
 * // 2. POST with JSON body
 * const newBrick = await request<Brick>("/bricks", {
 *   method: "POST",
 *   body: { text: "Hello", lang: "en" }
 * });
 *
 * @example
 * // 3. Multipart File Upload (FormData)
 * const formData = new FormData();
 * formData.append("audio", { uri: "...", name: "rec.m4a", type: "audio/m4a" } as any);
 * await request("/upload", {
 *   method: "POST",
 *   body: formData
 * });
 */
export async function request<T>(
  endpoint: string,
  { method = "GET", body = null, headers = {} }: RequestOptions = {},
): Promise<T> {
  // Initialize headers without a default Content-Type
  const finalHeaders = new Headers(headers);

  let finalBody: BodyInit | null = null;

  if (body) {
    if (body instanceof FormData) {
      // DO NOT set any Content-Type here; fetch handles it
      finalBody = body;
    } else if (body instanceof URLSearchParams) {
      finalHeaders.set("Content-Type", "application/x-www-form-urlencoded");
      finalBody = body.toString();
    } else {
      // Only set application/json for standard objects
      finalHeaders.set("Content-Type", "application/json");
      finalBody = JSON.stringify(body);
    }
  }

  const options: RequestInit = {
    method,
    headers: finalHeaders,
    body: finalBody,
    credentials: "include",
  };

  const base = API_BASE_URL ?? "";
  const normalizedEndpoint =
    base && endpoint.startsWith(base)
      ? endpoint
      : `${base}${endpoint}`;

  const res = await fetch(normalizedEndpoint, options);
  return handleResponse<T>(res);
}
