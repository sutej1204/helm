import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Base URL for API calls.
//   - In production (single-service deploy), the frontend and API live on the
//     same origin, so `VITE_API_URL` is unset and we hit relative paths like
//     `/api/...`.
//   - For split-service or local-dev-against-Render setups, set
//     `VITE_API_URL=https://your-backend.onrender.com` in `client/.env`.
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

// Optional shared bearer token. Set `VITE_HELM_API_TOKEN` in client/.env to
// match the backend's `HELM_API_TOKEN`. When unset, requests go unauthenticated
// (fine for local dev when the backend's HELM_API_TOKEN is also unset).
const API_TOKEN = import.meta.env.VITE_HELM_API_TOKEN || "";

function resolveUrl(input: string): string {
  if (/^https?:\/\//i.test(input)) return input;
  if (!API_BASE) return input;
  return API_BASE + (input.startsWith("/") ? input : "/" + input);
}

function buildHeaders(hasBody: boolean): Record<string, string> {
  const headers: Record<string, string> = {};
  if (hasBody) headers["Content-Type"] = "application/json";
  if (API_TOKEN) headers["Authorization"] = `Bearer ${API_TOKEN}`;
  return headers;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(resolveUrl(url), {
    method,
    headers: buildHeaders(data !== undefined),
    body: data !== undefined ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(resolveUrl(queryKey[0] as string), {
      headers: buildHeaders(false),
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
