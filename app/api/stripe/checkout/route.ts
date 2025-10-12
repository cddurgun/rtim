import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// Note: Install Stripe SDK with: npm install stripe
// For now, this is a mock implementation

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { packageId: _packageId, type: _type } = body

    // TODO: Implement actual Stripe integration
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    //
    // const checkoutSession = await stripe.checkout.sessions.create({
    //   customer_email: session.user.email,
    //   mode: type === 'subscription' ? 'subscription' : 'payment',
    //   line_items: [
    //     {
    //       price: getPriceId(packageId),
    //       quantity: 1,
    //     },
    //   ],
    //   success_url: `${process.env.NEXTAUTH_URL}/billing?success=true`,
    //   cancel_url: `${process.env.NEXTAUTH_URL}/billing?canceled=true`,
    //   metadata: {
    //     userId: session.user.id,
    //     packageId,
    //     type,
    //   },
    // })
    //
    // return NextResponse.json({ sessionUrl: checkoutSession.url })

    // Mock response for demo
    return NextResponse.json({
      sessionUrl: '/billing?demo=true',
      message: 'Stripe integration pending. Install stripe package and configure API keys.',
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
