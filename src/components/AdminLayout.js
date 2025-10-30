import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

const AdminLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  if (!currentUser || currentUser.role !== 'Admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Unauthorized Access</h2>
          <p>You don't have permission to view this page.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard</title>
        <meta name="description" content="Admin dashboard" />
      </Head>
      
      <div className="min-h-screen bg-gray-100">
        
        <main className="py-10">
          {children}
        </main>
      </div>
    </>
  );
};

export default AdminLayout;