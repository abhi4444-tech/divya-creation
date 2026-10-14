import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify login session using the HttpOnly cookie.
  const checkAuth = useCallback(async () => {
    if (!API_URL) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        setUser(null);
        return null;
      }

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        return data.user;
      }

      setUser(null);
      return null;
    } catch (error) {
      console.error("Session check failed:", error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check existing session when the app starts.
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Update login state after successful login.
  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  // Clear server cookie and local React auth state.
  const logout = useCallback(async () => {
    try {
      if (API_URL) {
        const response = await fetch(`${API_URL}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Logout request failed");
        }
      }

      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};