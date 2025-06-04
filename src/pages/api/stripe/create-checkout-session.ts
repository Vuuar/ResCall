import type { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { subscriptionPlans } from '@/data/subscriptionPlans';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, userId } = req.body;

    if (!planId || !userId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get the plan details
    const plan = subscriptionPlans.find((p) => p.id === planId);
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    // Get the user from Supabase
    const { data: user, error: userError } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return res.status(400).json({ error: 'User not found' });
    }

    // Create or retrieve the Stripe customer
    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      // Update the user with the Stripe customer ID
      await supabase
        .from('professionals')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: userId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `WhatsApp Booking Assistant - ${plan.name}`,
              description: plan.description,
            },
            unit_amount: plan.price * 100, // Convert to cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        plan: planId,
      },
      success_url: `${req.headers.origin}/dashboard/subscription?success=true`,
      cancel_url: `${req.headers.origin}/dashboard/subscription?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: error.message });
  }
}
