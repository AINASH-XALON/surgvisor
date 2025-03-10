import React, { Suspense } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import Navbar from './components/Navbar'
import LoadingSpinner from './components/LoadingSpinner'

// Dynamically import components
const Dashboard = dynamic(() => import('./pages/Dashboard'), { loading: () => <LoadingSpinner /> })
const FaceScanner = dynamic(() => import('./pages/FaceScanner'), { loading: () => <LoadingSpinner /> })
const SurgerySimulator = dynamic(() => import('./pages/SurgerySimulator'), { loading: () => <LoadingSpinner /> })
const Reports = dynamic(() => import('./pages/Reports'), { loading: () => <LoadingSpinner /> })
const FindSurgeon = dynamic(() => import('./pages/FindSurgeon'), { loading: () => <LoadingSpinner /> })

function App() {
  const router = useRouter()

  // Render the appropriate component based on the current route
  const renderContent = () => {
    switch (router.pathname) {
      case '/':
        return <Dashboard />
      case '/scan':
        return <FaceScanner />
      case '/simulate':
        return <SurgerySimulator />
      case '/reports':
        return <Reports />
      case '/find-surgeon':
        return <FindSurgeon />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          {renderContent()}
        </Suspense>
      </main>
    </div>
  )
}

export default App 