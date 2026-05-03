/**
 * Axios-style fetch wrapper that automatically attaches the Firebase ID token
 * (or X-User-Id header for dev mode) so the backend can identify the user.
 */
import { firebaseAuth } from "@/lib/firebase";

const BACKEND_URL = (import.meta.env.REACT_APP_BACKEND_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "") as string;
export const API_BASE = `${BACKEND_URL}/api`;

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
}

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { body, auth = false, headers, ...rest } = opts;
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined),
  };

  if (auth) {
    const user = firebaseAuth?.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        finalHeaders["Authorization"] = `Bearer ${token}`;
        finalHeaders["X-User-Id"] = user.uid;
        if (user.email) finalHeaders["X-User-Email"] = user.email;
      } catch (e) {
        console.warn("[api] failed to get ID token", e);
      }
    } else {
      // Dev fallback — try a cached UID/email if user logged in via mock store
      const cachedUid = localStorage.getItem("ecoloop-dev-uid");
      if (cachedUid) finalHeaders["X-User-Id"] = cachedUid;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail = `${res.status}`;
    try {
      const data = await res.json();
      detail = data?.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}
