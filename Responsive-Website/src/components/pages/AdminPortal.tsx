import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { PageType, ContentData, Department, DepartmentData, FacultyMember, ManagementMember } from "../../types";
import { loadContentFromDatabase, saveContentToDatabase, uploadImageToStorage } from "../../utils/supabase";
import { ImageCropper } from "../common/ImageCropper";
import { 
  Home, 
  User, 
  Newspaper, 
  Star, 
  BarChart3, 
  Settings, 
  Save, 
  Upload, 
  Eye, 
  LogOut,
  Building,
  Users,
  GraduationCap,
  Shield,
  Cpu,
  Brain,
  BookOpen,
  Plus,
  Trash2,
  Edit3
} from "lucide-react";

// Default content data with all required fields
const getDefaultContentData = (): ContentData => ({
  id: '1',
  heroTitle: 'Welcome to EduVision',
  heroSubtitle: 'Shaping Tomorrow\'s Leaders Through Quality Education',
  heroLabel: 'Sanjivani University',
  expertName: 'Sanket Gaikwad',
  expertImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  newsItems: [
    {
      id: '1',
      title: '2024 Placement Record: 95% Success Rate',
      description: 'Our students achieved outstanding placement results with top companies like Google, Microsoft, and Amazon recruiting from our campus.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      author: 'Placement Cell',
      color: '#E27244'
    }
  ],
  whyUsFeatures: [
    {
      id: '1',
      title: 'AI Assignment Assistance',
      description: 'Advanced AI-powered tools help students with personalized learning experiences and automated assignment support.',
      background: 'bg-white'
    }
  ],
  departments: [
    {
      icon: "computer",
      title: "Computer Science and Engineering",
      description: "Comprehensive program covering software development, algorithms, data structures, and cutting-edge technologies.",
      color: "#66B066",
      page: "cse-dept",
    },
    {
      icon: "security",
      title: "Cyber Security",
      description: "Advanced cybersecurity education focusing on ethical hacking, network security, and digital forensics.",
      color: "#704AF2",
      page: "cyber-dept",
    },
    {
      icon: "ai",
      title: "Artificial Intelligence and Data Science",
      description: "Explore machine learning, deep learning, and big data analytics to solve real-world problems.",
      color: "#F3BC4C",
      page: "ai-dept",
    },
    {
      icon: "ml",
      title: "AI/ML (Artificial Intelligence/Machine Learning)",
      description: "Specialized focus on neural networks, computer vision, and natural language processing.",
      color: "#E27244",
      page: "aiml-dept",
    },
  ],
  departmentData: {
    'cse-dept': {
      title: "Computer Science and Engineering",
      hodName: "Dr. Mahendra Gawali",
      hodImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      faculty: [
        {
          name: "Prof. Anil Sharma",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          quote: "Innovation distinguishes between a leader and a follower.",
          qualification: "Ph.D in Computer Science, 15+ years experience"
        }
      ]
    }
  },
  managementTeam: [
    {
      name: "Dr. Amit Kolhe",
      position: "President",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      isPresident: true,
    }
  ]
});

interface AdminPortalProps {
  setCurrentPage: (page: PageType) => void;
  onContentUpdate?: (data: ContentData) => void;
}

