import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import LanguageSelection from './components/LanguageSelection';
import LocationSelection from './components/LocationSelection';
import LoadingScreen from './components/LoadingScreen';

console.log('App component loaded - checking navigation flow');
console.log('Current step:', 0);

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedLanguageCode, setSelectedLanguageCode] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');

  const steps = [
    'landing',
    'language',
    'location',
    'loading'
  ];

  const slideVariants = {
    initial: { x: '100%', opacity: 0 },
    in: { x: 0, opacity: 1 },
    out: { x: '-100%', opacity: 0 }
  };

  const transition = {
    duration: 0.5
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLanguageSelect = (language: string, languageCode: string) => {
    setSelectedLanguage(language);
    setSelectedLanguageCode(languageCode);
    nextStep();
  };

  const handleLocationComplete = (district: string, college: string) => {
    console.log('App - handleLocationComplete called with:', { district, college });
    setSelectedDistrict(district);
    setSelectedCollege(college);
    console.log('App - calling nextStep to go to loading screen');
    nextStep();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      <AnimatePresence mode="wait">
        {steps[currentStep] === 'landing' && (
          <motion.div
            key="landing"
            initial="initial"
            animate="in"
            exit="out"
            variants={slideVariants}
            transition={transition}
            className="absolute inset-0"
          >
            <LandingPage onGetStarted={nextStep} />
          </motion.div>
        )}

        {steps[currentStep] === 'language' && (
          <motion.div
            key="language"
            initial="initial"
            animate="in"
            exit="out"
            variants={slideVariants}
            transition={transition}
            className="absolute inset-0"
          >
            <LanguageSelection onLanguageSelect={handleLanguageSelect} onBack={prevStep} />
          </motion.div>
        )}

        {steps[currentStep] === 'location' && (
          <motion.div
            key="location"
            initial="initial"
            animate="in"
            exit="out"
            variants={slideVariants}
            transition={transition}
            className="absolute inset-0"
          >
            <LocationSelection 
              onComplete={handleLocationComplete} 
              onBack={prevStep}
              selectedLanguage={selectedLanguageCode}
            />
          </motion.div>
        )}

        {steps[currentStep] === 'loading' && (
          <motion.div
            key="loading"
            initial="initial"
            animate="in"
            exit="out"
            variants={slideVariants}
            transition={transition}
            className="absolute inset-0"
          >
            <LoadingScreen 
              language={selectedLanguage}
              languageCode={selectedLanguageCode}
              district={selectedDistrict}
              college={selectedCollege}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}