import { ReactNode } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { auth } from '../config/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const [user] = useAuthState(auth)

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-indigo-600">SurgiVision™</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/find-surgeon" className="text-gray-700 hover:text-indigo-600">
                    Find Surgeon
                  </Link>
                  <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">
                    Dashboard
                  </Link>
                  <button
                    onClick={() => auth.signOut()}
                    className="text-gray-700 hover:text-indigo-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-indigo-600">
                    Login
                  </Link>
                  <Link href="/signup" className="text-gray-700 hover:text-indigo-600">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
} 