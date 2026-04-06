const DEFAULT_API_BASE_URL = "/api";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | null;
  json?: unknown;
};

export const buildApiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const apiFetch = async (path: string, options: ApiFetchOptions = {}) => {
  const { json, headers, credentials = "include", body, ...rest } = options;
  const requestHeaders = new Headers(headers);

  if (json !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  return fetch(buildApiUrl(path), {
    ...rest,
    credentials,
    headers: requestHeaders,
    body: json !== undefined ? JSON.stringify(json) : body,
  });
};

export const apiFetchJson = async <T = unknown>(
  path: string,
  options: ApiFetchOptions = {}
) => {
  const response = await apiFetch(path, options);
  return response.json() as Promise<T>;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const parseApiResponse = async (response: Response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong"
) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export const apiRequest = async <T = unknown>(
  path: string,
  options: ApiFetchOptions = {}
) => {
  const response = await apiFetch(path, options);
  const data = await parseApiResponse(response);

  if (!response.ok) {
    const message =
      (typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : null) ||
      `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, data);
  }

  return data as T;
};
