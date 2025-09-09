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
    
    // Expert login
    if (type === 'expert' && credentials.email === 'sanketg367@gmail.com' && credentials.password === 'sanku@99') {
      setCurrentPage('admin-portal');
      return;
    }
    
    // Student login with demo credentials
    if (type === 'student') {
      // Check for PRN format (2024CSE0001) or email format
      const isPRN = /^\d{4}[A-Z]{2,4}\d{4}$/.test(credentials.email);
      const isValidEmail = credentials.email.includes('@') || isPRN;
      
      if ((credentials.email === '2024CSE0001' || credentials.email === '2024CSE0001@sanjivani.edu.in') && 
          credentials.password === 'student123') {
        // Store student session data
        const studentData = {
          id: 'demo-student-1',
          prn: '2024CSE0001',
          name: 'Demo Student',
          email: '2024CSE0001@sanjivani.edu.in',
          department: 'Computer Science Engineering',
          year: 'first',
          status: 'active',
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('student_session', JSON.stringify(studentData));
        localStorage.setItem('studentSession', JSON.stringify(studentData));
        localStorage.setItem('currentUser', JSON.stringify(studentData));
        
        // Redirect to student dashboard
        window.location.href = '/student-dashboard';
        return;
      }
      
      // Check for other valid demo credentials patterns
      if (isPRN && credentials.password === 'student123') {
        const studentData = {
          id: `demo-student-${credentials.email.slice(-4)}`,
          prn: credentials.email,
          name: `Demo Student ${credentials.email.slice(-4)}`,
          email: `${credentials.email}@sanjivani.edu.in`,
          department: 'Computer Science Engineering',
          year: 'first',
          status: 'active',
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('student_session', JSON.stringify(studentData));
        localStorage.setItem('studentSession', JSON.stringify(studentData));
        localStorage.setItem('currentUser', JSON.stringify(studentData));
        
        // Redirect to student dashboard
        window.location.href = '/student-dashboard';
        return;
      }
    }
    
    // Faculty login with demo credentials
    if (type === 'faculty') {
      // Demo faculty credentials
      if (credentials.email === 'faculty@sanjivani.edu.in' && credentials.password === 'faculty123') {
        const facultyData = {
          id: 'demo-faculty-1',
          employee_id: 'FAC2024001',
          name: 'Demo Faculty',
          email: 'faculty@sanjivani.edu.in',
          department: 'Computer Science Engineering',
          designation: 'Assistant Professor',
          status: 'active',
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('faculty_session', JSON.stringify(facultyData));
        localStorage.setItem('facultySession', JSON.stringify(facultyData));
        localStorage.setItem('currentUser', JSON.stringify(facultyData));
        
        // Redirect to faculty dashboard
        window.location.href = '/dashboard';
        return;
      }
      
      alert('Invalid email or password. Demo credentials: faculty@sanjivani.edu.in / faculty123');
      return;
    }
    
    // Invalid credentials
    alert('Invalid PRN or password. Please check your credentials and try again.');
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
        {type === 'student' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-1">Demo Credentials:</h4>
            <p className="text-xs text-blue-600">PRN: 2024CSE0001</p>
            <p className="text-xs text-blue-600">Password: student123</p>
          </div>
        )}
        {type === 'faculty' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <h4 className="text-sm font-medium text-green-800 mb-1">Demo Credentials:</h4>
            <p className="text-xs text-green-600">Email: faculty@sanjivani.edu.in</p>
            <p className="text-xs text-green-600">Password: faculty123</p>
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {type === 'student' ? 'PRN or Email' : 'Email'}
            </label>
            <input
              type="text"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={type === 'student' ? 'Enter your PRN (e.g., 2024CSE0001)' : 'Enter your email'}
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