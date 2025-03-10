import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../config/firebase'
import { doc, getDoc } from 'firebase/firestore'

interface Subscription {
  status: 'active' | 'canceled' | 'expired'
  currentPeriodEnd: string
  planId: string
  subscriptionId: string
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    let isMounted = true

    const fetchSubscription = async () => {
      if (!user) {
        if (isMounted) {
          setSubscription(null)
          setLoading(false)
          setError(null)
        }
        return
      }

      try {
        const subscriptionRef = doc(db, 'subscriptions', user.uid)
        const subscriptionDoc = await getDoc(subscriptionRef)

        if (!isMounted) return

        if (subscriptionDoc.exists()) {
          const data = subscriptionDoc.data()
          // Validate the subscription data
          if (
            data &&
            typeof data.status === 'string' &&
            typeof data.currentPeriodEnd === 'string' &&
            typeof data.planId === 'string' &&
            typeof data.subscriptionId === 'string'
          ) {
            setSubscription(data as Subscription)
          } else {
            console.error('Invalid subscription data:', data)
            setSubscription(null)
          }
        } else {
          setSubscription(null)
        }
        setError(null)
      } catch (err) {
        console.error('Error fetching subscription:', err)
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch subscription'))
          setSubscription(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchSubscription()

    return () => {
      isMounted = false
    }
  }, [user])

  const isSubscriptionActive = subscription?.status === 'active'
  const daysUntilExpiration = subscription?.currentPeriodEnd
    ? Math.max(
        0,
        Math.ceil(
          (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0

  return {
    subscription,
    loading,
    error,
    isSubscriptionActive,
    daysUntilExpiration
  }
} 