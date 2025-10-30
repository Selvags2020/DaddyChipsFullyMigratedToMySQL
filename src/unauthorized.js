import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Unauthorized() {
  const router = useRouter()
  const { message } = router.query

  // Optional: Redirect to login after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login')
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-5xl mb-4 text-red-500">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">401 - Unauthorized</h1>
        <p className="text-gray-600 mb-6">
          {message || "You don't have permission to access this page."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <a className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Go Home
            </a>
          </Link>
          <Link href="/login">
            <a className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition">
              Login
            </a>
          </Link>
        </div>
      </div>
    </div>
  )
}