import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

// Define User type if not already defined
type UserType = {
  id: string;
  email: string;
  [key: string]: any;
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: userData, error } = await supabase
            .from('professionals')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userData && !error) {
            setUser(userData as UserType);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            const { data: userData, error } = await supabase
              .from('professionals')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (userData && !error) {
              setUser(userData as UserType);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/pricing', '/about', '/contact', '/landing'];
  
  // Check if the current route requires authentication
  const requiresAuth = !publicRoutes.includes(router.pathname);

  // Redirect to login if the user is not authenticated and the route requires authentication
  useEffect(() => {
    if (!loading && !user && requiresAuth) {
      router.push('/login');
    }
  }, [loading, user, requiresAuth, router]);

  if (loading && requiresAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Component {...pageProps} user={user} />
      <Toaster position="top-right" />
    </>
  );
}
