import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LanguageSelectionProps {
  onLanguageSelect: (language: string, languageCode: string) => void;
}

const LanguageSelection: React.FC<LanguageSelectionProps> = ({ onLanguageSelect }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇬🇧'
    },
    {
      code: 'mr',
      name: 'Marathi',
      nativeName: 'मराठी',
      flag: '🇮🇳'
    },
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      flag: '🇮🇳'
    }
  ];

  const translations = {
    en: {
      title: 'Choose Your Language',
      subtitle: 'Select your preferred language to continue with EduVision',
      next: 'Next'
    },
    mr: {
      title: 'तुमची भाषा निवडा',
      subtitle: 'EduVision सह सुरू ठेवण्यासाठी तुमची पसंतीची भाषा निवडा',
      next: 'पुढे'
    },
    hi: {
      title: 'अपनी भाषा चुनें',
      subtitle: 'EduVision के साथ जारी रखने के लिए अपनी पसंदीदा भाषा चुनें',
      next: 'अगला'
    }
  };

  const currentTranslation = translations[selectedLanguage as keyof typeof translations] || translations.en;

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    const language = languages.find(lang => lang.code === languageCode);
    if (language) {
      setTimeout(() => {
        onLanguageSelect(language.name, languageCode);
      }, 300);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-6">
      <div className="max-w-md mx-auto w-full">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {currentTranslation.title}
          </h1>
          <p className="text-gray-600 text-sm">
            {currentTranslation.subtitle}
          </p>
        </motion.div>

        {/* Language Options */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-3 mb-8"
        >
          {languages.map((language, index) => (
            <motion.button
              key={language.code}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              onClick={() => handleLanguageSelect(language.code)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${
                selectedLanguage === language.code
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{language.flag}</span>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{language.name}</div>
                  <div className="text-sm text-gray-500">{language.nativeName}</div>
                </div>
              </div>
              {selectedLanguage === language.code && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex justify-center space-x-2 mb-6"
        >
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-6 h-2 bg-blue-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <p className="text-xs text-gray-500">
            Step 1 of 3 - Language Selection
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LanguageSelection;
