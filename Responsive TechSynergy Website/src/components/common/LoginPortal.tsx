import { motion } from "motion/react";
import { useState } from "react";
import { PageType } from "../../types";

interface LoginPortalProps {
  type: 'student' | 'faculty' | 'university' | 'expert';
  setCurrentPage: (page: PageType) => void;
}

export function LoginPortal({ type, setCurrentPage }: LoginPortalProps) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'expert' && credentials.email === 'sanketg367@gmail.com' && credentials.password === 'sanku@99') {
      setCurrentPage('admin-portal');
    } else {
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} login functionality would be implemented here`);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'student': return 'Student Login';
      case 'faculty': return 'Faculty Login';
      case 'university': return 'University Login';
      case 'expert': return 'Expert Login';
      default: return 'Login';
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gray-100 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div 
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        <h2 className="text-2xl font-semibold text-center mb-6">{getTitle()}</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#3171DE] to-[#704AF2] text-white py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            Login
          </button>
        </form>
        <button
          onClick={() => setCurrentPage('home')}
          className="w-full mt-4 text-gray-600 hover:text-gray-800"
        >
          Back to Home
        </button>
      </motion.div>
    </motion.div>
  );
}