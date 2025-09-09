import { Translation, Language, Department, DepartmentData } from '../types';

export const translations: Record<string, Translation> = {
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
  },
  hi: {
    home: "होम",
    about: "हमारे बारे में",
    departments: "विभाग",
    campus: "कैंपस", 
    contact: "संपर्क करें",
    login: "लॉगिन",
    universityName: "संजीवनी विश्वविद्यालय",
    welcomeTitle: "एडुविजन में आपका स्वागत है",
    welcomeSubtitle: "गुणवत्तापूर्ण शिक्षा के माध्यम से कल के नेताओं को आकार देना",
    exploreCourses: "पाठ्यक्रम देखें"
  },
  mr: {
    home: "मुख्यपृष्ठ",
    about: "आमच्याबद्दल",
    departments: "विभाग",
    campus: "कॅम्पस",
    contact: "संपर्क साधा",
    login: "प्रवेश",
    universityName: "संजीवनी विद्यापीठ",
    welcomeTitle: "एडुव्हिजनमध्ये आपले स्वागत आहे",
    welcomeSubtitle: "दर्जेदार शिक्षणाद्वारे उद्याच्या नेत्यांना आकार देणे",
    exploreCourses: "अभ्यासक्रम पहा"
  },
  es: {
    home: "Inicio",
    about: "Acerca de",
    departments: "Departamentos", 
    campus: "Campus",
    contact: "Contacto",
    login: "Iniciar sesión",
    universityName: "Universidad Sanjivani",
    welcomeTitle: "Bienvenido a EduVision",
    welcomeSubtitle: "Formando los líderes del mañana a través de la educación de calidad",
    exploreCourses: "Explorar cursos"
  },
  fr: {
    home: "Accueil",
    about: "À propos",
    departments: "Départements",
    campus: "Campus", 
    contact: "Contact",
    login: "Connexion",
    universityName: "Université Sanjivani",
    welcomeTitle: "Bienvenue à EduVision",
    welcomeSubtitle: "Façonner les leaders de demain grâce à une éducation de qualité",
    exploreCourses: "Explorer les cours"
  }
};

export const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

export const departments: Department[] = [
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

export const departmentData: Record<string, DepartmentData> = {
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

export const managementTeam = [
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

export const whyUsFeatures = [
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

export const defaultContentData = {
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
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
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
  ]
};