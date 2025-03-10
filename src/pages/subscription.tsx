import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../hooks/useSubscription'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: '9.99',
    features: [
      'Basic face scanning',
      'Limited surgery simulations',
      'Basic surgery reports',
      'Access to surgeon directory'
    ],
    planId: process.env.NEXT_PUBLIC_PAYPAL_BASIC_PLAN_ID
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '19.99',
    features: [
      'Advanced face & body scanning',
      'Unlimited surgery simulations',
      'Detailed AI surgery reports',
      'Priority surgeon matching',
      'Video consultations'
    ],
    planId: process.env.NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID
  }
]

export default function Subscription() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const { subscription, isSubscriptionActive, daysUntilExpiration } = useSubscription()

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.uid,
        }),
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong. Please try again.')
    }
  }

  return (
    <PayPalScriptProvider options={{ 
      "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
      vault: true,
      intent: "subscription"
    }}>
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Choose Your Plan
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Select the plan that best fits your needs
            </p>
          </div>

          {isSubscriptionActive && (
            <div className="mt-8 p-4 bg-white rounded-lg shadow">
              <p className="text-lg font-medium text-gray-900">
                Current Subscription Status
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Your subscription is active and will renew in {daysUntilExpiration} days
              </p>
              <button
                onClick={handleManageSubscription}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                disabled={loading}
              >
                Manage Subscription
              </button>
            </div>
          )}

          <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-lg shadow-lg divide-y divide-gray-200"
              >
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="mt-4 text-3xl font-extrabold text-gray-900">
                    ${plan.price}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">per month</p>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-6 w-6 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-700">{feature}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <PayPalButtons
                      createSubscription={(data, actions) => {
                        return actions.subscription.create({
                          plan_id: plan.planId!,
                          custom_id: user?.uid
                        })
                      }}
                      onApprove={async (data, actions) => {
                        // Call your backend to record the subscription
                        await fetch('/api/activate-subscription', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            subscriptionId: data.subscriptionID,
                            userId: user?.uid,
                            planId: plan.planId
                          }),
                        })
                        router.push('/dashboard')
                      }}
                      style={{
                        layout: 'horizontal',
                        color: 'blue',
                        shape: 'rect',
                        label: 'subscribe'
                      }}
                      disabled={loading || (isSubscriptionActive && subscription?.planId === plan.planId)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  )
} 