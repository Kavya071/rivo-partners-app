import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { getToken, setToken, clearToken } from "@/lib/api";

interface AuthContextValue {
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getToken()
      .then((t) => {
        setTokenState(t);
      })
      .catch(() => {
        setTokenState(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (newToken: string) => {
    await setToken(newToken);
    setTokenState(newToken);
  };

  const signOut = async () => {
    setTokenState(null);       // State change first (synchronous re-render)
    await clearToken();        // Then clear storage in background
  };

  const value = useMemo(
    () => ({
      token,
      isLoading,
      isAuthenticated: !!token,
      login,
      signOut,
    }),
    [token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
