import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, BookOpen, Users, MapPin, Globe, LogIn } from 'lucide-react';

interface LoadingScreenProps {
  language: string;
  languageCode: string;
  district: string;
  college: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ language, languageCode, district, college }) => {
  console.log('LoadingScreen rendered with:', { language, languageCode, district, college });
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const translations = {
    en: {
      welcomeTitle: 'Welcome to eduVision!',
      welcomeMessage: 'Your personalized educational platform is ready. Start exploring courses, connect with peers, and achieve your academic goals.',
      yourProfile: 'Your Profile:',
      language: 'Language',
      location: 'Location',
      institution: 'Institution',
      loginNow: 'Login Now',
      settingUpLanguage: 'Setting up your language preferences',
      configuringFor: 'Configuring interface for',
      connectingLocation: 'Connecting to your location',
      findingResources: 'Finding resources in',
      preparingProfile: 'Preparing your college profile',
      settingUpInfo: 'Setting up information for',
      personalizingExperience: 'Personalizing your experience',
      customizingContent: 'Customizing content based on your preferences',
      settingUpText: 'Setting up your personalized learning experience...'
    },
    mr: {
      welcomeTitle: 'eduVision मध्ये आपले स्वागत!',
      welcomeMessage: 'तुमचे वैयक्तिकृत शैक्षणिक प्लॅटफॉर्म तयार आहे. अभ्यासक्रम एक्सप्लोर करा, सहकाऱ्यांशी जुडा आणि तुमची शैक्षणिक उद्दिष्टे साध्य करा.',
      yourProfile: 'तुमची प्रोफाइल:',
      language: 'भाषा',
      location: 'स्थान',
      institution: 'संस्था',
      loginNow: 'आता लॉगिन करा',
      settingUpLanguage: 'तुमच्या भाषा प्राधान्ये सेट करत आहे',
      configuringFor: 'साठी इंटरफेस कॉन्फिगर करत आहे',
      connectingLocation: 'तुमच्या स्थानाशी कनेक्ट करत आहे',
      findingResources: 'मध्ये संसाधने शोधत आहे',
      preparingProfile: 'तुमची कॉलेज प्रोफाइल तयार करत आहे',
      settingUpInfo: 'साठी माहिती सेट करत आहे',
      personalizingExperience: 'तुमचा अनुभव वैयक्तिकृत करत आहे',
      customizingContent: 'तुमच्या प्राधान्यानुसार सामग्री सानुकूलित करत आहे',
      settingUpText: 'तुमचे वैयक्तिकृत शिक्षण अनुभव सेट करत आहे...'
    },
    hi: {
      welcomeTitle: 'eduVision में आपका स्वागत है!',
      welcomeMessage: 'आपका व्यक्तिगत शैक्षणिक प्लेटफॉर्म तैयार है। पाठ्यक्रमों का अन्वेषण करें, साथियों से जुड़ें और अपने शैक्षणिक लक्ष्य प्राप्त करें।',
      yourProfile: 'आपकी प्रोफ़ाइल:',
      language: 'भाषा',
      location: 'स्थान',
      institution: 'संस्थान',
      loginNow: 'अभी लॉगिन करें',
      settingUpLanguage: 'आपकी भाषा प्राथमिकताएं सेट कर रहे हैं',
      configuringFor: 'के लिए इंटरफेस कॉन्फिगर कर रहे हैं',
      connectingLocation: 'आपके स्थान से कनेक्ट कर रहे हैं',
      findingResources: 'में संसाधन खोज रहे हैं',
      preparingProfile: 'आपकी कॉलेज प्रोफ़ाइल तैयार कर रहे हैं',
      settingUpInfo: 'के लिए जानकारी सेट कर रहे हैं',
      personalizingExperience: 'आपके अनुभव को व्यक्तिगत बना रहे हैं',
      customizingContent: 'आपकी प्राथमिकताओं के आधार पर सामग्री को अनुकूलित कर रहे हैं',
      settingUpText: 'आपका व्यक्तिगत शिक्षण अनुभव सेट कर रहे हैं...'
    }
  };

  const currentTranslation = translations[languageCode as keyof typeof translations] || translations.en;

  const loadingSteps = [
    {
      icon: Globe,
      title: currentTranslation.settingUpLanguage,
      description: `${currentTranslation.configuringFor} ${language}`,
      duration: 2000
    },
    {
      icon: MapPin,
      title: currentTranslation.connectingLocation,
      description: `${currentTranslation.findingResources} ${district}`,
      duration: 2500
    },
    {
      icon: BookOpen,
      title: currentTranslation.preparingProfile,
      description: `${currentTranslation.settingUpInfo} ${college}`,
      duration: 2000
    },
    {
      icon: Users,
      title: currentTranslation.personalizingExperience,
      description: currentTranslation.customizingContent,
      duration: 1500
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < loadingSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsComplete(true);
      }
    }, loadingSteps[currentStep]?.duration || 2000);

    return () => clearTimeout(timer);
  }, [currentStep, loadingSteps]);

  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="text-center max-w-md mx-auto w-full"
        >
          {/* Success Icon */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>

          {/* Success Message */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-2xl md:text-3xl font-bold text-gray-900 mb-4"
          >
            {currentTranslation.welcomeTitle}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-base text-gray-600 mb-6 px-2"
          >
            {currentTranslation.welcomeMessage}
          </motion.p>

          {/* User Selection Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/20 mb-6"
          >
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">{currentTranslation.yourProfile}</h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-900">{currentTranslation.language}</span>
                </div>
                <span className="text-gray-600">{language}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-900">{currentTranslation.location}</span>
                </div>
                <span className="text-gray-600">{district}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-900">{currentTranslation.institution}</span>
                </div>
                <span className="text-gray-600 text-xs">{college}</span>
              </div>
            </div>
          </motion.div>

          {/* Login Button */}
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2"
            onClick={() => window.location.reload()}
          >
            <LogIn className="w-5 h-5" />
            <span>{currentTranslation.loginNow}</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6">
      <div className="max-w-md mx-auto w-full text-center">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">eduVision</h1>
        </motion.div>

        {/* Loading Steps */}
        <div className="space-y-6 mb-8">
          {loadingSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ 
                opacity: index <= currentStep ? 1 : 0.3,
                x: 0 
              }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-3"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                index < currentStep 
                  ? 'bg-green-500' 
                  : index === currentStep 
                  ? 'bg-blue-600' 
                  : 'bg-gray-300'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <step.icon className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900 text-sm">{step.title}</h3>
                <p className="text-xs text-gray-600">{step.description}</p>
              </div>
              {index === currentStep && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full bg-gray-200 rounded-full h-2 mb-4"
        >
          <motion.div
            className="bg-gradient-to-r from-blue-600 to-indigo-700 h-2 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep + 1) / loadingSteps.length) * 100}%` }}
            transition={{ duration: 0.8 }}
          />
        </motion.div>

        <p className="text-sm text-gray-600">
          {currentTranslation.settingUpText}
        </p>

        {/* Progress Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 flex justify-center space-x-2"
        >
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;