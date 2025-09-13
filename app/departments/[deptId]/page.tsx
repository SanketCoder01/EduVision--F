"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Award,
  BookOpen,
  Users,
  Star,
  Calendar,
  GraduationCap,
  Building2,
  Shield,
  Brain,
  Database,
  ChevronRight,
  Globe,
  Target,
  Lightbulb
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

// Department data with comprehensive information
const departmentData = {
  cse: {
    name: "Computer Science and Engineering",
    shortName: "CSE",
    icon: <Building2 className="h-8 w-8" />,
    color: "from-blue-500 to-blue-600",
    description: "Leading the way in software innovation and technological advancement",
    hod: {
      name: "Dr. Rajesh Kumar Sharma",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      qualification: "Ph.D. in Computer Science, M.Tech CSE",
      experience: "15 years",
      specialization: "Machine Learning, Data Structures, Software Engineering",
      email: "rajesh.sharma@sanjivani.edu.in",
      phone: "+91 98765 43210"
    },
    faculty: [
      {
        name: "Prof. Priya Patel",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
        qualification: "M.Tech CSE, B.Tech IT",
        experience: "8 years",
        specialization: "Web Development, Database Systems"
      },
      {
        name: "Dr. Amit Verma",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
        qualification: "Ph.D. Computer Science",
        experience: "12 years",
        specialization: "Artificial Intelligence, Neural Networks"
      },
      {
        name: "Prof. Sneha Gupta",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
        qualification: "M.Tech Software Engineering",
        experience: "6 years",
        specialization: "Software Testing, Agile Development"
      }
    ],
    aceCommittee: {
      president: {
        name: "Arjun Mehta",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
        year: "Final Year CSE",
        achievements: "Google Summer of Code 2023, Hackathon Winner"
      },
      vicePresident: {
        name: "Kavya Singh",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
        year: "Third Year CSE",
        achievements: "Microsoft Student Ambassador, Research Paper Published"
      },
      technicalHead: {
        name: "Rohit Sharma",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
        year: "Final Year CSE",
        achievements: "Full Stack Developer, Open Source Contributor"
      },
      team: [
        {
          name: "Ananya Reddy",
          position: "Event Coordinator",
          image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
          year: "Third Year CSE"
        },
        {
          name: "Vikram Joshi",
          position: "Technical Coordinator",
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
          year: "Second Year CSE"
        }
      ]
    }
  },
  cyber: {
    name: "Cyber Security",
    shortName: "Cyber Security",
    icon: <Shield className="h-8 w-8" />,
    color: "from-red-500 to-red-600",
    description: "Protecting digital assets through advanced cybersecurity education",
    hod: {
      name: "Dr. Meera Nair",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
      qualification: "Ph.D. Cyber Security, M.Tech Information Security",
      experience: "12 years",
      specialization: "Ethical Hacking, Digital Forensics, Network Security",
      email: "meera.nair@sanjivani.edu.in",
      phone: "+91 98765 43211"
    },
    faculty: [
      {
        name: "Prof. Arun Kumar",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
        qualification: "M.Tech Cyber Security",
        experience: "10 years",
        specialization: "Penetration Testing, Malware Analysis"
      }
    ],
    aceCommittee: {
      president: {
        name: "Ravi Patel",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
        year: "Final Year Cyber Security",
        achievements: "Certified Ethical Hacker, Bug Bounty Hunter"
      },
      vicePresident: {
        name: "Shreya Agarwal",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
        year: "Third Year Cyber Security",
        achievements: "Cybersecurity Competition Winner"
      },
      technicalHead: {
        name: "Karan Singh",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
        year: "Final Year Cyber Security",
        achievements: "Security Researcher, CTF Champion"
      },
      team: []
    }
  },
  aids: {
    name: "Artificial Intelligence and Data Science",
    shortName: "AIDS",
    icon: <Brain className="h-8 w-8" />,
    color: "from-purple-500 to-purple-600",
    description: "Exploring the frontiers of AI and big data analytics",
    hod: {
      name: "Dr. Sunita Agarwal",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
      qualification: "Ph.D. Artificial Intelligence, M.Tech Data Science",
      experience: "14 years",
      specialization: "Machine Learning, Deep Learning, Natural Language Processing",
      email: "sunita.agarwal@sanjivani.edu.in",
      phone: "+91 98765 43212"
    },
    faculty: [
      {
        name: "Prof. Vikash Kumar",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
        qualification: "M.Tech AI & ML",
        experience: "9 years",
        specialization: "Computer Vision, Pattern Recognition"
      },
      {
        name: "Dr. Neha Sharma",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
        qualification: "Ph.D. Data Science",
        experience: "11 years",
        specialization: "Big Data Analytics, Statistical Learning"
      },
      {
        name: "Prof. Rahul Jain",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
        qualification: "M.Tech Machine Learning",
        experience: "7 years",
        specialization: "Neural Networks, Reinforcement Learning"
      }
    ],
    aceCommittee: {
      president: {
        name: "Aditi Sharma",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
        year: "Final Year AIDS",
        achievements: "AI Research Paper Published, Data Science Competition Winner"
      },
      vicePresident: {
        name: "Harsh Patel",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
        year: "Third Year AIDS",
        achievements: "Machine Learning Specialist, Kaggle Expert"
      },
      technicalHead: {
        name: "Priya Reddy",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
        year: "Final Year AIDS",
        achievements: "Deep Learning Researcher, AI Startup Founder"
      },
      team: [
        {
          name: "Sanjay Kumar",
          position: "Data Analytics Lead",
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
          year: "Third Year AIDS"
        },
        {
          name: "Meera Singh",
          position: "ML Research Coordinator",
          image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
          year: "Second Year AIDS"
        }
      ]
    }
  },
  aiml: {
    name: "Artificial Intelligence and Machine Learning",
    shortName: "AI/ML",
    icon: <Database className="h-8 w-8" />,
    color: "from-green-500 to-green-600",
    description: "Specialized focus on advanced AI and ML technologies",
    hod: {
      name: "Dr. Arjun Malhotra",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      qualification: "Ph.D. Machine Learning, M.Tech AI",
      experience: "16 years",
      specialization: "Computer Vision, Robotics, Natural Language Processing",
      email: "arjun.malhotra@sanjivani.edu.in",
      phone: "+91 98765 43213"
    },
    faculty: [
      {
        name: "Prof. Kavya Nair",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
        qualification: "M.Tech Computer Vision",
        experience: "8 years",
        specialization: "Image Processing, Computer Vision"
      },
      {
        name: "Dr. Rajesh Singh",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
        qualification: "Ph.D. Robotics",
        experience: "13 years",
        specialization: "Robotics, Autonomous Systems"
      },
      {
        name: "Prof. Anita Gupta",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
        qualification: "M.Tech NLP",
        experience: "6 years",
        specialization: "Natural Language Processing, Chatbots"
      }
    ],
    aceCommittee: {
      president: {
        name: "Rohan Verma",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
        year: "Final Year AI/ML",
        achievements: "Robotics Competition Winner, AI Patent Holder"
      },
      vicePresident: {
        name: "Ishita Agarwal",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
        year: "Third Year AI/ML",
        achievements: "Computer Vision Researcher, Tech Blogger"
      },
      technicalHead: {
        name: "Karthik Raj",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
        year: "Final Year AI/ML",
        achievements: "NLP Specialist, Open Source Contributor"
      },
      team: [
        {
          name: "Divya Sharma",
          position: "Robotics Coordinator",
          image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
          year: "Third Year AI/ML"
        },
        {
          name: "Abhishek Kumar",
          position: "Vision Tech Lead",
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
          year: "Second Year AI/ML"
        },
        {
          name: "Pooja Patel",
          position: "NLP Research Head",
          image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
          year: "Third Year AI/ML"
        }
      ]
    }
  }
}

