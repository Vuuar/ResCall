import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check if we have a hash in the URL (from the password reset email)
    const hash = window.location.hash;
    if (!hash || !hash.includes('type=recovery')) {
      setError('Lien de réinitialisation invalide ou expiré.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        setError(error.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe.');
        toast.error('Échec de la réinitialisation. Veuillez réessayer.');
      } else {
        setIsSuccess(true);
        toast.success('Votre mot de passe a été réinitialisé avec succès.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue.');
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="WhatsApp Booking - Réinitialisation du mot de passe">
      <div className="min-h-screen flex items-center justify-center bg-secondary-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
              Réinitialiser votre mot de passe
            </h2>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
              {error === 'Lien de réinitialisation invalide ou expiré.' && (
                <div className="mt-4">
                  <Link href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                    Demander un nouveau lien
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {isSuccess ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
              <p className="font-bold">Mot de passe réinitialisé</p>
              <p className="text-sm">
                Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
              </p>
              <div className="mt-4">
                <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Aller à la page de connexion
                </Link>
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                  Nouveau mot de passe
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Entrez votre nouveau mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-secondary-700">
                  Confirmer le mot de passe
                </label>
                <div className="mt-1">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Confirmez votre nouveau mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || error === 'Lien de réinitialisation invalide ou expiré.'}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
                >
                  {isLoading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
