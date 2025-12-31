import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET || '', {
  apiVersion: '2024-12-18.acacia',
});

export default stripe;

