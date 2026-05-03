/**
 * Axios-style fetch wrapper that automatically attaches the Firebase ID token
 * (or X-User-Id header for dev mode) so the backend can identify the user.
 *
 * Dev-trust UID: when Firebase isn't configured we lazily mint a random,
 * persistent UID in localStorage so the user can save designs / orders out
 * of the box.
 */
import { firebaseAuth } from "@/lib/firebase";

const BACKEND_URL = (import.meta.env.REACT_APP_BACKEND_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "") as string;
export const API_BASE = `${BACKEND_URL}/api`;

const DEV_UID_KEY = "ecoloop-dev-uid";

function getOrCreateDevUid(): string {
  try {
    const cached = localStorage.getItem(DEV_UID_KEY);
    if (cached) return cached;
    const fresh =
      "guest_" +
      Math.random().toString(36).slice(2, 10) +
      Date.now().toString(36).slice(-4);
    localStorage.setItem(DEV_UID_KEY, fresh);
    return fresh;
  } catch {
    // localStorage unavailable (e.g. SSR); return ephemeral ID
    return "guest_anon";
  }
}

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
      // Dev-trust fallback — lazily mint and persist a uid
      finalHeaders["X-User-Id"] = getOrCreateDevUid();
      try {
        const cachedEmail = localStorage.getItem("ecoloop-dev-email");
        if (cachedEmail) finalHeaders["X-User-Email"] = cachedEmail;
      } catch {
        /* ignore */
      }
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
