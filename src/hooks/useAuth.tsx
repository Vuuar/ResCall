import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

type Professional = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  phone_number: string | null;
  subscription_tier: string | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any;
};

type AuthContextType = {
  user: (User & Partial<Professional>) | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<(User & Partial<Professional>) | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    try {
      // Vérifier d'abord si la table existe
      const { error: tableCheckError } = await supabase
        .from('professionals')
        .select('id')
        .limit(1);
      
      if (tableCheckError) {
        console.error('Table professionals may not exist:', tableCheckError);
        // Si la table n'existe pas, on continue avec juste les infos d'auth
        setUser({ ...authUser } as User & Partial<Professional>);
        setLoading(false);
        return;
      }
      
      // Si la table existe, on récupère le profil
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        
        // Vérifier si l'utilisateur existe dans la table professionals
        // Si non, créer un enregistrement pour cet utilisateur
        if (error.code === 'PGRST116') { // Code pour "No rows found"
          const { error: insertError } = await supabase
            .from('professionals')
            .insert({
              id: authUser.id,
              email: authUser.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error('Error creating professional record:', insertError);
          } else {
            console.log('Created new professional record for user');
            // Récupérer à nouveau le profil après l'insertion
            const { data: newData } = await supabase
              .from('professionals')
              .select('*')
              .eq('id', authUser.id)
              .single();
              
            if (newData) {
              setUser({ ...authUser, ...newData } as User & Partial<Professional>);
              return;
            }
          }
        }
        
        // En cas d'erreur, on continue avec juste les infos d'auth
        setUser({ ...authUser } as User & Partial<Professional>);
      } else if (data) {
        setUser({ ...authUser, ...data } as User & Partial<Professional>);
      } else {
        setUser({ ...authUser } as User & Partial<Professional>);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUser({ ...authUser } as User & Partial<Professional>);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (session?.user) {
      await fetchUserProfile(session.user);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
