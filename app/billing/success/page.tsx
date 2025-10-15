'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newCredits, setNewCredits] = useState<number | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found')
      setIsVerifying(false)
      return
    }

    // In development, directly add credits since webhooks don't reach localhost
    const processPayment = async () => {
      try {
        const response = await fetch('/api/stripe/process-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        if (!response.ok) {
          setError('Failed to process payment')
        } else {
          const data = await response.json()
          console.log('Payment processing response:', data)
          setNewCredits(data.credits)
          console.log('Set new credits to:', data.credits)
        }
      } catch (err) {
        console.error('Error processing payment:', err)
        setError('Failed to process payment')
      } finally {
        setIsVerifying(false)
      }
    }

    processPayment()
  }, [sessionId])

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <h2 className="text-xl font-semibold">Processing your payment...</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we confirm your purchase
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="text-red-600 text-2xl">✕</span>
              </div>
              <h2 className="text-xl font-semibold">Payment Error</h2>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
              <Button onClick={() => router.push('/billing')}>
                Back to Billing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Payment Successful!</CardTitle>
          <CardDescription className="text-center">
            Your credits have been added to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Your new balance
            </p>
            <p className="text-3xl font-bold text-blue-600">
              {newCredits || 0} Credits
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              +50 credits added
            </p>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={() => window.location.href = '/generate'}
            >
              Start Creating Videos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/billing'}
            >
              View Billing History
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            A receipt has been sent to your email address
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <h2 className="text-xl font-semibold">Loading payment status...</h2>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
