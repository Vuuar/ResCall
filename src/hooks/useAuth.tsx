import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ error: any, user: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          try {
            const { data: userData, error } = await supabase
              .from('professionals')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (userData && !error) {
              setUser({
                ...userData,
                email: session.user.email || userData.email,
                full_name: `${userData.first_name} ${userData.last_name}`.trim()
              });
            } else {
              console.error('Error fetching user data:', error);
              setUser(null);
            }
          } catch (err) {
            console.error('Error in user data fetch:', err);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Session fetch error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          try {
            const { data: userData, error } = await supabase
              .from('professionals')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (userData && !error) {
              setUser({
                ...userData,
                email: session.user.email || userData.email,
                full_name: `${userData.first_name} ${userData.last_name}`.trim()
              });
            } else {
              console.error('Error fetching user data:', error);
              setUser(null);
            }
          } catch (err) {
            console.error('Error in user data fetch during auth change:', err);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: userData
        }
      });
      
      if (!error && data.user) {
        try {
          // Create a record in the professionals table
          const { error: insertError } = await supabase
            .from('professionals')
            .insert([
              { 
                id: data.user.id,
                email: email,
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                phone_number: userData.phone_number || '',
              }
            ]);
            
          if (insertError) {
            console.error('Error creating professional record:', insertError);
            return { error: insertError, user: null };
          }
        } catch (err) {
          console.error('Error in professional record creation:', err);
          return { error: err, user: null };
        }
      }
      
      return { error, user: data.user };
    } catch (err) {
      console.error('Sign up error:', err);
      return { error: err, user: null };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (err) {
      console.error('Reset password error:', err);
      return { error: err };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
