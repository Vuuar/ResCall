import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        console.log('Checking session...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('Session found, fetching user data...');
          const { data: userData, error } = await supabase
            .from('professionals')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userData && !error) {
            console.log('User data found:', userData);
            setUser(userData as User);
          } else if (error) {
            console.error('Error fetching user data:', error);
          }
        } else {
          console.log('No session found');
        }
      } catch (error) {
        console.error('Error in getUser:', error);
      } finally {
        setLoading(false);
      }
    }

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (event === 'SIGNED_IN' && session) {
          try {
            console.log('User signed in, fetching data...');
            const { data: userData, error } = await supabase
              .from('professionals')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (userData && !error) {
              setUser(userData as User);
            } else if (error) {
              console.error('Error fetching user data after sign in:', error);
            }
          } catch (error) {
            console.error('Error in auth state change handler:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
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
      console.log('Redirecting to login, auth required for:', router.pathname);
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
