// /src/app/unauthorized/page.js
import Link from 'next/link'

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-5xl mb-4 text-red-500">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">401 - Unauthorized</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Go Home
          </Link>
          <Link 
            href="/login" 
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}