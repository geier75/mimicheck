// src/api/functions.js - Robuste Functions mit Fallback
import { mimitech } from './mimitechClient';

// Check if functions are available
const functions = mimitech?.functions || {};

// Mock functions for local development
const mockFunction = (name) => async (...args) => {
  console.warn(`[Mock] ${name} called with:`, args);
  return { success: true, mock: true, function: name };
};

export const validateStripeSetup = functions.validateStripeSetup || mockFunction('validateStripeSetup');

export const createStripeCheckoutSession = functions.createStripeCheckoutSession || (async (plan) => {
  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8000";
  const res = await fetch(`${apiBase}/api/billing/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
    credentials: "include"
  });
  if (!res.ok) throw new Error("Checkout failed");
  return res.json();
});

export const createCustomerPortalSession = functions.createCustomerPortalSession || (async () => {
  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8000";
  const res = await fetch(`${apiBase}/api/billing/portal`, {
    method: "GET",
    credentials: "include"
  });
  if (!res.ok) throw new Error("Portal failed");
  return res.json();
});

export const stripeWebhookHandler = functions.stripeWebhookHandler || mockFunction('stripeWebhookHandler');

export const autoSetupStripe = functions.autoSetupStripe || mockFunction('autoSetupStripe');

export const exportUserData = functions.exportUserData || mockFunction('exportUserData');

export const deleteUserAccount = functions.deleteUserAccount || mockFunction('deleteUserAccount');

export const fillPdfForm = functions.fillPdfForm || mockFunction('fillPdfForm');

export const analyzePdfFields = functions.analyzePdfFields || mockFunction('analyzePdfFields');

