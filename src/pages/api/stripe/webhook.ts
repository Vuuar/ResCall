import { buffer } from 'micro';
import type { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf.toString(),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      
      // Update user subscription
      if (session.client_reference_id && session.subscription) {
        await supabase
          .from('professionals')
          .update({
            subscription_tier: session.metadata.plan,
            subscription_status: 'active',
            trial_ends_at: null,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
          })
          .eq('id', session.client_reference_id);
      }
      break;
    }
    
    case 'customer.subscription.updated': {
      const subscription = event.data.object as any;
      
      // Find user by Stripe customer ID
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('stripe_customer_id', subscription.customer)
        .single();
      
      if (professional) {
        await supabase
          .from('professionals')
          .update({
            subscription_status: subscription.status,
          })
          .eq('id', professional.id);
      }
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as any;
      
      // Find user by Stripe customer ID
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('stripe_customer_id', subscription.customer)
        .single();
      
      if (professional) {
        await supabase
          .from('professionals')
          .update({
            subscription_status: 'inactive',
            subscription_tier: null,
          })
          .eq('id', professional.id);
      }
      break;
    }
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
}
