import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { PageType, Translation } from "../../types";
const logoImage = "/images/logo.svg";

// Import constants with error handling
let translations: Record<string, Translation> = {};
let languages: Array<{ code: string; name: string; flag: string }> = [];

// Default fallback values
const defaultTranslations: Record<string, Translation> = {
  en: {
    home: "Home",
    about: "About us", 
    departments: "Departments",
    campus: "Campus",
    contact: "Contact Us",
    login: "Login",
    universityName: "Sanjivani University",
    welcomeTitle: "Welcome to EduVision",
    welcomeSubtitle: "Shaping Tomorrow's Leaders Through Quality Education",
    exploreCourses: "Explore Courses"
  }
};

const defaultLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

// Load constants with error handling
(async () => {
  try {
    const constantsModule = await import('../../constants');
    translations = constantsModule.translations || defaultTranslations;
    languages = constantsModule.languages || defaultLanguages;
  } catch (error) {
    console.warn('Failed to load constants, using defaults:', error);
    translations = defaultTranslations;
    languages = defaultLanguages;
  }
})();

interface NavbarProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

export function Navbar({ currentPage, setCurrentPage, language, setLanguage }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  // Safe translation access with fallback
  const getTranslation = (lang: string) => {
    if (translations && translations[lang]) {
      return translations[lang];
    }
    if (translations && translations.en) {
      return translations.en;
    }
    return defaultTranslations.en;
  };
  
  const t = getTranslation(language);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      className={`w-full bg-white relative z-50 transition-all duration-300 ${isScrolled ? "shadow-md" : ""}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <motion.div
            className="flex-shrink-0 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage("home")}
          >
            <div className="h-10 w-10 sm:h-12 sm:w-12">
              <img
                src={logoImage}
                alt="EduVision Logo"
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden lg:block">
            <motion.div
              className="bg-[#f7f7fd] rounded-[50px] px-8 py-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="flex items-center space-x-12">
                <motion.button
                  onClick={() => setCurrentPage("home")}
                  className={`${currentPage === "home" ? "text-[#3056d3]" : "text-[#3d3d3d]"} font-semibold text-base`}
                  whileHover={{ scale: 1.05 }}
                >
                  {t.home}
                </motion.button>
                <motion.button
                  onClick={() => setCurrentPage("about")}
                  className={`${currentPage === "about" ? "text-[#3056d3]" : "text-[#3d3d3d]"} font-medium text-base hover:text-[#3056d3] transition-colors`}
                  whileHover={{ scale: 1.05 }}
                >
                  {t.about}
                </motion.button>
                <motion.button
                  onClick={() => setCurrentPage("departments")}
                  className={`${currentPage === "departments" ? "text-[#3056d3]" : "text-[#3d3d3d]"} font-medium text-base hover:text-[#3056d3] transition-colors`}
                  whileHover={{ scale: 1.05 }}
                >
                  {t.departments}
                </motion.button>
                <motion.button
                  onClick={() => setCurrentPage("campus")}
                  className={`${currentPage === "campus" ? "text-[#3056d3]" : "text-[#3d3d3d]"} font-medium text-base hover:text-[#3056d3] transition-colors`}
                  whileHover={{ scale: 1.05 }}
                >
                  {t.campus}
                </motion.button>
                <motion.button
                  onClick={() => setCurrentPage("contact")}
                  className={`${currentPage === "contact" ? "text-[#3056d3]" : "text-[#3d3d3d]"} font-medium text-base hover:text-[#3056d3] transition-colors`}
                  whileHover={{ scale: 1.05 }}
                >
                  {t.contact}
                </motion.button>
              </div>
            </motion.div>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Language Dropdown */}
            <div className="relative">
              <motion.button
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              >
                <span className="text-[#424242] text-sm">
                  {languages.find(l => l.code === language)?.flag || '🇺🇸'} {language.toUpperCase()}
                </span>
                <svg className="w-4 h-4 text-[#424242]" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M2.646 5.646a.5.5 0 0 1 .708 0L8 10.293l4.646-4.647a.5.5 0 0 1 .708.708L8.354 11.354a.5.5 0 0 1-.708 0L2.646 6.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </motion.button>

              {showLanguageDropdown && (
                <motion.div
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {(languages.length > 0 ? languages : defaultLanguages).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLanguageDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Login Button */}
            <motion.button
              className="bg-gradient-to-r from-[#3171DE] to-[#704AF2] text-white px-6 py-3 rounded-[50px] font-medium text-base hover:opacity-90 transition-opacity"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(113, 74, 242, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage("student-login")}
            >
              {t.login}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}