/**
 * Stripe Payment Integration for Flinkly
 * Handles payment intents, escrow, and payouts
 */

// Mock Stripe integration (replace with actual Stripe SDK in production)
// In production: import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  client_secret: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'sepa_debit' | 'klarna' | 'ideal';
  last4?: string;
}

/**
 * Create a payment intent with authorization-only (for escrow)
 */
export async function createPaymentIntent(params: {
  amount: number; // in cents
  currency?: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  paymentMethod?: string;
}): Promise<PaymentIntent> {
  const { amount, currency = 'EUR', orderId, buyerId, sellerId, paymentMethod } = params;

  // Mock implementation - replace with actual Stripe call
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount,
  //   currency: currency.toLowerCase(),
  //   capture_method: 'manual', // Authorize only, capture later (escrow)
  //   payment_method_types: ['card', 'sepa_debit', 'klarna'],
  //   metadata: {
  //     orderId,
  //     buyerId,
  //     sellerId,
  //   },
  // });

  // Mock response
  const mockPaymentIntent: PaymentIntent = {
    id: `pi_mock_${Date.now()}`,
    amount,
    currency,
    status: 'requires_payment_method',
    client_secret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
  };

  return mockPaymentIntent;
}

/**
 * Confirm payment intent
 */
export async function confirmPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
  // Mock implementation
  // const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

  const mockPaymentIntent: PaymentIntent = {
    id: paymentIntentId,
    amount: 15000, // Mock amount
    currency: 'EUR',
    status: 'succeeded',
    client_secret: `${paymentIntentId}_secret`,
  };

  return mockPaymentIntent;
}

/**
 * Capture authorized payment (release from escrow)
 */
export async function capturePayment(paymentIntentId: string): Promise<PaymentIntent> {
  // Mock implementation
  // const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

  const mockPaymentIntent: PaymentIntent = {
    id: paymentIntentId,
    amount: 15000,
    currency: 'EUR',
    status: 'succeeded',
    client_secret: `${paymentIntentId}_secret`,
  };

  return mockPaymentIntent;
}

/**
 * Refund payment
 */
export async function refundPayment(paymentIntentId: string, amount?: number): Promise<{ id: string; status: string }> {
  // Mock implementation
  // const refund = await stripe.refunds.create({
  //   payment_intent: paymentIntentId,
  //   amount, // Optional: partial refund
  // });

  return {
    id: `re_mock_${Date.now()}`,
    status: 'succeeded',
  };
}

/**
 * Create payout to seller
 */
export async function createPayout(params: {
  sellerId: string;
  amount: number; // in cents
  currency?: string;
}): Promise<{ id: string; status: string }> {
  const { sellerId, amount, currency = 'EUR' } = params;

  // Mock implementation
  // Requires Stripe Connect setup
  // const payout = await stripe.payouts.create({
  //   amount,
  //   currency: currency.toLowerCase(),
  //   destination: sellerStripeAccountId, // From Stripe Connect
  // });

  return {
    id: `po_mock_${Date.now()}`,
    status: 'pending',
  };
}

/**
 * Get payment methods for a customer
 */
export async function getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
  // Mock implementation
  // const paymentMethods = await stripe.paymentMethods.list({
  //   customer: customerId,
  //   type: 'card',
  // });

  return [
    {
      id: 'pm_mock_1',
      type: 'card',
      last4: '4242',
    },
  ];
}

/**
 * Calculate platform fee (10% of gig price)
 */
export function calculatePlatformFee(gigPrice: number): number {
  return Math.round(gigPrice * 0.1);
}

/**
 * Calculate payment processing fee (Stripe: 2.9% + 0.25€)
 */
export function calculateProcessingFee(amount: number): number {
  return Math.round(amount * 0.029 + 25); // 2.9% + 25 cents
}

/**
 * Calculate seller payout (after fees)
 */
export function calculateSellerPayout(gigPrice: number): {
  gigPrice: number;
  platformFee: number;
  processingFee: number;
  sellerPayout: number;
} {
  const platformFee = calculatePlatformFee(gigPrice);
  const processingFee = calculateProcessingFee(gigPrice);
  const sellerPayout = gigPrice - platformFee - processingFee;

  return {
    gigPrice,
    platformFee,
    processingFee,
    sellerPayout,
  };
}

/**
 * Calculate VAT based on country
 */
export function calculateVAT(amount: number, country: string): number {
  const vatRates: Record<string, number> = {
    DE: 0.19, // Germany: 19%
    AT: 0.20, // Austria: 20%
    CH: 0.077, // Switzerland: 7.7%
  };

  const rate = vatRates[country] || 0.19; // Default to DE
  return Math.round(amount * rate);
}

