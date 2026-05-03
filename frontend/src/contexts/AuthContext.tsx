/**
 * Auth context — wraps the app with Firebase onAuthStateChanged.
 * Provides current user, loading state, and a signOut helper.
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { logOut as fbLogOut } from "@/lib/auth";
import { useStore } from "@/stores/useStore";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  configured: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(isFirebaseConfigured);
  const setStoreUser = useStore((s) => s.login);
  const clearStoreUser = useStore((s) => s.logout);

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(firebaseAuth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        setStoreUser({
          name: u.displayName || (u.email ? u.email.split("@")[0] : "Eco User"),
          email: u.email || "",
          phone: u.phoneNumber || "",
          avatar: u.photoURL || "",
        });
      } else {
        // mirror logged-out state to local store
        clearStoreUser();
      }
    });
    return () => unsub();
  }, [setStoreUser, clearStoreUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured: isFirebaseConfigured,
      signOut: async () => {
        if (firebaseAuth) await fbLogOut();
        try {
          localStorage.removeItem("ecoloop-dev-uid");
          localStorage.removeItem("ecoloop-dev-email");
        } catch {
          /* ignore */
        }
        clearStoreUser();
      },
    }),
    [user, loading, clearStoreUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
