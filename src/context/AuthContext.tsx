import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, hasSupabaseCredentials } from '../lib/supabase';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useLocalStorage('offlineMode', false);
  const [offlineUser, setOfflineUser] = useLocalStorage<User | null>('offlineUser', null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      // If we don't have real Supabase credentials, go straight to offline mode
      if (!hasSupabaseCredentials()) {
        console.log('🔧 No Supabase credentials configured, using offline mode');
        setOfflineMode(true);
        setUser(offlineUser);
        setIsLoading(false);
        return;
      }

      console.log('🔍 Testing Supabase connection for auth...');
      
      try {
        // Test connection with proper timeout handling
        const connectionPromise = supabase
          .from('users')
          .select('count')
          .limit(1);
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Connection timeout')), 8000);
        });
        
        const { data, error } = await Promise.race([connectionPromise, timeoutPromise]);
        
        if (error) {
          console.log('❌ Supabase auth connection failed:', error.message);
          setOfflineMode(true);
          setUser(offlineUser);
        } else {
          console.log('✅ Supabase auth connection successful');
          setOfflineMode(false);
          // Check for existing session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: userData } = await supabase
              .from('users')
              .select('id, email')
              .eq('id', session.user.id)
              .single();
            
            if (userData) {
              setUser(userData);
            }
          }
        }
      } catch (fetchError: any) {
        console.log('❌ Network/timeout error:', fetchError.message || fetchError);
        setOfflineMode(true);
        setUser(offlineUser);
      }
    } catch (error) {
      console.log('❌ Unexpected error, using offline mode:', error);
      setOfflineMode(true);
      setUser(offlineUser);
    } finally {
      setIsLoading(false);
    }
  };

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (offlineMode) {
      // Offline login with default credentials
      if (email === 'admin@m13.com' && password === 'admin123') {
        const offlineUserData = { id: 'offline-user', email: 'admin@m13.com' };
        setUser(offlineUserData);
        setOfflineUser(offlineUserData);
        return { success: true };
      }
      return { success: false, error: 'Invalid credentials (offline mode)' };
    }

    try {
      const passwordHash = await hashPassword(password);
      
      const { data: userData, error } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .eq('password_hash', passwordHash)
        .single();

      if (error || !userData) {
        return { success: false, error: 'Invalid email or password' };
      }

      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const register = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (offlineMode) {
      return { success: false, error: 'Registration not available in offline mode' };
    }

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      const passwordHash = await hashPassword(password);
      
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email,
          password_hash: passwordHash
        })
        .select('id, email')
        .single();

      if (error || !newUser) {
        return { success: false, error: 'Registration failed. Please try again.' };
      }

      setUser(newUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const logout = async () => {
    setUser(null);
    setOfflineUser(null);
    if (!offlineMode) {
      await supabase.auth.signOut();
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (offlineMode) {
      return { success: false, error: 'Password change not available in offline mode' };
    }

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const currentPasswordHash = await hashPassword(currentPassword);
      const newPasswordHash = await hashPassword(newPassword);

      // Verify current password
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .eq('password_hash', currentPasswordHash)
        .single();

      if (!userData) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Update password
      const { error } = await supabase
        .from('users')
        .update({ password_hash: newPasswordHash, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        return { success: false, error: 'Failed to update password' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Password change failed. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}