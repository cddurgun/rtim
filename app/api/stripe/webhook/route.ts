import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature
    // Note: In production, you should set STRIPE_WEBHOOK_SECRET
    // For development without webhook secret, we'll parse the event directly
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } else {
      // Development mode - parse event without verification
      event = JSON.parse(body) as Stripe.Event
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const userId = session.metadata?.userId
    const credits = parseInt(session.metadata?.credits || '0')
    const packageId = session.metadata?.packageId

    if (!userId || !credits) {
      console.error('Missing metadata in checkout session:', session.id)
      return NextResponse.json(
        { error: 'Missing required metadata' },
        { status: 400 }
      )
    }

    try {
      // Add credits to user account
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            credits: {
              increment: credits,
            },
          },
        })

        // Create transaction record
        await tx.transaction.create({
          data: {
            userId,
            type: 'PURCHASE',
            amount: credits,
            balanceAfter: user.credits,
            description: `Purchased ${credits} credits via Stripe`,
            stripePaymentId: session.payment_intent as string,
            amountUSD: (session.amount_total || 0) / 100, // Convert cents to dollars
            metadata: {
              packageId,
              sessionId: session.id,
            },
          },
        })
      })

      console.log(`Successfully added ${credits} credits to user ${userId}`)
    } catch (error) {
      console.error('Error processing payment:', error)
      return NextResponse.json(
        { error: 'Failed to process payment' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}
