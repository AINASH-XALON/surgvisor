import { useRouter } from 'next/router';
import Link from 'next/link';
import { auth } from '../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const Navbar = () => {
  const router = useRouter();
  const [user] = useAuthState(auth);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
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
                <Link href="/" className="text-gray-700 hover:text-indigo-600">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
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
  );
};

export default Navbar; 