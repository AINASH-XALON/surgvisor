import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { db } from '../../config/firebase'
import { doc, setDoc } from 'firebase/firestore'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const SUBSCRIPTION_PRICE_ID = process.env.STRIPE_SUBSCRIPTION_PRICE_ID

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { paymentMethodId, userId } = req.body

  if (!paymentMethodId || !userId) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  try {
    // Create a customer
    const customer = await stripe.customers.create({
      payment_method: paymentMethodId,
      email: req.body.email,
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    })

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: SUBSCRIPTION_PRICE_ID }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    })

    // Store subscription info in Firestore
    await setDoc(doc(db, 'subscriptions', userId), {
      customerId: customer.id,
      subscriptionId: subscription.id,
      status: subscription.status,
      createdAt: new Date().toISOString(),
      priceId: SUBSCRIPTION_PRICE_ID
    })

    res.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any).payment_intent.client_secret
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    res.status(500).json({
      error: 'An error occurred while creating the subscription'
    })
  }
} 