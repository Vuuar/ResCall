import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        setError(error.message || 'Une erreur est survenue lors de l\'envoi du lien de réinitialisation.');
        toast.error('Échec de l\'envoi. Veuillez réessayer.');
      } else {
        setIsSubmitted(true);
        toast.success('Un lien de réinitialisation a été envoyé à votre adresse e-mail.');
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue.');
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="WhatsApp Booking - Mot de passe oublié">
      <div className="min-h-screen flex items-center justify-center bg-secondary-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
              Mot de passe oublié
            </h2>
            <p className="mt-2 text-center text-sm text-secondary-600">
              Ou{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                retournez à la page de connexion
              </Link>
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {isSubmitted ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
              <p className="font-bold">E-mail envoyé</p>
              <p className="text-sm">
                Si un compte existe avec l'adresse e-mail {email}, vous recevrez un lien pour réinitialiser votre mot de passe.
              </p>
              <div className="mt-4">
                <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Retour à la connexion
                </Link>
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-secondary-700">
                  Adresse e-mail
                </label>
                <div className="mt-1">
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Entrez votre adresse e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
                >
                  {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
