import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { PageType, ContentData } from "./types";
import { loadContentFromDatabase } from "./utils/supabase";
import { Navbar } from "./components/sections/Navbar";
// Import custom LoginPortal component
import { TechSynergyLoginPortal } from "../../components/TechSynergyLoginPortal";
import { AdminPortal } from "./components/pages/AdminPortal";
import { VuesaxOutlineSetting5, VuesaxLinearSimcard, VuesaxLinearDriver } from "./components/common/SVGIcons";
import { Cpu, Shield, Brain, BookOpen, GraduationCap } from "lucide-react";
import svgPaths from "./imports/svg-g0icy6lpi7";
// Use local images instead of figma assets - use Vite public folder paths
const logoImage = "/images/logo.svg";
const imgPexelsCanvaStudio31532011 = "/images/campus-studio.svg";
const imgIntersect = "/images/campus1.svg";

// Import constants with error handling
let translations: any = {};
let departments: any = [];
let departmentData: any = {};
let managementTeam: any = [];
let whyUsFeatures: any = [];

// Default fallback values
const defaultTranslations = {
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

const defaultDepartments = [
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
];

const defaultDepartmentData = {
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
      },
      {
        name: "Dr. Priya Gupta",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        quote: "Technology is a tool to amplify human capability.",
        qualification: "Ph.D in Software Engineering, Published 50+ papers"
      }
    ]
  },
  'cyber-dept': {
    title: "Cyber Security",
    hodName: "Dr. Rajesh Singh",
    hodImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    faculty: [
      {
        name: "Prof. Neha Desai",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        quote: "Security is not a product, but a process.",
        qualification: "M.Tech in Cyber Security, CISSP Certified"
      },
      {
        name: "Dr. Karan Mehta",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        quote: "The best defense is a good understanding of offense.",
        qualification: "Ph.D in Information Security, Ethical Hacker"
      }
    ]
  },
  'ai-dept': {
    title: "Artificial Intelligence and Data Science",
    hodName: "Dr. Kavita Patel",
    hodImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    faculty: [
      {
        name: "Prof. Rahul Verma",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        quote: "Data is the new oil, AI is the refinery.",
        qualification: "Ph.D in Data Science, AI Research Specialist"
      },
      {
        name: "Dr. Sneha Joshi",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        quote: "Intelligence is the ability to adapt to change.",
        qualification: "Ph.D in Artificial Intelligence, 10+ years experience"
      }
    ]
  },
  'aiml-dept': {
    title: "AI/ML (Artificial Intelligence/Machine Learning)",
    hodName: "Dr. Amit Kumar",
    hodImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    faculty: [
      {
        name: "Prof. Deepika Singh",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        quote: "Machine learning is the future of innovation.",
        qualification: "Ph.D in Machine Learning, Google Research Alumni"
      },
      {
        name: "Dr. Rohit Sharma",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        quote: "Teaching machines to think like humans.",
        qualification: "Ph.D in Neural Networks, Published 30+ papers"
      }
    ]
  }
};

const defaultManagementTeam = [
  {
    name: "Dr. Amit Kolhe",
    position: "President",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPresident: true,
  },
  {
    name: "Dr. Ajay Thakur",
    position: "Vice Chancellor",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPresident: false,
  },
  {
    name: "Dr. Kavitha Rani",
    position: "Dean",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPresident: false,
  },
  {
    name: "Dr. Dhananjay Kumbhar",
    position: "TPO Officer",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    isPresident: false,
  },
];

const defaultWhyUsFeatures = [
  {
    title: "AI Assignment Assistance",
    description: "Advanced AI-powered tools help students with personalized learning experiences and automated assignment support.",
    background: "bg-white",
  },
  {
    title: "University Dashboard",
    description: "Comprehensive digital workspace for managing coursework, grades, schedules, and university services.",
    background: "bg-gradient-to-r from-[#3171DE] to-[#704AF2]",
  },
  {
    title: "15+ University Services",
    description: "Access to library, research facilities, career counseling, placement support, and many more student services.",
    background: "bg-white",
  },
  {
    title: "Professional Development",
    description: "Industry-aligned curriculum with internships, workshops, and certification programs for career readiness.",
    background: "bg-gradient-to-r from-[#3171DE] to-[#704AF2]",
  },
];

