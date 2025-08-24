import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Globe, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface LanguageSelectionProps {
  onLanguageSelect: (language: string, languageCode: string) => void;
  onBack: () => void;
}

const LanguageSelection: React.FC<LanguageSelectionProps> = ({ onLanguageSelect, onBack }) => {
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
      subtitle: 'Select your preferred language to continue with eduVision',
      next: 'Next'
    },
    mr: {
      title: 'तुमची भाषा निवडा',
      subtitle: 'eduVision सह सुरू ठेवण्यासाठी तुमची पसंतीची भाषा निवडा',
      next: 'पुढे'
    },
    hi: {
      title: 'अपनी भाषा चुनें',
      subtitle: 'eduVision के साथ जारी रखने के लिए अपनी पसंदीदा भाषा चुनें',
      next: 'अगला'
    }
  };

  const currentLang = selectedLanguage || 'en';
  const currentTranslation = translations[currentLang as keyof typeof translations] || translations.en;

  const handleLanguageClick = (language: any) => {
    setSelectedLanguage(language.code);
  };

  const handleNext = () => {
    console.log('LanguageSelection - handleNext called', { selectedLanguage });
    if (selectedLanguage) {
      const selectedLang = languages.find(lang => lang.code === selectedLanguage);
      console.log('LanguageSelection - calling onLanguageSelect');
      onLanguageSelect(selectedLang?.name || '', selectedLanguage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-6">
      <div className="max-w-md mx-auto w-full">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <motion.h1 
            key={`title-${currentLang}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl md:text-3xl font-bold text-gray-900 mb-4"
          >
            {currentTranslation.title}
          </motion.h1>
          <motion.p 
            key={`subtitle-${currentLang}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-base text-gray-600 px-2"
          >
            {currentTranslation.subtitle}
          </motion.p>
        </motion.div>

        {/* Language Options */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-3 mb-8"
        >
          {languages.map((language, index) => (
            <motion.button
              key={language.code}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              onClick={() => handleLanguageClick(language)}
              className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left ${
                selectedLanguage === language.code
                  ? 'border-blue-600 bg-blue-50 shadow-lg scale-[1.02]'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{language.flag}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {language.name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {language.nativeName}
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  selectedLanguage === language.code
                    ? 'border-blue-600 bg-blue-600 scale-110'
                    : 'border-gray-300'
                }`}>
                  {selectedLanguage === language.code && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-white" 
                    />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex space-x-4"
        >
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 py-4 rounded-2xl border-gray-300 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!selectedLanguage}
            className={`flex-1 py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all duration-300 ${
              selectedLanguage
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <motion.span
              key={`next-${currentLang}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {currentTranslation.next}
            </motion.span>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 flex justify-center space-x-2"
        >
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default LanguageSelection;