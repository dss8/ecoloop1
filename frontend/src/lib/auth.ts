/**
 * Auth helpers: signup / login / logout / getIdToken.
 * Maps Firebase error codes to user-friendly messages.
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { requireAuth } from "@/lib/firebase";

export interface AuthResult {
  user: User;
}

const ERROR_MAP: Record<string, string> = {
  "auth/invalid-email": "That email address looks invalid.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/email-already-in-use": "An account already exists with this email.",
  "auth/weak-password": "Password is too weak — use at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please wait and try again.",
  "auth/network-request-failed": "Network error. Check your connection.",
};

export function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  if (ERROR_MAP[code]) return ERROR_MAP[code];
  const msg = (err as { message?: string })?.message;
  return msg || "Something went wrong. Please try again.";
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthResult> {
  const auth = requireAuth();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    try {
      await updateProfile(cred.user, { displayName });
    } catch {
      // non-fatal
    }
  }
  return { user: cred.user };
}

export async function logInWithEmail(email: string, password: string): Promise<AuthResult> {
  const auth = requireAuth();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return { user: cred.user };
}

export async function logOut(): Promise<void> {
  const auth = requireAuth();
  await signOut(auth);
}

export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const auth = requireAuth();
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}
