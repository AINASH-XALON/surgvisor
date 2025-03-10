import { AppProps } from 'next/app'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Layout from '../components/Layout'
import '../styles/globals.css'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Elements stripe={stripePromise}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Elements>
  )
}

export default MyApp 