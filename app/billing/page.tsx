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
  icon: React.ComponentType<{ className?: string }>
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
    id: 'standard',
    name: 'Standard Package',
    credits: 50,
    price: 15,
    bonus: 0,
    popular: true,
    icon: Zap,
  },
]

// Subscriptions removed - only one-time credit purchases available

export default function BillingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null)

  // Fetch transactions when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      fetchTransactions()
    }
  }, [status])

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Credits & Billing</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Purchase credits to create AI-generated videos
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
                    {session?.user?.credits || 0}
                  </div>
                  <div className="text-2xl text-gray-600">credits</div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {(session?.user?.credits || 0) > 0
                    ? `Can create ${Math.floor((session?.user?.credits || 0) / 10)} videos (10 seconds each)`
                    : 'Purchase credits below to start creating videos'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Packages */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-2">Buy Credits</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            50 credits = 5 videos of 10 seconds each • $0.30 per credit
          </p>
          <div className="flex justify-center">
            {creditPackages.map((pkg) => {
              const Icon = pkg.icon
              return (
                <Card
                  key={pkg.id}
                  className={`relative hover:shadow-xl transition-all max-w-md w-full ${
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
                    <CardDescription>Create 5 videos of 10 seconds each</CardDescription>
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
                        50 credits (5 videos × 10 seconds)
                      </li>
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
                        $0.30 per credit (flat rate)
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
