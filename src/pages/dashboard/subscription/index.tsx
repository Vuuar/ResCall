import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { User, Subscription, Invoice } from '@/types';
import { formatDate } from '@/utils/date';
import toast from 'react-hot-toast';

interface SubscriptionProps {
  user: User | null;
}

interface PricingTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  cta: string;
  popular?: boolean;
}

export default function SubscriptionPage({ user }: SubscriptionProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const pricingTiers: PricingTier[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 19,
      features: [
        '100 conversations par mois',
        'Agenda simple',
        'Réponses automatiques',
        'Rappels de rendez-vous',
        'Support par email',
      ],
      cta: 'Choisir Basic',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 49,
      features: [
        '500 conversations par mois',
        'Intégration Google Calendar',
        'Rappels automatiques',
        'Statistiques avancées',
        'Support prioritaire',
      ],
      cta: 'Choisir Pro',
      popular: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 99,
      features: [
        'Conversations illimitées',
        'Voix IA personnalisée',
        'Intégrations avancées',
        'Reporting détaillé',
        'Support dédié',
      ],
      cta: 'Choisir Premium',
    },
  ];

  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      // Fetch subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('professional_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        throw subscriptionError;
      }
      
      setSubscription(subscriptionData || null);

      // Fetch invoices
      if (subscriptionData) {
        const { data: invoicesData, error: invoicesError } = await supabase
          .from('invoices')
          .select('*')
          .eq('professional_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (invoicesError) throw invoicesError;
        setInvoices(invoicesData || []);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Erreur lors du chargement des données d\'abonnement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tierId: string) => {
    setProcessingPayment(true);
    try {
      // In a real implementation, this would redirect to Stripe Checkout
      // For demo purposes, we'll simulate a successful subscription
      
      // Create a new subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([
          {
            professional_id: user?.id,
            tier: tierId,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            cancel_at_period_end: false,
            payment_method: 'card_**** 4242',
          },
        ])
        .select();

      if (error) throw error;
      
      // Create an invoice
      const price = pricingTiers.find(tier => tier.id === tierId)?.price || 0;
      
      const { error: invoiceError } = await supabase
        .from('invoices')
        .insert([
          {
            professional_id: user?.id,
            subscription_id: data[0].id,
            amount: price,
            currency: 'EUR',
            status: 'paid',
            invoice_url: '#',
            invoice_pdf: '#',
          },
        ]);

      if (invoiceError) throw invoiceError;
      
      // Update user's subscription tier
      const { error: userError } = await supabase
        .from('users')
        .update({
          subscription_tier: tierId,
          trial_ends_at: null,
        })
        .eq('id', user?.id);

      if (userError) throw userError;
      
      toast.success(`Abonnement ${tierId} activé avec succès !`);
      fetchSubscriptionData();
    } catch (error) {
      console.error('Error processing subscription:', error);
      toast.error('Erreur lors du traitement de l\'abonnement');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    if (!confirm('Êtes-vous sûr de vouloir annuler votre abonnement ? Vous aurez toujours accès jusqu\'à la fin de la période en cours.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          cancel_at_period_end: true,
        })
        .eq('id', subscription.id);

      if (error) throw error;
      
      toast.success('Abonnement annulé avec succès. Vous aurez accès jusqu\'à la fin de la période en cours.');
      fetchSubscriptionData();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Erreur lors de l\'annulation de l\'abonnement');
    }
  };

  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTrialRemainingDays = () => {
    if (!user?.trial_ends_at) return 0;
    return getRemainingDays(user.trial_ends_at);
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
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-secondary-100 rounded w-1/4"></div>
                <div className="h-24 bg-secondary-100 rounded"></div>
              </div>
            ) : subscription ? (
              <div>
                <h2 className="text-lg font-medium text-secondary-900 mb-4">Votre abonnement actuel</h2>
                <div className="bg-secondary-50 p-4 rounded-md">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm text-secondary-500">Plan</p>
                      <p className="text-lg font-medium text-secondary-900 capitalize">{subscription.tier}</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <p className="text-sm text-secondary-500">Statut</p>
                      <p className={`text-sm font-medium ${
                        subscription.status === 'active' 
                          ? 'text-green-700' 
                          : subscription.status === 'past_due' 
                            ? 'text-red-700' 
                            : 'text-yellow-700'
                      }`}>
                        {subscription.status === 'active' 
                          ? subscription.cancel_at_period_end 
                            ? 'Annulé (fin de période)' 
                            : 'Actif' 
                          : subscription.status === 'past_due' 
                            ? 'Paiement en retard' 
                            : 'Annulé'}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <p className="text-sm text-secondary-500">Renouvellement</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {subscription.cancel_at_period_end 
                          ? 'Aucun renouvellement prévu' 
                          : `${formatDate(subscription.current_period_end, 'PPP')}`}
                      </p>
                      {!subscription.cancel_at_period_end && (
                        <p className="text-xs text-secondary-500">
                          Dans {getRemainingDays(subscription.current_period_end)} jours
                        </p>
                      )}
                    </div>
                    <div className="mt-4 md:mt-0">
                      {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                        <button
                          onClick={handleCancelSubscription}
                          className="inline-flex items-center px-3 py-2 border border-secondary-300 shadow-sm text-sm leading-4 font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Annuler l'abonnement
                        </button>
                      )}
                      {subscription.status === 'active' && subscription.cancel_at_period_end && (
                        <button
                          onClick={async () => {
                            try {
                              const { error } = await supabase
                                .from('subscriptions')
                                .update({
                                  cancel_at_period_end: false,
                                })
                                .eq('id', subscription.id);
                              
                              if (error) throw error;
                              
                              toast.success('Votre abonnement sera renouvelé automatiquement.');
                              fetchSubscriptionData();
                            } catch (error) {
                              console.error('Error reactivating subscription:', error);
                              toast.error('Erreur lors de la réactivation de l\'abonnement');
                            }
                          }}
                          className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Réactiver l'abonnement
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Payment method */}
                {subscription.payment_method && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-secondary-900 mb-2">Moyen de paiement</h3>
                    <div className="flex items-center">
                      <svg className="h-6 w-6 text-secondary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="ml-2 text-sm text-secondary-700">{subscription.payment_method}</span>
                    </div>
                  </div>
                )}
                
                {/* Invoices */}
                {invoices.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-secondary-900 mb-2">Factures récentes</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-secondary-200">
                        <thead className="bg-secondary-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                              Montant
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                              Statut
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                              Facture
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-secondary-200">
                          {invoices.map((invoice) => (
                            <tr key={invoice.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                                {formatDate(invoice.created_at, 'PPP')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                                {invoice.amount} {invoice.currency.toUpperCase()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  invoice.status === 'paid' 
                                    ? 'bg-green-100 text-green-800' 
                                    : invoice.status === 'open' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-secondary-100 text-secondary-800'
                                }`}>
                                  {invoice.status === 'paid' ? 'Payée' : invoice.status === 'open' ? 'En attente' : 'Annulée'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                                {invoice.invoice_pdf && (
                                  <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-900">
                                    Télécharger
                                  </a>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : user.subscription_tier === 'free_trial' ? (
              <div>
                <h2 className="text-lg font-medium text-secondary-900 mb-4">Période d'essai</h2>
                <div className="bg-primary-50 p-4 rounded-md">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm text-primary-700">
                        Vous êtes actuellement en période d'essai gratuite.
                      </p>
                      <p className="text-sm font-medium text-primary-900 mt-1">
                        Votre période d'essai se termine le {user.trial_ends_at ? formatDate(user.trial_ends_at, 'PPP') : 'bientôt'}.
                      </p>
                      {user.trial_ends_at && (
                        <p className="text-xs text-primary-700 mt-1">
                          Dans {getTrialRemainingDays()} jours
                        </p>
                      )}
                    </div>
                    <div className="mt-4 md:mt-0">
                      <p className="text-sm text-primary-700">
                        Choisissez un forfait ci-dessous pour continuer à utiliser le service après votre période d'essai.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-medium text-secondary-900 mb-4">Aucun abonnement actif</h2>
                <p className="text-sm text-secondary-500">
                  Vous n'avez pas d'abonnement actif. Choisissez un forfait ci-dessous pour commencer.
                </p>
              </div>
            )}
          </div>

          {/* Pricing plans */}
          <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
            {pricingTiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative p-8 bg-white border rounded-2xl shadow-sm flex flex-col ${
                  tier.popular
                    ? 'border-primary-500 ring-1 ring-primary-500'
                    : 'border-secondary-200'
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 transform rounded-full bg-primary-500 py-1 px-4 text-xs font-semibold text-white">
                    Populaire
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-secondary-900">{tier.name}</h3>
                  <p className="mt-4 flex items-baseline text-secondary-900">
                    <span className="text-4xl font-extrabold tracking-tight">{tier.price}</span>
                    <span className="ml-1 text-xl font-semibold">€</span>
                    <span className="ml-2 text-base font-medium text-secondary-500">/mois</span>
                  </p>
                  <p className="mt-6 text-secondary-500">
                    Tout ce dont vous avez besoin pour gérer vos rendez-vous via WhatsApp.
                  </p>

                  <ul role="list" className="mt-6 space-y-4">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex">
                        <svg
                          className="flex-shrink-0 w-6 h-6 text-green-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="ml-3 text-secondary-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={processingPayment || (subscription?.tier === tier.id && subscription?.status === 'active' && !subscription?.cancel_at_period_end)}
                  className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${
                    tier.popular
                      ? 'bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-300'
                      : 'bg-secondary-50 text-secondary-700 hover:bg-secondary-100 disabled:bg-secondary-50 disabled:text-secondary-400'
                  } disabled:cursor-not-allowed`}
                >
                  {processingPayment 
                    ? 'Traitement...' 
                    : subscription?.tier === tier.id && subscription?.status === 'active'
                      ? subscription?.cancel_at_period_end
                        ? 'Réactiver'
                        : 'Abonnement actuel'
                      : tier.cta}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-12 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-secondary-900 mb-6">Questions fréquentes</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-secondary-900">Puis-je changer de forfait à tout moment ?</h3>
                <p className="mt-2 text-sm text-secondary-500">
                  Oui, vous pouvez passer à un forfait supérieur à tout moment. Le changement prendra effet immédiatement et nous calculerons le prorata pour le reste de votre période de facturation.
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-secondary-900">Comment fonctionne la période d'essai ?</h3>
                <p className="mt-2 text-sm text-secondary-500">
                  Vous bénéficiez de 14 jours d'essai gratuit avec accès à toutes les fonctionnalités. Aucune carte de crédit n'est requise pour commencer. À la fin de votre période d'essai, vous devrez choisir un forfait pour continuer à utiliser le service.
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-secondary-900">Quelle est la politique de remboursement ?</h3>
                <p className="mt-2 text-sm text-secondary-500">
                  Si vous n'êtes pas satisfait de notre service, contactez-nous dans les 14 jours suivant votre premier paiement pour un remboursement complet, sans questions.
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-secondary-900">Comment puis-je annuler mon abonnement ?</h3>
                <p className="mt-2 text-sm text-secondary-500">
                  Vous pouvez annuler votre abonnement à tout moment depuis cette page. Votre abonnement restera actif jusqu'à la fin de la période de facturation en cours, puis ne sera pas renouvelé.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