export default function DepartmentDetailPage() {
  const params = useParams()
  const deptId = params.deptId as string
  const dept = departmentData[deptId as keyof typeof departmentData]

  if (!dept) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Department Not Found</h1>
          <p className="text-gray-600 mb-6">The requested department could not be found.</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${dept.color} flex items-center justify-center text-white`}>
                {dept.icon}
              </div>
              <span className="font-semibold text-gray-900">{dept.shortName}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`bg-gradient-to-r ${dept.color} text-white py-20`}>
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/20 flex items-center justify-center`}>
              {dept.icon}
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">{dept.name}</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">{dept.description}</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="ace-committee">ACE Committee</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Users className="h-6 w-6 text-blue-600" />
                    Head of Department
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    <div className="lg:col-span-1 text-center">
                      <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-blue-200 shadow-lg">
                        <img 
                          src={dept.hod.image} 
                          alt={dept.hod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">{dept.hod.name}</h3>
                        <Badge className="mb-4 bg-blue-100 text-blue-800">Head of Department</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Qualification</h4>
                            <p className="text-gray-600">{dept.hod.qualification}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Experience</h4>
                            <p className="text-blue-600 font-medium">{dept.hod.experience}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Specialization</h4>
                            <p className="text-gray-600">{dept.hod.specialization}</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{dept.hod.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{dept.hod.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Department Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">500+</h3>
                <p className="text-gray-600">Students Enrolled</p>
              </Card>
              
              <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-green-100 flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">95%</h3>
                <p className="text-gray-600">Placement Rate</p>
              </Card>
              
              <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-purple-100 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">50+</h3>
                <p className="text-gray-600">Research Projects</p>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Faculty Tab */}
          <TabsContent value="faculty" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Faculty Members</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dept.faculty.map((faculty, index) => (
                  <motion.div
                    key={faculty.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                      <CardHeader className="text-center">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-3 border-gray-200">
                          <img 
                            src={faculty.image} 
                            alt={faculty.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardTitle className="text-lg">{faculty.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Qualification</p>
                          <p className="text-sm text-gray-600">{faculty.qualification}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Experience</p>
                          <p className="text-sm text-blue-600">{faculty.experience}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Specialization</p>
                          <p className="text-sm text-gray-600">{faculty.specialization}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* ACE Committee Tab */}
          <TabsContent value="ace-committee" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">ACE Student Association Committee</h2>
              
              {/* Leadership */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-3 border-yellow-300">
                      <img 
                        src={dept.aceCommittee.president.image} 
                        alt={dept.aceCommittee.president.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Badge className="mb-2 bg-yellow-100 text-yellow-800">President</Badge>
                    <CardTitle className="text-lg">{dept.aceCommittee.president.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">{dept.aceCommittee.president.year}</p>
                    <p className="text-sm text-gray-700">{dept.aceCommittee.president.achievements}</p>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-3 border-blue-300">
                      <img 
                        src={dept.aceCommittee.vicePresident.image} 
                        alt={dept.aceCommittee.vicePresident.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Badge className="mb-2 bg-blue-100 text-blue-800">Vice President</Badge>
                    <CardTitle className="text-lg">{dept.aceCommittee.vicePresident.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">{dept.aceCommittee.vicePresident.year}</p>
                    <p className="text-sm text-gray-700">{dept.aceCommittee.vicePresident.achievements}</p>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-3 border-green-300">
                      <img 
                        src={dept.aceCommittee.technicalHead.image} 
                        alt={dept.aceCommittee.technicalHead.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Badge className="mb-2 bg-green-100 text-green-800">Technical Head</Badge>
                    <CardTitle className="text-lg">{dept.aceCommittee.technicalHead.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">{dept.aceCommittee.technicalHead.year}</p>
                    <p className="text-sm text-gray-700">{dept.aceCommittee.technicalHead.achievements}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Team Members */}
              {dept.aceCommittee.team.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Committee Members</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dept.aceCommittee.team.map((member, index) => (
                      <motion.div
                        key={member.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <Card className="text-center hover:shadow-md transition-shadow duration-300">
                          <CardHeader className="pb-3">
                            <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border-2 border-gray-200">
                              <img 
                                src={member.image} 
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardTitle className="text-base">{member.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <Badge variant="outline" className="mb-2">{member.position}</Badge>
                            <p className="text-sm text-gray-600">{member.year}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Academic Programs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      Undergraduate Program
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">4-year Bachelor's degree program with comprehensive curriculum covering fundamental and advanced topics.</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <Star className="h-3 w-3 text-yellow-500" />
                        Duration: 4 Years (8 Semesters)
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="h-3 w-3 text-yellow-500" />
                        Intake: 120 Students
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="h-3 w-3 text-yellow-500" />
                        Industry Partnerships
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      Postgraduate Program
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">2-year Master's degree program with specialization tracks and research opportunities.</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <Star className="h-3 w-3 text-yellow-500" />
                        Duration: 2 Years (4 Semesters)
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="h-3 w-3 text-yellow-500" />
                        Intake: 60 Students
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="h-3 w-3 text-yellow-500" />
                        Research Focus
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
