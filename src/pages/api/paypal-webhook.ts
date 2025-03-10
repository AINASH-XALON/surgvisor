import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../config/firebase'
import { doc, setDoc } from 'firebase/firestore'
import paypal from '@paypal/checkout-server-sdk'

// Type declarations to help with PayPal types
type PayPalEnvironment = any
type PayPalClient = any
type WebhookEvent = {
  event_type: string
  resource: {
    id: string
    custom_id?: string
    status?: string
    billing_info?: {
      next_billing_time?: string
    }
    plan_id?: string
  }
}

const getPayPalClient = (): { client: PayPalClient, environment: PayPalEnvironment } => {
  const Environment = process.env.NODE_ENV === 'production'
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment

  const environment = new Environment(
    process.env.PAYPAL_CLIENT_ID || '',
    process.env.PAYPAL_CLIENT_SECRET || ''
  )

  return {
    environment,
    client: new paypal.core.PayPalHttpClient(environment)
  }
}

const verifyWebhookSignature = async (
  event: WebhookEvent,
  headers: NextApiRequest['headers'],
  webhookId: string
): Promise<boolean> => {
  try {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'

    const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PAYPAL_ACCESS_TOKEN || ''}`
      },
      body: JSON.stringify({
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: event
      })
    })

    const verification = await response.json()
    return verification.verification_status === 'SUCCESS'
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return false
  }
}

const updateSubscriptionInFirestore = async (
  userId: string,
  subscriptionId: string,
  status: 'active' | 'canceled' | 'expired',
  planId?: string,
  currentPeriodEnd?: string
) => {
  try {
    const data: Record<string, any> = {
      status,
      subscriptionId,
      updatedAt: new Date().toISOString()
    }

    if (planId) {
      data.planId = planId
    }

    if (currentPeriodEnd) {
      data.currentPeriodEnd = currentPeriodEnd
    }

    await setDoc(doc(db, 'subscriptions', userId), data, { merge: true })
  } catch (error) {
    console.error('Failed to update subscription in Firestore:', error)
    throw error
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    if (!webhookId) {
      throw new Error('Missing PAYPAL_WEBHOOK_ID environment variable')
    }

    const event = req.body as WebhookEvent
    if (!event || !event.resource || !event.resource.id) {
      return res.status(400).json({ message: 'Invalid webhook payload' })
    }

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(event, req.headers, webhookId)
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid webhook signature' })
    }

    const subscriptionId = event.resource.id
    const customId = event.resource.custom_id // This is the user ID we passed

    if (!customId) {
      return res.status(400).json({ message: 'Missing custom_id (user ID) in webhook payload' })
    }

    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.UPDATED':
        await updateSubscriptionInFirestore(
          customId,
          subscriptionId,
          'active',
          event.resource.plan_id,
          event.resource.billing_info?.next_billing_time
        )
        break

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await updateSubscriptionInFirestore(
          customId,
          subscriptionId,
          event.event_type === 'BILLING.SUBSCRIPTION.CANCELLED' ? 'canceled' : 'expired'
        )
        break

      default:
        console.log(`Unhandled event type: ${event.event_type}`)
    }

    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 