// Load constants with error handling
(async () => {
  try {
    const constantsModule = await import('./constants');
    translations = constantsModule.translations || defaultTranslations;
    departments = constantsModule.departments || defaultDepartments;
    departmentData = constantsModule.departmentData || defaultDepartmentData;
    managementTeam = constantsModule.managementTeam || defaultManagementTeam;
    whyUsFeatures = constantsModule.whyUsFeatures || defaultWhyUsFeatures;
  } catch (error) {
    console.warn('Failed to load constants, using defaults:', error);
    translations = defaultTranslations;
    departments = defaultDepartments;
    departmentData = defaultDepartmentData;
    managementTeam = defaultManagementTeam;
    whyUsFeatures = defaultWhyUsFeatures;
  }
})();

// Hero Section Component with safe translation access
function HeroSection({ language, contentData }: { language: string, contentData?: ContentData }) {
  // Safe translation access with multiple fallbacks
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
  
  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-screen py-20">
          {/* Left Column - Text Content */}
          <motion.div
            className="relative z-10 order-2 lg:order-1"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <span
                className="text-lg sm:text-xl tracking-[2px] font-semibold"
                style={{
                  background: "linear-gradient(to right, #3171DE, #704AF2)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {contentData?.heroLabel || t.universityName}
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-medium text-[#3d3d3d] leading-tight mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {contentData?.heroTitle || t.welcomeTitle}
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-neutral-600 mb-12 font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              {contentData?.heroSubtitle || t.welcomeSubtitle}
            </motion.p>

            <motion.button
              className="bg-[#66b066] text-white px-8 py-4 rounded-[50px] font-medium text-base hover:bg-[#5a9a5a] transition-colors"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(102, 176, 102, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              {t.exploreCourses}
            </motion.button>
          </motion.div>

          {/* Right Column - Image */}
          <motion.div
            className="relative order-1 lg:order-2"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              className="relative w-full max-w-[600px] h-[400px] sm:h-[500px] lg:h-[679px] mx-auto"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={imgPexelsCanvaStudio31532011}
                alt="Students collaboration"
                className="w-full h-full object-cover rounded-[34px]"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute top-1/2 right-[10%] hidden xl:block"
        initial={{ opacity: 0, rotate: -180 }}
        animate={{ opacity: 0.8, rotate: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        <div className="w-48 h-40">
          <svg viewBox="0 0 189 170" className="w-full h-full">
            <path
              d={svgPaths.p21171780}
              fill="url(#gradient1)"
              opacity="0.8"
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#62AE6E" />
                <stop offset="100%" stopColor="#EDE14F" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </motion.div>
    </div>
  );
}

// Departments Section with safe array access
function DepartmentsSection({ setCurrentPage, contentData }: { setCurrentPage: (page: PageType) => void, contentData?: ContentData }) {
  // Use contentData first, then fallback to constants, then default
  const safeDepartments = contentData?.departments || (departments.length > 0 ? departments : defaultDepartments);

  return (
    <motion.div
      className="py-16 lg:py-24 bg-white"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex items-center mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="w-20 h-20 mr-6 flex-shrink-0"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.8 }}
          >
            <svg viewBox="0 0 91 81" className="w-full h-full">
              <path
                d={svgPaths.pe3c6380}
                fill="url(#gradient2)"
                opacity="0.8"
              />
              <defs>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3171DE" />
                  <stop offset="100%" stopColor="#4AC0F2" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          <h2 className="text-3xl lg:text-4xl font-medium text-[#3d3d3d] leading-tight">
            Discover Our Academic Departments: Where Innovation Meets Education.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-12">
          {safeDepartments.map((department: any, index: number) => (
            <motion.div
              key={index}
              className="bg-white rounded-[35px] p-8 shadow-[0px_5.662px_14.154px_0px_rgba(0,0,0,0.13)] hover:shadow-lg transition-all duration-300 cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{
                y: -10,
                boxShadow: "0px 15px 30px rgba(0,0,0,0.15)",
              }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
              }}
              viewport={{ once: true }}
              onClick={() => setCurrentPage(department.page)}
            >
              <motion.div
                className="w-12 h-12 mb-8"
                style={{ color: department.color }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                {department.icon === "computer" && <Cpu className="w-full h-full" />}
                {department.icon === "security" && <Shield className="w-full h-full" />}
                {department.icon === "ai" && <Brain className="w-full h-full" />}
                {department.icon === "ml" && <BookOpen className="w-full h-full" />}
                {!["computer", "security", "ai", "ml"].includes(department.icon) && <GraduationCap className="w-full h-full" />}
              </motion.div>

              <motion.h3
                className="text-2xl font-medium text-[#3d3d3d] mb-4 leading-tight"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                viewport={{ once: true }}
              >
                {department.title}
              </motion.h3>
              <motion.p
                className="text-base text-neutral-600 leading-relaxed"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.4 }}
                viewport={{ once: true }}
              >
                {department.description}
              </motion.p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Why Us Section with safe array access
function WhyUsSection({ contentData }: { contentData?: ContentData }) {
  const safeFeatures = contentData?.whyUsFeatures || (whyUsFeatures.length > 0 ? whyUsFeatures : defaultWhyUsFeatures);

  return (
    <motion.div
      className="py-16 lg:py-24 bg-[#f7f7fd] relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-medium text-[#3d3d3d] leading-tight max-w-4xl mx-auto">
            Choose EduVision: Your Gateway to{" "}
            <span className="bg-gradient-to-r from-[#3171DE] to-[#4AC0F2] bg-clip-text text-transparent">
              Excellence
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
          {safeFeatures.map((feature: any, index: number) => (
            <motion.div
              key={index}
              className={`${feature.background} ${
                feature.background === "bg-white" ? "text-[#3d3d3d]" : "text-white"
              } rounded-[35px] p-8 shadow-[0px_5.662px_14.154px_0px_rgba(0,0,0,0.13)] h-[229px]`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{
                y: -5,
                boxShadow: "0px 15px 30px rgba(0,0,0,0.15)",
              }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
              }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-medium mb-4 leading-tight">{feature.title}</h3>
              <p
                className={`text-base leading-relaxed ${
                  feature.background === "bg-white" ? "text-neutral-600" : "text-white"
                }`}
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// College Management Section with safe array access
function CollegeManagementSection({ contentData }: { contentData?: ContentData }) {
  const safeManagementTeam = contentData?.managementTeam || (managementTeam.length > 0 ? managementTeam : defaultManagementTeam);

  return (
    <motion.div
      className="py-16 lg:py-24 bg-white"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-medium text-[#3d3d3d] leading-tight">
            Meet Our College{" "}
            <span className="bg-gradient-to-r from-[#3171DE] to-[#704AF2] bg-clip-text text-transparent">
              Management 
            </span>
          </h2>
        </motion.div>

        {safeManagementTeam.length > 0 && (
          <>
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-gradient-to-r from-[#3171DE] to-[#704AF2]"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <ImageWithFallback
                  src={safeManagementTeam[0].image}
                  alt={safeManagementTeam[0].name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <h3 className="text-2xl font-medium text-[#3d3d3d] mb-2">{safeManagementTeam[0].name}</h3>
              <p className="text-lg text-neutral-600">{safeManagementTeam[0].position}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 justify-center">
              {safeManagementTeam.slice(1).map((member: any, index: number) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.4 + index * 0.1,
                  }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-gray-200"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <h4 className="text-xl font-medium text-[#3d3d3d] mb-1">{member.name}</h4>
                  <p className="text-base text-neutral-600">{member.position}</p>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

// Expert Section
function ExpertSection({ contentData }: { contentData?: ContentData }) {
  return (
    <motion.div
      className="py-16 lg:py-24 bg-[#f7f7fd]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-medium text-[#3d3d3d] leading-tight mb-16">
            Meet Our{" "}
            <span className="bg-gradient-to-r from-[#3171DE] to-[#704AF2] bg-clip-text text-transparent">
              Expert
            </span>
          </h2>

          <motion.div
            className="max-w-md mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="w-40 h-40 mx-auto mb-8 rounded-full overflow-hidden border-4 border-gradient-to-r from-[#3171DE] to-[#704AF2] shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <ImageWithFallback
                src={contentData?.expertImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"}
                alt={contentData?.expertName || "Sanket Gaikwad"}
                className="w-full h-full object-cover"
              />
            </motion.div>

            <motion.h3
              className="text-3xl font-medium text-[#3d3d3d] mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              {contentData?.expertName || "Sanket Gaikwad"}
            </motion.h3>

            <motion.div
              className="bg-gradient-to-r from-[#3171DE] to-[#704AF2] text-white px-8 py-4 rounded-[25px] inline-block shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 15px 35px rgba(113, 74, 242, 0.4)",
              }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="text-lg font-semibold">Developed By {contentData?.expertName || "Sanket Gaikwad"}</p>
              <p className="text-sm opacity-90 mt-1">Software Engineering Expert</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Placement News Section with Sliding Carousel
function PlacementNewsSection({ contentData }: { contentData?: ContentData }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const defaultNewsItems = [
    {
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "2024 Placement Record: 95% Success Rate",
      description: "Our students achieved outstanding placement results with top companies like Google, Microsoft, and Amazon recruiting from our campus.",
      author: "Placement Cell",
      color: "#E27244",
    },
    {
      image: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "Winners of National Hackathon Championship",
      description: "EduVision students won first place in the National AI/ML Hackathon, showcasing innovative solutions for smart cities.",
      author: "Competition Team",
      color: "#9747FF",
    },
    {
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "Industry Expert Visit: Tech Innovation Summit",
      description: "Leading industry experts from Silicon Valley shared insights on emerging technologies and career opportunities.",
      author: "Industry Relations",
      color: "#F9C107",
    },
    {
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "Research Excellence: International Recognition",
      description: "Our faculty and students published groundbreaking research in top-tier international journals and conferences.",
      author: "Research Department",
      color: "#3056D3",
    },
    {
      image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "New State-of-Art Laboratory Inauguration",
      description: "Advanced AI and Machine Learning laboratory equipped with latest technology for hands-on learning experience.",
      author: "Infrastructure Team",
      color: "#28A745",
    },
    {
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "International Student Exchange Program",
      description: "Partnership with top universities worldwide offering students global exposure and cultural exchange opportunities.",
      author: "International Relations",
      color: "#6F42C1",
    }
  ];

  const newsItems = contentData?.newsItems && contentData.newsItems.length > 0 
    ? contentData.newsItems.map(item => ({
        ...item,
        image: item.image || defaultNewsItems[0].image
      }))
    : defaultNewsItems;

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(newsItems.length / 4));
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [newsItems.length]);

  return (
    <motion.div
      className="py-16 lg:py-24 bg-white"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex items-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="w-20 h-20 mr-6 flex-shrink-0"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.8 }}
          >
            <svg viewBox="0 0 91 81" className="w-full h-full">
              <path d={svgPaths.pe3c6380} fill="url(#gradient4)" opacity="0.8" />
              <defs>
                <linearGradient id="gradient4" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3171DE" />
                  <stop offset="100%" stopColor="#4AC0F2" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          <h2 className="text-3xl lg:text-4xl font-medium text-[#3d3d3d]">Latest Achievements & News</h2>
        </motion.div>

        {/* Sliding Carousel Container */}
        <div className="relative overflow-hidden mb-12">
          <motion.div
            className="flex transition-transform duration-500 ease-in-out"
            animate={{
              x: `-${currentSlide * 100}%`,
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {Array.from({ length: Math.ceil(newsItems.length / 4) }).map((_, slideIndex) => (
              <div key={slideIndex} className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                  {newsItems.slice(slideIndex * 4, (slideIndex + 1) * 4).map((item, index) => (
                    <motion.div
                      key={slideIndex * 4 + index}
                      className="bg-white rounded-[30px] p-8 shadow-sm hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={{
                        y: -5,
                        boxShadow: "0px 15px 30px rgba(0,0,0,0.15)",
                      }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.1,
                      }}
                      viewport={{ once: true }}
                    >
                      <div className="mb-12">
                        <motion.div
                          className="w-full h-60 rounded-[15px] mb-6 overflow-hidden"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                        <h3 className="text-2xl font-medium text-[#3d3d3d] mb-4 leading-tight">{item.title}</h3>
                        <p className="text-base text-neutral-600 leading-relaxed">{item.description}</p>
                      </div>

                      <motion.div className="flex items-center" whileHover={{ scale: 1.02 }}>
                        <div className="w-8 h-7 mr-3 flex-shrink-0">
                          <svg viewBox="0 0 38 34" className="w-full h-full">
                            <path d={svgPaths.p199f33f0} fill={item.color} opacity="0.8" />
                          </svg>
                        </div>
                        <span className="text-[15px] font-medium text-[#3d3d3d]">By: {item.author}</span>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Carousel Navigation Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.ceil(newsItems.length / 4) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  currentSlide === index
                    ? "bg-gradient-to-r from-[#3171DE] to-[#704AF2]"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + Math.ceil(newsItems.length / 4)) % Math.ceil(newsItems.length / 4))}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
          >
            <svg className="w-6 h-6 text-[#3171DE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % Math.ceil(newsItems.length / 4))}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
          >
            <svg className="w-6 h-6 text-[#3171DE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// CTA Section
function CTASection() {
  return (
    <motion.div
      className="py-16 lg:py-24 bg-white"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="relative rounded-[35px] overflow-hidden min-h-[400px] lg:min-h-[632px] flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 w-full h-full">
            <img
              src={imgIntersect}
              alt="CTA Background"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#3171DE] to-[#704AF2] opacity-80"></div>

          <motion.div
            className="relative z-10 text-center text-white px-4"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-8 leading-tight max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              Ready to Shape Your Future? Begin Your Educational Journey Today!
            </motion.h2>
            <motion.button
              className="bg-white text-[#5e5def] px-8 py-4 rounded-[50px] font-semibold text-base hover:bg-gray-100 transition-colors"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 15px 30px rgba(255,255,255,0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              viewport={{ once: true }}
            >
              Apply Now
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Footer
function Footer({ setCurrentPage }: { setCurrentPage: (page: PageType) => void }) {
  return (
    <motion.footer
      className="bg-white py-16 lg:py-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="lg:col-span-1">
            <motion.div
              className="w-12 h-12 mb-8"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.8 }}
            >
              <img
                src={logoImage}
                alt="EduVision Logo"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          <div>
            <h3 className="text-base font-normal text-[#0a142f] mb-6 leading-[28px]">Academics</h3>
            <ul className="space-y-4">
              {["Computer Science", "Cyber Security", "AI & Data Science", "AI/ML"].map((item) => (
                <motion.li
                  key={item}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <a href="#" className="text-base text-[#0a142f] opacity-50 hover:opacity-100 transition-opacity">
                    {item}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-normal text-[#0a142f] mb-6 leading-[28px]">Login Portals</h3>
            <ul className="space-y-4">
              {[
                { label: "Student Login", page: "student-login" as PageType },
                { label: "Faculty Login", page: "faculty-login" as PageType },
                { label: "University Login", page: "university-login" as PageType },
                { label: "Admin Login", page: "expert-login" as PageType }
              ].map((item) => (
                <motion.li
                  key={item.label}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    onClick={() => setCurrentPage(item.page)}
                    className="text-base text-[#0a142f] opacity-50 hover:opacity-100 transition-opacity"
                  >
                    {item.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-normal text-[#0a142f] mb-6 leading-[28px]">University</h3>
            <ul className="space-y-4">
              {["About us", "Careers", "Contact us", "EduVision"].map((item) => (
                <motion.li
                  key={item}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <a href="#" className="text-base text-[#0a142f] opacity-50 hover:opacity-100 transition-opacity">
                    {item}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div
          className="bg-[rgba(32,60,134,0.05)] rounded-[30px] p-8 lg:p-12 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="max-w-md">
            <h3 className="text-base font-normal text-[#0a142f] mb-6 leading-[28px]">Stay Connected</h3>
            <div className="flex mb-6">
              <div className="flex-1 bg-white border border-[#e7e8f2] rounded-[30px] px-6 py-4 mr-4">
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full bg-transparent border-none outline-none text-[#0a142f] opacity-60 text-sm"
                />
              </div>
              <motion.button
                className="bg-gradient-to-r from-[#3171DE] to-[#704AF2] text-white p-4 rounded-[30px] flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 14 17">
                  <path d={svgPaths.p1242500} />
                </svg>
              </motion.button>
            </div>
            <p className="text-xs text-[#0a142f] opacity-60 leading-[20.4px]">
              Hello, we are EduVision. Our goal is to transform education through innovative learning approaches and cutting-edge technology.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#0a142f] border-opacity-[0.06]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex space-x-6 mb-6 md:mb-0">
            {["Terms", "Privacy", "Cookies"].map((item) => (
              <motion.a
                key={item}
                href="#"
                className="text-sm text-[#0a142f] hover:opacity-70 transition-opacity"
                whileHover={{ scale: 1.05 }}
              >
                {item}
              </motion.a>
            ))}
          </div>

          <div className="flex space-x-4">
            <motion.a
              href="#"
              className="w-8 h-8 rounded-full border border-[#0a142f] border-opacity-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="w-3 h-3">
                <svg viewBox="0 0 9 9" className="w-full h-full" fill="#0A142F">
                  <path d={svgPaths.p2fd3a00} />
                </svg>
              </div>
            </motion.a>

            <motion.a
              href="#"
              className="w-8 h-8 rounded-full border border-[#0a142f] border-opacity-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="w-2 h-3">
                <svg viewBox="0 0 8 13" className="w-full h-full" fill="#0A142F">
                  <path d={svgPaths.p39484080} />
                </svg>
              </div>
            </motion.a>

            <motion.a
              href="#"
              className="w-8 h-8 rounded-full border border-[#0a142f] border-opacity-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="w-3 h-3">
                <svg viewBox="0 0 14 11" className="w-full h-full" fill="#0A142F">
                  <path d={svgPaths.p29ca400} />
                </svg>
              </div>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}

// Department Page Component with safe object access
function DepartmentPage({ departmentType, setCurrentPage, contentData }: { departmentType: string, setCurrentPage: (page: PageType) => void, contentData?: ContentData }) {
  const safeDepartmentData = contentData?.departmentData || (Object.keys(departmentData).length > 0 ? departmentData : defaultDepartmentData);
  const dept = safeDepartmentData[departmentType as keyof typeof safeDepartmentData];
  
  if (!dept) {
    return (
      <div className="min-h-screen bg-white py-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Department Not Found</h1>
          <button onClick={() => setCurrentPage('home')} className="text-blue-600 hover:text-blue-700">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="min-h-screen bg-white py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.button
          onClick={() => setCurrentPage("home")}
          className="mb-8 flex items-center text-[#3171DE] hover:text-[#704AF2] transition-colors"
          whileHover={{ x: -5 }}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </motion.button>

        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <motion.h1 className="text-5xl lg:text-6xl font-medium text-[#3d3d3d] mb-8" initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 0.8, delay: 0.4 }}>
            Welcome to the {dept.title} Department
          </motion.h1>
        </motion.div>

        <motion.div className="text-center mb-20" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
          <motion.div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-gradient-to-r from-[#3171DE] to-[#704AF2] shadow-xl" initial={{ scale: 0.8 }} animate={{ scale: 1 }} whileHover={{ scale: 1.05 }} transition={{ duration: 0.5, delay: 0.8 }}>
            <ImageWithFallback src={dept.hodImage} alt={dept.hodName} className="w-full h-full object-cover" />
          </motion.div>
          <motion.h2 className="text-3xl font-medium text-[#3d3d3d] mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
            {dept.hodName}
          </motion.h2>
          <motion.p className="text-xl text-neutral-600" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
            Head of Department
          </motion.p>
        </motion.div>

        <motion.div className="mb-16" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.4 }}>
          <h3 className="text-3xl font-medium text-[#3d3d3d] text-center mb-12">Faculty Members</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {dept.faculty.map((faculty: any, index: number) => (
              <motion.div
                key={index}
                className="bg-white rounded-[25px] p-8 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.6, delay: 1.6 + index * 0.2 }}
              >
                <motion.div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-2 border-gray-200" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                  <ImageWithFallback src={faculty.image} alt={faculty.name} className="w-full h-full object-cover" />
                </motion.div>
                <h4 className="text-2xl font-medium text-[#3d3d3d] mb-3 text-center">{faculty.name}</h4>
                <p className="text-lg text-[#3171DE] mb-4 text-center italic">"{faculty.quote}"</p>
                <p className="text-base text-neutral-600 text-center">{faculty.qualification}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Placeholder components for other pages
function DepartmentsListPage({ setCurrentPage, contentData }: { setCurrentPage: (page: PageType) => void, contentData?: ContentData }) {
  const safeDepartments = contentData?.departments || (departments.length > 0 ? departments : defaultDepartments);

  return (
    <motion.div className="min-h-screen bg-white py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.button
          onClick={() => setCurrentPage("home")}
          className="mb-8 flex items-center text-[#3171DE] hover:text-[#704AF2] transition-colors"
          whileHover={{ x: -5 }}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </motion.button>
        <h1 className="text-5xl lg:text-6xl font-medium text-[#3d3d3d] mb-8 text-center">
          Our <span className="bg-gradient-to-r from-[#3171DE] to-[#704AF2] bg-clip-text text-transparent">Departments</span>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-12">
          {safeDepartments.map((department: any, index: number) => (
            <motion.div
              key={index}
              className="bg-white rounded-[35px] p-8 shadow-[0px_5.662px_14.154px_0px_rgba(0,0,0,0.13)] hover:shadow-lg transition-all duration-300 cursor-pointer"
              whileHover={{ y: -10, boxShadow: "0px 15px 30px rgba(0,0,0,0.15)" }}
              onClick={() => setCurrentPage(department.page)}
            >
              <div className="w-12 h-12 mb-8" style={{ color: department.color }}>
                {department.icon === "computer" && <Cpu className="w-full h-full" />}
                {department.icon === "security" && <Shield className="w-full h-full" />}
                {department.icon === "ai" && <Brain className="w-full h-full" />}
                {department.icon === "ml" && <BookOpen className="w-full h-full" />}
                {!["computer", "security", "ai", "ml"].includes(department.icon) && <GraduationCap className="w-full h-full" />}
              </div>
              <h3 className="text-2xl font-medium text-[#3d3d3d] mb-4 leading-tight">{department.title}</h3>
              <p className="text-base text-neutral-600 leading-relaxed">{department.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CampusPage({ setCurrentPage }: { setCurrentPage: (page: PageType) => void }) {
  return (
    <motion.div className="min-h-screen bg-white py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.button onClick={() => setCurrentPage("home")} className="mb-8 flex items-center text-[#3171DE] hover:text-[#704AF2]" whileHover={{ x: -5 }}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </motion.button>
        <h1 className="text-5xl lg:text-6xl font-medium text-[#3d3d3d] mb-8 text-center">
          Our Beautiful <span className="bg-gradient-to-r from-[#3171DE] to-[#704AF2] bg-clip-text text-transparent">Campus</span>
        </h1>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto text-center">Campus information would go here...</p>
      </div>
    </motion.div>
  );
}

function AboutPage({ setCurrentPage }: { setCurrentPage: (page: PageType) => void }) {
  return (
    <motion.div className="min-h-screen bg-white py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.button onClick={() => setCurrentPage("home")} className="mb-8 flex items-center text-[#3171DE] hover:text-[#704AF2]" whileHover={{ x: -5 }}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </motion.button>
        <h1 className="text-5xl lg:text-6xl font-medium text-[#3d3d3d] mb-8 text-center">
          About <span className="bg-gradient-to-r from-[#3171DE] to-[#704AF2] bg-clip-text text-transparent">Sanjivani University</span>
        </h1>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto text-center">About information would go here...</p>
      </div>
    </motion.div>
  );
}

function ContactPage({ setCurrentPage }: { setCurrentPage: (page: PageType) => void }) {
  return (
    <motion.div className="min-h-screen bg-white py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.button onClick={() => setCurrentPage("home")} className="mb-8 flex items-center text-[#3171DE] hover:text-[#704AF2]" whileHover={{ x: -5 }}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </motion.button>
        <h1 className="text-5xl lg:text-6xl font-medium text-[#3d3d3d] mb-8 text-center">
          Contact <span className="bg-gradient-to-r from-[#3171DE] to-[#704AF2] bg-clip-text text-transparent">Us</span>
        </h1>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto text-center">Contact information would go here...</p>
      </div>
    </motion.div>
  );
}

// Main App Component
export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [language, setLanguage] = useState("en");
  const [contentData, setContentData] = useState<ContentData | undefined>();

  useEffect(() => {
    const loadContent = async () => {
      const data = await loadContentFromDatabase();
      if (data) {
        setContentData(data);
      }
    };
    loadContent();
  }, []);

  // Handle real-time content updates from admin panel
  const handleContentUpdate = (updatedData: ContentData) => {
    setContentData(updatedData);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "about":
        return <AboutPage setCurrentPage={setCurrentPage} />;
      case "departments":
        return <DepartmentsListPage setCurrentPage={setCurrentPage} contentData={contentData} />;  
      case "campus":
        return <CampusPage setCurrentPage={setCurrentPage} />;
      case "contact":
        return <ContactPage setCurrentPage={setCurrentPage} />;
      case "cse-dept":
      case "cyber-dept":
      case "ai-dept":
      case "aiml-dept":
        return <DepartmentPage departmentType={currentPage} setCurrentPage={setCurrentPage} contentData={contentData} />;
      case "student-login":
        return <TechSynergyLoginPortal type="student" setCurrentPage={setCurrentPage} />;
      case "faculty-login":
        return <TechSynergyLoginPortal type="faculty" setCurrentPage={setCurrentPage} />;
      case "university-login":
        return <TechSynergyLoginPortal type="university" setCurrentPage={setCurrentPage} />;
      case "expert-login":
        return <AdminPortal setCurrentPage={setCurrentPage} onContentUpdate={handleContentUpdate} />;
      case "admin-portal":
        return <AdminPortal setCurrentPage={setCurrentPage} onContentUpdate={handleContentUpdate} />;
      default:
        return (
          <>
            <HeroSection language={language} contentData={contentData} />
            <DepartmentsSection setCurrentPage={setCurrentPage} contentData={contentData} />
            <WhyUsSection contentData={contentData} />
            <CollegeManagementSection contentData={contentData} />
            <ExpertSection contentData={contentData} />
            <PlacementNewsSection contentData={contentData} />
            <CTASection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        language={language}
        setLanguage={setLanguage}
      />
      {renderPage()}
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}