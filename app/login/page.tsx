export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to EduVision</h1>
            <p className="text-gray-600">Choose your access type</p>
          </div>
          
          <div className="space-y-4">
            <a 
              href="/auth/complete-registration" 
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
            >
              New User Registration
            </a>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or access directly</span>
              </div>
            </div>
            
            <a 
              href="/student-dashboard" 
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-center block"
            >
              Student Dashboard
            </a>
            
            <a 
              href="/dashboard" 
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors text-center block"
            >
              Faculty Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