export function AdminPortal({ setCurrentPage, onContentUpdate }: AdminPortalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [contentData, setContentData] = useState<ContentData>(getDefaultContentData());
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const data = await loadContentFromDatabase();
      if (data) {
        setContentData(data);
      } else {
        setContentData(getDefaultContentData());
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setContentData(getDefaultContentData());
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'sanketg367@gmail.com' && password === 'sanku@99') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleSaveContent = async () => {
    if (!contentData) {
      alert('No content data to save');
      return;
    }

    setSaveStatus('saving');
    try {
      const success = await saveContentToDatabase(contentData);
      if (success) {
        setSaveStatus('saved');
        // Notify parent component about content update
        if (onContentUpdate) {
          onContentUpdate(contentData);
        }
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        setShowImageCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCroppedImage = async (croppedImage: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
      
      const publicUrl = await uploadImageToStorage(file, `expert/${Date.now()}.jpg`);
      
      if (publicUrl) {
        const updatedContent = { ...contentData, expertImage: publicUrl };
        setContentData(updatedContent);
        await saveContentToDatabase(updatedContent);
        if (onContentUpdate) {
          onContentUpdate(updatedContent);
        }
        alert('Image updated successfully!');
      } else {
        alert('Error uploading image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setIsLoading(false);
      setShowImageCropper(false);
      setSelectedImage('');
    }
  };

  const updateNewsItem = (index: number, field: string, value: string) => {
    const updatedNewsItems = [...(contentData?.newsItems || [])];
    if (updatedNewsItems[index]) {
      updatedNewsItems[index] = { ...updatedNewsItems[index], [field]: value };
      const updatedContent = { ...contentData, newsItems: updatedNewsItems };
      setContentData(updatedContent);
      if (onContentUpdate) {
        onContentUpdate(updatedContent);
      }
    }
  };

  const updateFeature = (index: number, field: string, value: string) => {
    const updatedFeatures = [...(contentData?.whyUsFeatures || [])];
    if (updatedFeatures[index]) {
      updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
      const updatedContent = { ...contentData, whyUsFeatures: updatedFeatures };
      setContentData(updatedContent);
      if (onContentUpdate) {
        onContentUpdate(updatedContent);
      }
    }
  };

  const updateDepartment = (index: number, field: string, value: string) => {
    const updatedDepartments = [...(contentData?.departments || [])];
    if (updatedDepartments[index]) {
      updatedDepartments[index] = { ...updatedDepartments[index], [field]: value };
      const updatedContent = { ...contentData, departments: updatedDepartments };
      setContentData(updatedContent);
      if (onContentUpdate) {
        onContentUpdate(updatedContent);
      }
    }
  };

  const updateDepartmentData = (deptKey: string, field: string, value: string) => {
    const updatedDeptData = { ...contentData.departmentData };
    if (updatedDeptData[deptKey]) {
      updatedDeptData[deptKey] = { ...updatedDeptData[deptKey], [field]: value };
      const updatedContent = { ...contentData, departmentData: updatedDeptData };
      setContentData(updatedContent);
      if (onContentUpdate) {
        onContentUpdate(updatedContent);
      }
    }
  };

  const updateFaculty = (deptKey: string, facultyIndex: number, field: string, value: string) => {
    const updatedDeptData = { ...contentData.departmentData };
    if (updatedDeptData[deptKey] && updatedDeptData[deptKey].faculty[facultyIndex]) {
      updatedDeptData[deptKey].faculty[facultyIndex] = {
        ...updatedDeptData[deptKey].faculty[facultyIndex],
        [field]: value
      };
      const updatedContent = { ...contentData, departmentData: updatedDeptData };
      setContentData(updatedContent);
      if (onContentUpdate) {
        onContentUpdate(updatedContent);
      }
    }
  };

  const addFaculty = (deptKey: string) => {
    const updatedDeptData = { ...contentData.departmentData };
    if (updatedDeptData[deptKey]) {
      const newFaculty: FacultyMember = {
        name: "New Faculty Member",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        quote: "Enter inspiring quote here",
        qualification: "Enter qualification here"
      };
      updatedDeptData[deptKey].faculty.push(newFaculty);
      const updatedContent = { ...contentData, departmentData: updatedDeptData };
      setContentData(updatedContent);
      if (onContentUpdate) {
        onContentUpdate(updatedContent);
      }
    }
  };

  const removeFaculty = (deptKey: string, facultyIndex: number) => {
    const updatedDeptData = { ...contentData.departmentData };
    if (updatedDeptData[deptKey]) {
      updatedDeptData[deptKey].faculty.splice(facultyIndex, 1);
      const updatedContent = { ...contentData, departmentData: updatedDeptData };
      setContentData(updatedContent);
      if (onContentUpdate) {
        onContentUpdate(updatedContent);
      }
    }
  };

  const updateManagement = (index: number, field: string, value: string | boolean) => {
    const updatedManagement = [...(contentData?.managementTeam || [])];
    if (updatedManagement[index]) {
      updatedManagement[index] = { ...updatedManagement[index], [field]: value };
      const updatedContent = { ...contentData, managementTeam: updatedManagement };
      setContentData(updatedContent);
      if (onContentUpdate) {
        onContentUpdate(updatedContent);
      }
    }
  };

  const safeUpdateContentData = (field: string, value: string) => {
    const updatedContent = { ...contentData, [field]: value };
    setContentData(updatedContent);
    if (onContentUpdate) {
      onContentUpdate(updatedContent);
    }
  };

  const getIconComponent = (iconName: string, className: string = "w-5 h-5") => {
    switch (iconName) {
      case 'computer': return <Cpu className={className} />;
      case 'security': return <Shield className={className} />;
      case 'ai': return <Brain className={className} />;
      case 'ml': return <BookOpen className={className} />;
      default: return <GraduationCap className={className} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div 
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-indigo-600/20"></div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-white/20 backdrop-blur rounded-full mx-auto mb-4 flex items-center justify-center relative z-10"
            >
              <Settings className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h2 
              className="text-2xl font-bold text-white relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Admin Portal
            </motion.h2>
            <motion.p 
              className="text-blue-100 mt-2 relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              EduVision Content Management System
            </motion.p>
          </div>

          {/* Form */}
          <motion.div 
            className="p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your admin email"
                    required
                  />
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <Settings className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Authenticating...
                  </div>
                ) : (
                  <>
                    <Settings className="w-5 h-5 mr-2" />
                    Access Admin Portal
                  </>
                )}
              </motion.button>
            </form>

            <motion.button
              onClick={() => setCurrentPage('home')}
              className="w-full mt-6 text-gray-500 hover:text-gray-700 transition-colors font-medium flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div 
        className="bg-white shadow-sm border-b border-gray-200"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                <Settings className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">EduVision CMS</h1>
                <p className="text-sm text-gray-500">Content Management System</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                onClick={handleSaveContent}
                disabled={isLoading || saveStatus === 'saving'}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                  saveStatus === 'saved' 
                    ? 'bg-green-500 text-white' 
                    : saveStatus === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-50`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save className="w-4 h-4 mr-2" />
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error!' : 'Save All Changes'}
              </motion.button>

              <motion.button
                onClick={() => setCurrentPage('home')}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Site
              </motion.button>
              
              <motion.button
                onClick={() => {
                  setIsAuthenticated(false);
                  setEmail('');
                  setPassword('');
                  setContentData(getDefaultContentData());
                }}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <motion.div 
            className="w-72 bg-white rounded-2xl shadow-sm p-6 h-fit"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <nav className="space-y-2">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
                { id: 'content', name: 'Hero Content', icon: Home },
                { id: 'departments', name: 'Departments', icon: Building },
                { id: 'faculty', name: 'Faculty Management', icon: Users },
                { id: 'management', name: 'Management Team', icon: GraduationCap },
                { id: 'expert', name: 'Expert Profile', icon: User },
                { id: 'news', name: 'News & Updates', icon: Newspaper },
                { id: 'features', name: 'Features', icon: Star },
              ].map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </motion.button>
              ))}
            </nav>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back! 👋</h2>
                  <p className="text-gray-600 mb-8">Manage your EduVision website content from this comprehensive dashboard.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { title: 'Departments', value: contentData?.departments?.length || 0, icon: Building, color: 'blue' },
                      { title: 'Faculty Members', value: Object.values(contentData?.departmentData || {}).reduce((acc, dept) => acc + dept.faculty.length, 0), icon: Users, color: 'green' },
                      { title: 'News Articles', value: contentData?.newsItems?.length || 0, icon: Newspaper, color: 'purple' },
                      { title: 'Features', value: contentData?.whyUsFeatures?.length || 0, icon: Star, color: 'orange' }
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                          <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: 'Edit Hero', tab: 'content', icon: Home },
                      { name: 'Manage Departments', tab: 'departments', icon: Building },
                      { name: 'Faculty Management', tab: 'faculty', icon: Users },
                      { name: 'Update News', tab: 'news', icon: Newspaper }
                    ].map((action, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setActiveTab(action.tab)}
                        className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <action.icon className="w-8 h-8 mb-2 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{action.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hero Section Content</h2>
                    <p className="text-gray-600 mt-1">Manage your homepage hero section</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">University Label</label>
                    <input
                      type="text"
                      value={contentData?.heroLabel || ''}
                      onChange={(e) => safeUpdateContentData('heroLabel', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter university label"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Main Title</label>
                    <input
                      type="text"
                      value={contentData?.heroTitle || ''}
                      onChange={(e) => safeUpdateContentData('heroTitle', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter main title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
                    <textarea
                      value={contentData?.heroSubtitle || ''}
                      onChange={(e) => safeUpdateContentData('heroSubtitle', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter subtitle"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'departments' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Department Management</h2>
                    <p className="text-gray-600 mt-1">Manage department information and details</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {contentData?.departments?.map((dept, index) => (
                    <motion.div
                      key={index}
                      className="bg-gray-50 rounded-xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          {getIconComponent(dept.icon, "w-8 h-8 mr-3")}
                          <h3 className="text-lg font-semibold text-gray-900">Department {index + 1}</h3>
                        </div>
                        <div 
                          className="w-8 h-8 rounded-full" 
                          style={{ backgroundColor: dept.color }}
                        ></div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Department Name</label>
                          <input
                            type="text"
                            value={dept.title}
                            onChange={(e) => updateDepartment(index, 'title', e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter department name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                          <input
                            type="color"
                            value={dept.color}
                            onChange={(e) => updateDepartment(index, 'color', e.target.value)}
                            className="w-full h-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            value={dept.description}
                            onChange={(e) => updateDepartment(index, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter department description"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'faculty' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Faculty Management</h2>
                    <p className="text-gray-600 mt-1">Manage HODs and faculty members for each department</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {Object.entries(contentData?.departmentData || {}).map(([deptKey, deptData]) => (
                    <motion.div
                      key={deptKey}
                      className="border border-gray-200 rounded-xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">{deptData.title}</h3>
                      
                      {/* HOD Section */}
                      <div className="bg-blue-50 rounded-xl p-6 mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <GraduationCap className="w-5 h-5 mr-2" />
                          Head of Department
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">HOD Name</label>
                            <input
                              type="text"
                              value={deptData.hodName}
                              onChange={(e) => updateDepartmentData(deptKey, 'hodName', e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter HOD name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">HOD Image URL</label>
                            <input
                              type="url"
                              value={deptData.hodImage}
                              onChange={(e) => updateDepartmentData(deptKey, 'hodImage', e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter image URL"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Faculty Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            Faculty Members
                          </h4>
                          <motion.button
                            onClick={() => addFaculty(deptKey)}
                            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Faculty
                          </motion.button>
                        </div>

                        <div className="space-y-4">
                          {deptData.faculty.map((faculty, facultyIndex) => (
                            <div key={facultyIndex} className="bg-gray-50 rounded-xl p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="text-md font-semibold text-gray-900">Faculty Member {facultyIndex + 1}</h5>
                                <motion.button
                                  onClick={() => removeFaculty(deptKey, facultyIndex)}
                                  className="flex items-center px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                  <input
                                    type="text"
                                    value={faculty.name}
                                    onChange={(e) => updateFaculty(deptKey, facultyIndex, 'name', e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter faculty name"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                                  <input
                                    type="url"
                                    value={faculty.image}
                                    onChange={(e) => updateFaculty(deptKey, facultyIndex, 'image', e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter image URL"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Quote</label>
                                  <input
                                    type="text"
                                    value={faculty.quote}
                                    onChange={(e) => updateFaculty(deptKey, facultyIndex, 'quote', e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter inspiring quote"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                                  <input
                                    type="text"
                                    value={faculty.qualification}
                                    onChange={(e) => updateFaculty(deptKey, facultyIndex, 'qualification', e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter qualification"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'management' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Management Team</h2>
                    <p className="text-gray-600 mt-1">Manage university leadership and management</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {contentData?.managementTeam?.map((member, index) => (
                    <motion.div
                      key={index}
                      className={`rounded-xl p-6 ${member.isPresident ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          {member.isPresident && <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />}
                          {member.isPresident ? 'President' : `Management Member ${index + 1}`}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => updateManagement(index, 'name', e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                          <input
                            type="text"
                            value={member.position}
                            onChange={(e) => updateManagement(index, 'position', e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter position"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                          <input
                            type="url"
                            value={member.image}
                            onChange={(e) => updateManagement(index, 'image', e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter image URL"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'expert' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Expert Profile</h2>
                    <p className="text-gray-600 mt-1">Manage expert information and photo</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Expert Name</label>
                    <input
                      type="text"
                      value={contentData?.expertName || ''}
                      onChange={(e) => safeUpdateContentData('expertName', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter expert name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">Expert Photo</label>
                    <div className="flex items-center space-x-6">
                      <motion.div
                        className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100"
                        whileHover={{ scale: 1.05 }}
                      >
                        <img 
                          src={contentData?.expertImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'} 
                          alt="Expert" 
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                      
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG files. Max size: 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'news' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">News & Achievements</h2>
                    <p className="text-gray-600 mt-1">Manage news articles and updates</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {contentData?.newsItems?.map((item, index) => (
                    <motion.div
                      key={item.id || index}
                      className="bg-gray-50 rounded-xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">News Article {index + 1}</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                          <input
                            type="text"
                            value={item.title || ''}
                            onChange={(e) => updateNewsItem(index, 'title', e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter news title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            value={item.description || ''}
                            onChange={(e) => updateNewsItem(index, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter news description"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                            <input
                              type="text"
                              value={item.author || ''}
                              onChange={(e) => updateNewsItem(index, 'author', e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter author name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                            <input
                              type="color"
                              value={item.color || '#E27244'}
                              onChange={(e) => updateNewsItem(index, 'color', e.target.value)}
                              className="w-full h-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Why Choose EduVision</h2>
                    <p className="text-gray-600 mt-1">Manage feature highlights</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {contentData?.whyUsFeatures?.map((feature, index) => (
                    <motion.div
                      key={feature.id || index}
                      className="bg-gray-50 rounded-xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature {index + 1}</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                          <input
                            type="text"
                            value={feature.title || ''}
                            onChange={(e) => updateFeature(index, 'title', e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter feature title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            value={feature.description || ''}
                            onChange={(e) => updateFeature(index, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter feature description"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="bg-white rounded-2xl p-8 flex items-center space-x-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-lg font-medium text-gray-900">Processing...</span>
          </motion.div>
        </motion.div>
      )}

      {/* Image Cropper Modal */}
      {showImageCropper && (
        <ImageCropper
          src={selectedImage}
          onCrop={handleCroppedImage}
          onClose={() => {
            setShowImageCropper(false);
            setSelectedImage('');
          }}
        />
      )}
    </div>
  );
}