"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import LandingPage from '@/components/landing/LandingPage';
import LanguageSelection from '@/components/landing/LanguageSelection';
import LocationSelection from '@/components/landing/LocationSelection';
import LoadingScreen from '@/components/landing/LoadingScreen';

export default function App() {
  const router = useRouter();
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
    type: 'tween' as const,
    ease: 'easeInOut',
    duration: 1.2
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleGetStarted = () => {
    nextStep();
  };

  const handleLanguageSelect = (language: string, languageCode: string) => {
    setSelectedLanguage(language);
    setSelectedLanguageCode(languageCode);
    nextStep();
  };

  const handleLocationComplete = (district: string, college: string) => {
    setSelectedDistrict(district);
    setSelectedCollege(college);
    nextStep();
  };

  const handleLoadingComplete = () => {
    router.push('/login');
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
            <LandingPage onGetStarted={handleGetStarted} />
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
            <LanguageSelection onLanguageSelect={handleLanguageSelect} />
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
              onComplete={handleLoadingComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
