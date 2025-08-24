'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SimpleFaceCaptureePage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string>('')
  const [captureStatus, setCaptureStatus] = useState<string>('waiting')
  const [error, setError] = useState<string | null>(null)

  // Get user email on component mount
  useEffect(() => {
    const getUserEmail = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      } else {
        setError('Please log in to continue')
      }
    }
    getUserEmail()
  }, [])

  // Listen for messages from Python Flask app
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'http://localhost:5000') return
      
      const { type, data } = event.data
      if (type === 'FACE_CAPTURED') {
        setCaptureStatus('captured')
        // Auto-redirect after successful capture
        setTimeout(() => {
          router.push('/auth/pending-approval')
        }, 2000)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 mb-4">⚠️ Error</div>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => router.push('/auth/login')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border-0">
          <div className="text-center p-6 border-b">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Capture Your Photo
            </h1>
            <p className="text-lg text-gray-600">
              Take a clear photo for verification
            </p>
          </div>
          
          <div className="p-6">
            {captureStatus === 'captured' ? (
              <div className="text-center">
                <div className="text-green-600 text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Face Captured Successfully!</h2>
                <p className="text-gray-600 mb-4">Redirecting to pending approval...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-6">
                  <div className="rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-black">
                    <iframe
                      src={`http://localhost:5000?email=${encodeURIComponent(userEmail)}`}
                      width="540"
                      height="380"
                      className="w-full h-auto border-0"
                      title="Face Detection Camera"
                      allow="camera"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Position your face in the camera frame. The system will automatically detect and capture when ready.
                    </p>
                    <button
                      onClick={() => window.open(`http://localhost:5000?email=${encodeURIComponent(userEmail)}`, '_blank')}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg px-8 py-3 text-lg rounded-lg"
                    >
                      🔗 Open in New Tab
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
