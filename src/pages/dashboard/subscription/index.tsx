import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { User } from '@/types';
import { subscriptionPlans } from '@/data/subscriptionPlans';
import { CheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from 'axios';

interface SubscriptionProps {
  user: User | null;
}

export default function Subscription({ user }: SubscriptionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      setCurrentPlan(user.subscription_tier);
      
      // Calculate trial days left if applicable
      if (user.trial_ends_at) {
        const trialEnd = new Date(user.trial_ends_at);
        const today = new Date();
        const diffTime = trialEnd.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setTrialDaysLeft(diffDays > 0 ? diffDays : 0);
      }
    }
  }, [user]);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour vous abonner');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post('/api/stripe/create-checkout-session', {
        planId,
        userId: user.id,
      });

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Une erreur est survenue lors de la création de la session de paiement');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user || !user.stripe_customer_id) {
      toast.error('Aucun abonnement actif trouvé');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post('/api/stripe/create-portal-session', {
        customerId: user.stripe_customer_id,
      });

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast.error('Une erreur est survenue lors de la création de la session de gestion');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout user={user}>
      <Head>
        <title>Abonnement | WhatsApp Booking Assistant</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-secondary-900">Abonnement</h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          {/* Current subscription status */}
          <div className="bg-white shadow rounded-lg mb-8 p-6">
            <h2 className="text-lg font-medium text-secondary-900 mb-4">Statut de votre abonnement</h2>
            
            {user.subscription_status === 'active' ? (
              <div>
                <p className="text-sm text-secondary-700">
                  Vous êtes actuellement abonné au plan <span className="font-semibold">{currentPlan}</span>.
                </p>
                <button
                  onClick={handleManageSubscription}
                  disabled={loading}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {loading ? 'Chargement...' : 'Gérer mon abonnement'}
                </button>
              </div>
            ) : trialDaysLeft !== null && trialDaysLeft > 0 ? (
              <div>
                <p className="text-sm text-secondary-700">
                  Vous êtes en période d&apos;essai. Il vous reste <span className="font-semibold">{trialDaysLeft} jours</span>.
                </p>
                <p className="text-sm text-secondary-500 mt-2">
                  Choisissez un plan ci-dessous pour continuer à utiliser le service après votre période d&apos;essai.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-secondary-700">
                  Vous n&apos;avez pas d&apos;abonnement actif. Choisissez un plan ci-dessous pour commencer.
                </p>
              </div>
            )}
          </div>

          {/* Subscription plans */}
          <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-6">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 bg-white border rounded-lg shadow-sm flex flex-col ${
                  plan.recommended ? 'border-primary-500 ring-2 ring-primary-500' : 'border-secondary-200'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 right-0 -mt-3 mr-6 px-3 py-1 bg-primary-500 text-white text-xs font-medium rounded-full">
                    Recommandé
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-secondary-900">{plan.name}</h3>
                  <p className="mt-2 text-base text-secondary-500">{plan.description}</p>
                  <p className="mt-4">
                    <span className="text-4xl font-extrabold text-secondary-900">{plan.price}€</span>
                    <span className="text-base font-medium text-secondary-500">/mois</span>
                  </p>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <div className="flex-shrink-0">
                          <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                        </div>
                        <p className="ml-3 text-sm text-secondary-700">{feature}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading || (currentPlan === plan.id && user.subscription_status === 'active')}
                    className={`w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                      currentPlan === plan.id && user.subscription_status === 'active'
                        ? 'bg-secondary-400 cursor-not-allowed'
                        : plan.recommended
                        ? 'bg-primary-600 hover:bg-primary-700'
                        : 'bg-primary-600 hover:bg-primary-700'
                    }`}
                  >
                    {loading
                      ? 'Chargement...'
                      : currentPlan === plan.id && user.subscription_status === 'active'
                      ? 'Plan actuel'
                      : 'Choisir ce plan'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
