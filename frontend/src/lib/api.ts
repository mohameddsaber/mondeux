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
