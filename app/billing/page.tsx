'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Loader2, Check, Zap, Crown, Rocket, CreditCard, Download, Calendar, TrendingUp, Coins } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  bonus: number
  popular?: boolean
  icon: any
}

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  createdAt: string
  balanceAfter: number
}

const creditPackages: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 100,
    price: 15,
    bonus: 0,
    icon: Zap,
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 500,
    price: 60,
    bonus: 50,
    popular: true,
    icon: Crown,
  },
  {
    id: 'business',
    name: 'Business',
    credits: 2000,
    price: 200,
    bonus: 300,
    icon: Rocket,
  },
]

const subscriptionPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    credits: 200,
    features: [
      '200 credits/month',
      '5 concurrent jobs',
      'Standard support',
      'All models access',
      'Basic analytics',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    credits: 800,
    features: [
      '800 credits/month',
      '10 concurrent jobs',
      'Priority queue',
      'Advanced features',
      'Team collaboration',
      'API access',
      'Advanced analytics',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    credits: 3000,
    features: [
      '3000 credits/month',
      'Unlimited concurrent jobs',
      'Dedicated support',
      'Custom integrations',
      'White-label options',
      'SLA guarantee',
      'Advanced security',
    ],
  },
]

export default function BillingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null)

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/signin')
    return null
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchase = async (packageId: string, type: 'credits' | 'subscription') => {
    setIsPurchasing(packageId)
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId, type }),
      })

      if (response.ok) {
        const { sessionUrl } = await response.json()
        // Redirect to Stripe checkout
        window.location.href = sessionUrl
      } else {
        alert('Failed to create checkout session')
      }
    } catch (error) {
      alert('Failed to process purchase')
    } finally {
      setIsPurchasing(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Credits & Billing</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your credits, subscriptions, and billing information
          </p>
        </div>

        {/* Current Balance */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Current Balance
                </div>
                <div className="flex items-center space-x-3">
                  <Coins className="h-8 w-8 text-blue-600" />
                  <div className="text-5xl font-bold text-blue-900 dark:text-blue-100">
                    {session?.user?.credits || 100}
                  </div>
                  <div className="text-2xl text-gray-600">credits</div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Approximately {((session?.user?.credits || 100) / 10).toFixed(0)} seconds of video at standard quality
                </div>
              </div>
              <div className="text-right">
                <Badge className="mb-2">
                  {session?.user?.tier || 'BASIC'} Plan
                </Badge>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Next renewal: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Packages */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Buy Credits</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {creditPackages.map((pkg) => {
              const Icon = pkg.icon
              return (
                <Card
                  key={pkg.id}
                  className={`relative hover:shadow-xl transition-all ${
                    pkg.popular ? 'border-2 border-blue-500 shadow-lg' : ''
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${pkg.popular ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <Icon className={`h-8 w-8 ${pkg.popular ? 'text-blue-600' : 'text-gray-600'}`} />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                    <CardDescription>Perfect for getting started</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <div className="text-4xl font-bold mb-2">${pkg.price}</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {pkg.credits} credits
                        {pkg.bonus > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            +{pkg.bonus} bonus
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-600 mr-2" />
                        One-time purchase
                      </li>
                      <li className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-600 mr-2" />
                        Credits never expire
                      </li>
                      <li className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-600 mr-2" />
                        All features included
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={pkg.popular ? 'default' : 'outline'}
                      onClick={() => handlePurchase(pkg.id, 'credits')}
                      disabled={isPurchasing === pkg.id}
                    >
                      {isPurchasing === pkg.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Purchase
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-2">Subscription Plans</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Save up to 30% with monthly subscriptions
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative hover:shadow-xl transition-all ${
                  plan.popular ? 'border-2 border-purple-500 shadow-lg' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white">Best Value</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>Monthly subscription</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="text-4xl font-bold mb-2">
                      ${plan.price}
                      <span className="text-lg text-gray-600 font-normal">/month</span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {plan.credits} credits/month
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handlePurchase(plan.id, 'subscription')}
                    disabled={isPurchasing === plan.id}
                  >
                    {isPurchasing === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Subscribe Now'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your recent credit and billing activity</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${transaction.amount > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        <TrendingUp className={`h-5 w-5 ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(transaction.createdAt).toLocaleDateString()} at {new Date(transaction.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Balance: {transaction.balanceAfter}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
