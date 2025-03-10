import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(router.pathname)

  return (
    <>
      {!isAuthPage && <Layout>
        <Component {...pageProps} />
      </Layout>}
      {isAuthPage && <Component {...pageProps} />}
    </>
  )
} 