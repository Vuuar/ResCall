import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

// Create a context for authentication state
import { createContext } from 'react';

export const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
}>({
  user: null,
  loading: true,
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Public routes that don't require authentication
  const isPublicRoute = (path: string) => {
    const publicRoutes = ['/', '/login', '/register', '/pricing', '/about', '/contact', '/landing'];
    // Use startsWith for dynamic routes or nested routes
    return publicRoutes.some(route => path === route || path.startsWith(`${route}/`));
  };

  useEffect(() => {
    // Skip auth check for public routes
    if (isPublicRoute(router.pathname)) {
      setLoading(false);
      return;
    }

    // Check auth status once
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Fetch user data
        const { data: userData, error } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userData && !error) {
          setUser(userData as User);
        } else if (error?.code === 'PGRST116') {
          // Handle case where auth exists but professional record doesn't
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: '',
            phone: '',
            created_at: new Date().toISOString(),
          } as User);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Set up auth state listener
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
              setUser(userData as User);
            } else if (error?.code === 'PGRST116') {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: '',
                phone: '',
                created_at: new Date().toISOString(),
              } as User);
            }
          } catch (error) {
            console.error('Error in auth state change handler:', error);
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
  }, [router.pathname]);

  // Redirect to login if needed
  useEffect(() => {
    if (!loading && !user && !isPublicRoute(router.pathname)) {
      router.push('/login');
    }
  }, [loading, user, router.pathname, router]);

  // Show loading state only for protected routes
  if (loading && !isPublicRoute(router.pathname)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3 text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <Component {...pageProps} user={user} />
      <Toaster position="top-right" />
    </AuthContext.Provider>
  );
}
