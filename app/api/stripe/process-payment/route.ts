import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Retrieve the session from Stripe
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)

    if (!stripeSession) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 404 })
    }

    // Check if payment was successful
    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const userId = stripeSession.metadata?.userId || session.user.id
    const credits = parseInt(stripeSession.metadata?.credits || '50')
    const packageId = stripeSession.metadata?.packageId || 'standard'

    // Check if we already processed this payment
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        metadata: {
          path: ['sessionId'],
          equals: sessionId,
        },
      },
    })

    if (existingTransaction) {
      // Already processed - get current balance and return
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true }
      })

      return NextResponse.json({
        success: true,
        message: 'Credits already added',
        alreadyProcessed: true,
        credits: user?.credits || 0,
        added: credits
      })
    }

    // Add credits to user account
    const result = await prisma.$transaction(async (tx) => {
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
          stripePaymentId: stripeSession.payment_intent as string,
          amountUSD: (stripeSession.amount_total || 0) / 100,
          metadata: {
            packageId,
            sessionId,
          },
        },
      })

      return user
    })

    console.log(`✅ Added ${credits} credits to user ${userId}. New balance: ${result.credits}`)

    return NextResponse.json({
      success: true,
      credits: result.credits,
      added: credits
    })
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}
