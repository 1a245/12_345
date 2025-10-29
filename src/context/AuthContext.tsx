import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, hasSupabaseCredentials } from "../lib/supabase";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useLocalStorage("offlineMode", false);
  const [offlineUser, setOfflineUser] = useLocalStorage<User | null>(
    "offlineUser",
    null
  );

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      // If we don't have real Supabase credentials, go straight to offline mode
      if (!hasSupabaseCredentials()) {
        console.log(
          "🔧 No Supabase credentials configured, using offline mode"
        );
        setOfflineMode(true);
        setUser(offlineUser);
        setIsLoading(false);
        return;
      }

      try {
        // Test connection with proper timeout handling
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.log("❌ Auth error:", error.message);
          setOfflineMode(true);
          setUser(offlineUser);
        } else if (session?.user) {
          console.log("✅ Supabase auth connection successful");
          setOfflineMode(false);
          setUser({
            id: session.user.id,
            email: session.user.email || "",
          });
        } else {
          console.log("ℹ️ No active session");
          setOfflineMode(false);
          setUser(null);
        }

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            (async () => {
              if (session?.user) {
                setUser({
                  id: session.user.id,
                  email: session.user.email || "",
                });
                setOfflineMode(false);
              } else {
                setUser(null);
              }
            })();
          }
        );

        return () => {
          subscription?.unsubscribe();
        };
      } catch (fetchError: unknown) {
        const errorMessage =
          fetchError instanceof Error ? fetchError.message : String(fetchError);
        console.log("❌ Network/timeout error:", errorMessage);
        setOfflineMode(true);
        setUser(offlineUser);
      }
    } catch (error) {
      console.log("❌ Unexpected error, using offline mode:", error);
      setOfflineMode(true);
      setUser(offlineUser);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (offlineMode) {
      // Offline login with default credentials
      if (email === "admin@m13.com" && password === "admin123") {
        const offlineUserData = { id: "offline-user", email: "admin@m13.com" };
        setUser(offlineUserData);
        setOfflineUser(offlineUserData);
        return { success: true };
      }
      return { success: false, error: "Invalid credentials (offline mode)" };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
        });
        return { success: true };
      }

      return { success: false, error: "Login failed. Please try again." };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";
      return { success: false, error: errorMessage };
    }
  };

  const register = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (offlineMode) {
      return {
        success: false,
        error: "Registration not available in offline mode",
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log("User signed up successfully:", data);
        // Set user immediately after successful registration
        setUser({
          id: data.user.id,
          email: data.user.email || "",
        });
        return { success: true };
      }

      return {
        success: false,
        error: "Registration failed. Please try again.",
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      console.error("Error signing up:", errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    setUser(null);
    setOfflineUser(null);
    if (!offlineMode) {
      await supabase.auth.signOut();
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (offlineMode) {
      return {
        success: false,
        error: "Password change not available in offline mode",
      };
    }

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Password change failed. Please try again.";
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
