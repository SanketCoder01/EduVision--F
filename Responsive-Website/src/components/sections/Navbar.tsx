import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { PageType, Translation } from "../../types";
import { Menu, X } from "lucide-react";
import imgScreenshot20230807At4301 from "figma:asset/e2f4b616009f3e7f4c0f99d459f1c2d797272bcc.png";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
      className={`fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 transition-all duration-300 ${isScrolled ? "shadow-lg" : "shadow-sm"}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            className="flex-shrink-0 cursor-pointer flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage("home")}
          >
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="hidden sm:block text-xl font-bold text-gray-900">EduVision</span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block">
            <div className="flex items-center space-x-8">
              <motion.button
                onClick={() => setCurrentPage("home")}
                className={`${currentPage === "home" ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"} font-medium text-base transition-colors`}
                whileHover={{ scale: 1.05 }}
              >
                {t.home}
              </motion.button>
              <motion.button
                onClick={() => setCurrentPage("about")}
                className={`${currentPage === "about" ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"} font-medium text-base transition-colors`}
                whileHover={{ scale: 1.05 }}
              >
                {t.about}
              </motion.button>
              <motion.button
                onClick={() => setCurrentPage("departments")}
                className={`${currentPage === "departments" ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"} font-medium text-base transition-colors`}
                whileHover={{ scale: 1.05 }}
              >
                {t.departments}
              </motion.button>
              <motion.button
                onClick={() => setCurrentPage("campus")}
                className={`${currentPage === "campus" ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"} font-medium text-base transition-colors`}
                whileHover={{ scale: 1.05 }}
              >
                {t.campus}
              </motion.button>
              <motion.button
                onClick={() => setCurrentPage("contact")}
                className={`${currentPage === "contact" ? "text-blue-600 font-semibold" : "text-gray-700 hover:text-blue-600"} font-medium text-base transition-colors`}
                whileHover={{ scale: 1.05 }}
              >
                {t.contact}
              </motion.button>
            </div>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Language Dropdown - Desktop */}
            <div className="relative hidden lg:block">
              <motion.button
                className="bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 flex items-center space-x-2 transition-colors"
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              >
                <span className="text-gray-700 text-sm font-medium">
                  {languages.find(l => l.code === language)?.flag || '🇺🇸'} {language.toUpperCase()}
                </span>
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 16 16">
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
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <span>{lang.flag}</span>
                      <span className="text-gray-700">{lang.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Login Button */}
            <motion.button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-lg font-semibold text-sm lg:text-base transition-colors shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage("student-login")}
            >
              {t.login}
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden border-t border-gray-200 py-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => {
                  setCurrentPage("home");
                  setIsMobileMenuOpen(false);
                }}
                className={`${currentPage === "home" ? "text-blue-600 font-semibold" : "text-gray-700"} text-left font-medium`}
              >
                {t.home}
              </button>
              <button
                onClick={() => {
                  setCurrentPage("about");
                  setIsMobileMenuOpen(false);
                }}
                className={`${currentPage === "about" ? "text-blue-600 font-semibold" : "text-gray-700"} text-left font-medium`}
              >
                {t.about}
              </button>
              <button
                onClick={() => {
                  setCurrentPage("departments");
                  setIsMobileMenuOpen(false);
                }}
                className={`${currentPage === "departments" ? "text-blue-600 font-semibold" : "text-gray-700"} text-left font-medium`}
              >
                {t.departments}
              </button>
              <button
                onClick={() => {
                  setCurrentPage("campus");
                  setIsMobileMenuOpen(false);
                }}
                className={`${currentPage === "campus" ? "text-blue-600 font-semibold" : "text-gray-700"} text-left font-medium`}
              >
                {t.campus}
              </button>
              <button
                onClick={() => {
                  setCurrentPage("contact");
                  setIsMobileMenuOpen(false);
                }}
                className={`${currentPage === "contact" ? "text-blue-600 font-semibold" : "text-gray-700"} text-left font-medium`}
              >
                {t.contact}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}