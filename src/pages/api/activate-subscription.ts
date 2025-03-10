import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../config/firebase'
import { doc, setDoc } from 'firebase/firestore'
import paypal from '@paypal/checkout-server-sdk'

const environment = process.env.NODE_ENV === 'production'
  ? new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID!,
      process.env.PAYPAL_CLIENT_SECRET!
    )
  : new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID!,
      process.env.PAYPAL_CLIENT_SECRET!
    )

const client = new paypal.core.PayPalHttpClient(environment)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { subscriptionId, userId, planId } = req.body

    if (!subscriptionId || !userId || !planId) {
      return res.status(400).json({ message: 'Missing required parameters' })
    }

    // Verify subscription with PayPal
    const request = new paypal.subscriptions.SubscriptionsGetRequest(subscriptionId)
    const response = await client.execute(request)
    const subscription = response.result

    if (subscription.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Subscription is not active' })
    }

    // Store subscription in Firestore
    const subscriptionData = {
      status: 'active',
      planId,
      subscriptionId,
      currentPeriodEnd: new Date(subscription.billing_info.next_billing_time).toISOString(),
      createdAt: new Date().toISOString()
    }

    await setDoc(doc(db, 'subscriptions', userId), subscriptionData, { merge: true })

    return res.status(200).json({ message: 'Subscription activated successfully' })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 