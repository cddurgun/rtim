import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

// Initialize Stripe with API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
})

// Credit package configuration for Stripe
export const CREDIT_PACKAGES = {
  standard: {
    id: 'standard',
    name: 'Standard Package',
    credits: 50,
    priceUSD: 15,
    description: '50 credits - Create 5 videos of 10 seconds each',
  },
}

// Get package by ID
export function getCreditPackage(packageId: string) {
  if (packageId === 'standard') {
    return CREDIT_PACKAGES.standard
  }
  return null
}
