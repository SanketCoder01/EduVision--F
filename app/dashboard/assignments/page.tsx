"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { publishAssignment, getFacultyAssignments, getAssignmentSubmissions, gradeSubmission, Assignment, AssignmentSubmission } from "@/lib/assignments";
import { useRealtimeAssignments, useRealtimeSubmissions } from "@/hooks/useRealtimeAssignments";
import { uploadAssignmentFile } from "@/lib/storage";
import { generateFormFromPrompt } from "@/lib/ai-form-generator";
import { FileText, Calendar, GraduationCap, Clock, Sparkles } from "lucide-react";
import SimplifiedAssignmentModule from "@/components/SimplifiedAssignmentModule";
import { motion } from "framer-motion";

export default function FacultyAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAIForm, setShowAIForm] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [assignmentMode, setAssignmentMode] = useState<'manual' | 'ai'>('manual');
  const [currentStep, setCurrentStep] = useState<'create' | 'settings' | 'preview'>('create');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const { toast } = useToast();

  // State for faculty data
  const [faculty, setFaculty] = useState<any>(null);
  const [facultyLoading, setFacultyLoading] = useState(true);

  // Fetch faculty data from Supabase
  useEffect(() => {
    const fetchFaculty = async () => {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Authentication Error:', userError?.message);
        toast({ title: "Authentication Error", description: "Please log in again to continue.", variant: "destructive" });
        setFacultyLoading(false);
        return;
      }

      // Fetch faculty profile from the 'faculty' table
      const { data: facultyProfile, error: profileError } = await supabase
        .from('faculty')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching faculty profile:', profileError.message);
        toast({ title: "Profile Error", description: "Could not fetch your faculty profile.", variant: "destructive" });
      } else {
        setFaculty(facultyProfile);
      }
      setFacultyLoading(false);
    };

    fetchFaculty();
  }, []);

  // Define the form data type
  type AssignmentFormData = {
    title: string;
    description: string;
    question: string;
    rules: string;
    instructions: string;
    department: string;
    year: string;
    start_date: string;
    due_date: string;
    attachment: File | null;
    assignment_type: 'file_upload' | 'text' | 'url';
    max_marks: number;
    allow_plagiarism: boolean;
    allow_late_submission: boolean;
    allowed_formats: {
      pdf: boolean;
      image: boolean;
      docs: boolean;
      xlsx: boolean;
      zip: boolean;
    };
    faculty_id: string;
    faculty_name: string;
    faculty_email: string;
    status: 'draft' | 'published' | 'graded';
    visibility: boolean;
    enable_plagiarism_check: boolean;
    attachment_url: string | null;
  };

  const [formData, setFormData] = useState<AssignmentFormData>({
    title: "",
    description: "",
    question: "",
    rules: "",
    instructions: "",
    department: faculty?.department || "",
    year: "",
    start_date: new Date().toISOString().split('T')[0],
    due_date: "",
    attachment: null,
    assignment_type: "file_upload",
    max_marks: 100,
    allow_plagiarism: false,
    allow_late_submission: false,
    allowed_formats: {
      pdf: false,
      image: false,
      docs: false,
      xlsx: false,
      zip: false
    },
    faculty_id: faculty?.id || "",
    faculty_name: faculty?.name || "",
    faculty_email: faculty?.email || "",
    status: "draft",
    visibility: false,
    enable_plagiarism_check: true,
    attachment_url: null
  });

  // Load assignments
  const loadAssignments = async () => {
    if (!faculty?.email) return;
    
    setLoading(true);
    try {
      // Try Supabase first, fallback to localStorage
      try {
        const { data, error } = await getFacultyAssignments(faculty.email);
        if (error) throw error;
        setAssignments(data || []);
      } catch (supabaseError) {
        console.log('Supabase error, falling back to localStorage:', supabaseError);
        // Fallback to localStorage
        const localAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
        const facultyAssignments = localAssignments.filter((assignment: any) => 
          assignment.faculty_email === faculty.email || 
          assignment.faculty_id === faculty.id ||
          assignment.faculty_id === faculty.email
        );
        setAssignments(facultyAssignments);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast({
        title: "Error",
        description: "Failed to load assignments. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Reload assignments when faculty data is loaded
  useEffect(() => {
    if (faculty?.id) {
      loadAssignments();
    }
  }, [faculty]);

  // Real-time assignment updates
  useRealtimeAssignments(
    faculty?.department || "", 
    "", 
    useCallback((newAssignment: Assignment) => {
      if (faculty?.id && newAssignment.faculty_id === faculty.id) {
        setAssignments(prev => [newAssignment, ...prev.filter(a => a.id !== newAssignment.id)]);
      }
    }, [faculty?.id])
  );

  // Real-time submission updates
  useRealtimeSubmissions(
    selectedAssignment?.id || "", 
    useCallback((newSubmission: AssignmentSubmission) => {
      if (selectedAssignment?.id === newSubmission.assignment_id) {
        setSubmissions(prev => [newSubmission, ...prev.filter(s => s.id !== newSubmission.id)]);
      }
    }, [selectedAssignment?.id])
  );

  // Show loading state while faculty data is loading
  if (facultyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state if faculty data couldn't be loaded
  if (!faculty?.id) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-red-600">Authentication Required</h2>
        <p className="mt-2 text-gray-600">Please log in again to continue.</p>
        <Button 
          className="mt-4" 
          onClick={() => window.location.href = '/auth/login'}
        >
          Go to Login
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!faculty?.id) {
      toast({
        title: "Authentication Error",
        description: "Faculty data not found. Please log in again.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Get access token from localStorage
      const session = JSON.parse(localStorage.getItem('faculty_session') || '{}');
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        throw new Error('No active session found. Please log in again.');
      }
      
      let attachmentUrl: string | undefined = undefined;
      
      if (formData.attachment) {
        const { data: uploadData, error: uploadError } = await uploadAssignmentFile(
          faculty.id, 
          formData.attachment
        );
        if (uploadError) throw uploadError;
        attachmentUrl = uploadData.path;
      }

      const assignment: Assignment = {
        ...formData,
        faculty_id: faculty.id,
        faculty_name: faculty.name,
        faculty_email: faculty.email,
        attachment_url: attachmentUrl,
        status: 'published',
        visibility: true,
        enable_plagiarism_check: !formData.allow_plagiarism,
        assignment_type: formData.assignment_type === 'text' ? 'text_based' : 
                        formData.assignment_type === 'url' ? 'text_based' : 'file_upload',
        allowed_file_types: Object.entries(formData.allowed_formats)
          .filter(([_, enabled]) => enabled)
          .map(([format, _]) => format)
      };

      const { error } = await publishAssignment(assignment, accessToken);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment published successfully!"
      });

      // Reset form with all required fields
      const resetData: AssignmentFormData = {
        title: "",
        description: "",
        question: "",
        rules: "",
        instructions: "",
        department: faculty?.department || "",
        year: "",
        start_date: new Date().toISOString().split('T')[0],
        due_date: "",
        attachment: null,
        assignment_type: "file_upload",
        max_marks: 100,
        allow_plagiarism: false,
        allow_late_submission: false,
        allowed_formats: {
          pdf: false,
          image: false,
          docs: false,
          xlsx: false,
          zip: false
        },
        faculty_id: faculty?.id || "",
        faculty_name: faculty?.name || "",
        faculty_email: faculty?.email || "",
        status: "draft",
        visibility: false,
        enable_plagiarism_check: true,
        attachment_url: null
      };
      
      setFormData(resetData);
      
      setShowForm(false);
      await loadAssignments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish assignment",
        variant: "destructive"
      });
    }
  };

  const handleViewSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    try {
      const assignmentId = assignment.id || '';
      if (!assignmentId) {
        throw new Error('Assignment ID not found');
      }
      const { data, error } = await getAssignmentSubmissions(assignmentId);
      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load submissions. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditAssignment = (assignment: Assignment) => {
    // Populate form with existing assignment data
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      question: (assignment as any).question || '',
      rules: (assignment as any).rules || '',
      instructions: (assignment as any).instructions || '',
      due_date: assignment.due_date.split('T')[0], // Convert to date format
      start_date: assignment.start_date ? assignment.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
      department: assignment.department,
      year: assignment.year,
      max_marks: assignment.max_marks || 100,
      allow_plagiarism: (assignment as any).allow_plagiarism || false,
      allow_late_submission: (assignment as any).allow_late_submission || false,
      allowed_formats: {
        pdf: true,
        image: false,
        docs: true,
        xlsx: false,
        zip: false
      },
      attachment: null,
      assignment_type: 'file_upload' as const,
      faculty_id: faculty?.id || '',
      faculty_name: faculty?.name || '',
      faculty_email: faculty?.email || '',
      status: 'published' as const,
      visibility: true,
      enable_plagiarism_check: (assignment as any).allow_plagiarism || false,
      attachment_url: assignment.attachment_url || null
    });
    
    setEditingAssignment(assignment);
    setAssignmentMode('manual');
    setCurrentStep('create');
    setShowForm(true);
    setShowAIForm(false);
  };

  const handleGrade = async (submissionId: string, grade: number, feedback: string) => {
    try {
      const { error } = await gradeSubmission(submissionId, grade, feedback);
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Grade submitted successfully!"
      });
      
      // Update local state
      setSubmissions(prev => 
        prev.map(s => 
          s.id === submissionId 
            ? { ...s, grade, feedback }
            : s
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit grade",
        variant: "destructive"
      });
    }
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiGenerating(true);
    try {
      const generatedForm = await generateFormFromPrompt(aiPrompt);
      
      // Convert AI generated form to assignment format
      setFormData({
        title: generatedForm.title || "",
        description: generatedForm.description || "",
        question: generatedForm.description || "", // AI generated question
        rules: "",
        instructions: generatedForm.description || "",
        department: faculty.department || "",
        year: "",
        start_date: new Date().toISOString().split('T')[0],
        due_date: "",
        attachment: null,
        assignment_type: "file_upload",
        max_marks: 100,
        allow_plagiarism: false,
        allow_late_submission: false,
        allowed_formats: {
          pdf: false,
          image: false,
          docs: false,
          xlsx: false,
          zip: false
        },
        faculty_id: faculty.id || "",
        faculty_name: faculty.name || "",
        faculty_email: faculty.email || "",
        status: "draft",
        visibility: false,
        enable_plagiarism_check: true,
        attachment_url: null
      });

      toast({
        title: "AI Assignment Generated! ✨",
        description: "Assignment details have been generated. Please review and complete the form.",
      });

      setShowAIForm(false);
      setShowForm(true);
      setAiPrompt("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate assignment with AI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading assignments...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assignments</h1>
      </div>

      {/* Modern Assignment Creation Modules */}
      <SimplifiedAssignmentModule
        onCreateManualAction={() => { setAssignmentMode('manual'); setShowForm(true); setShowAIForm(false); }}
        onCreateAIAction={() => { setAssignmentMode('ai'); setShowForm(true); setShowAIForm(true); }}
      />

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl w-full max-w-4xl min-h-[95vh] sm:min-h-0 sm:max-h-[95vh] flex flex-col my-2 sm:my-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 rounded-t-lg sm:rounded-t-2xl flex-shrink-0">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h2 className="text-lg sm:text-2xl font-bold">
                    {assignmentMode === 'manual' ? '📝 Create Manual Assignment' : '✨ Create AI Assignment'}
                  </h2>
                  <p className="text-blue-100 mt-1 text-sm sm:text-base">
                    {assignmentMode === 'manual' 
                      ? 'Design your assignment with complete control' 
                      : 'Let AI help you generate assignment questions'
                    }
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowForm(false);
                    setCurrentStep('create');
                  }}
                  className="text-white hover:bg-white/20 rounded-full p-2 flex-shrink-0"
                >
                  ✕
                </Button>
              </div>
              
              {/* Progress Steps */}
              <div className="flex items-center mt-4 sm:mt-6 space-x-2 sm:space-x-4 overflow-x-auto">
                <div className={`flex items-center space-x-2 ${currentStep === 'create' ? 'text-white' : 'text-blue-200'} flex-shrink-0`}>
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${currentStep === 'create' ? 'bg-white text-blue-600' : 'bg-blue-500'}`}>
                    1
                  </div>
                  <span className="font-medium text-sm sm:text-base">Create</span>
                </div>
                <div className="w-4 sm:w-8 h-0.5 bg-blue-300 flex-shrink-0"></div>
                <div className={`flex items-center space-x-2 ${currentStep === 'settings' ? 'text-white' : 'text-blue-200'} flex-shrink-0`}>
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${currentStep === 'settings' ? 'bg-white text-blue-600' : 'bg-blue-500'}`}>
                    2
                  </div>
                  <span className="font-medium text-sm sm:text-base">Settings</span>
                </div>
                <div className="w-4 sm:w-8 h-0.5 bg-blue-300 flex-shrink-0"></div>
                <div className={`flex items-center space-x-2 ${currentStep === 'preview' ? 'text-white' : 'text-blue-200'} flex-shrink-0`}>
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${currentStep === 'preview' ? 'bg-white text-blue-600' : 'bg-blue-500'}`}>
                    3
                  </div>
                  <span className="font-medium text-sm sm:text-base">Preview</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              {currentStep === 'create' && (
                <div className="space-y-6">
                  {assignmentMode === 'ai' && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                      <h3 className="text-lg font-semibold text-purple-800 mb-3">✨ AI Assignment Generator</h3>
                      <Textarea
                        placeholder="Describe what kind of assignment you want to create. For example: 'Create a programming assignment about data structures and algorithms for computer science students, focusing on implementing binary trees with practical examples.'"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="min-h-[100px] border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                      />
                      <Button 
                        onClick={handleAIGenerate}
                        disabled={aiGenerating || !aiPrompt.trim()}
                        className="mt-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {aiGenerating ? 'Generating...' : 'Generate Assignment'}
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Name *</label>
                        <Input
                          placeholder="Enter assignment name"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <Input
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                        <Input
                          type="date"
                          value={formData.due_date}
                          onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                        <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Computer Science and Engineering">Computer Science and Engineering</SelectItem>
                            <SelectItem value="Cyber Security">Cyber Security</SelectItem>
                            <SelectItem value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</SelectItem>
                            <SelectItem value="BBA">BBA</SelectItem>
                            <SelectItem value="MBA">MBA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                        <Select value={formData.year} onValueChange={(value) => setFormData({...formData, year: value})}>
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1st Year">1st Year</SelectItem>
                            <SelectItem value="2nd Year">2nd Year</SelectItem>
                            <SelectItem value="3rd Year">3rd Year</SelectItem>
                            <SelectItem value="4th Year">4th Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Attachment</label>
                        <Input
                          type="file"
                          onChange={(e) => setFormData({...formData, attachment: e.target.files?.[0] || null})}
                          accept=".pdf,.doc,.docx,.txt,.zip"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Question *</label>
                      <Textarea
                        placeholder="Enter the assignment question or problem statement"
                        value={formData.question}
                        onChange={(e) => setFormData({...formData, question: e.target.value})}
                        className="min-h-[120px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rules</label>
                        <Textarea
                          placeholder="Enter assignment rules and guidelines"
                          value={formData.rules}
                          onChange={(e) => setFormData({...formData, rules: e.target.value})}
                          className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                        <Textarea
                          placeholder="Enter detailed instructions for students"
                          value={formData.instructions}
                          onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                          className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800">Assignment Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          id="allow_plagiarism"
                          checked={formData.allow_plagiarism}
                          onChange={(e) => setFormData({...formData, allow_plagiarism: e.target.checked})}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="allow_plagiarism" className="text-sm font-medium text-gray-700">
                          Allow Plagiarism Detection
                        </label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          id="allow_late_submission"
                          checked={formData.allow_late_submission}
                          onChange={(e) => setFormData({...formData, allow_late_submission: e.target.checked})}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="allow_late_submission" className="text-sm font-medium text-gray-700">
                          Allow Late Submissions
                        </label>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-gray-800 mb-3">Allowed File Formats</h4>
                      <div className="space-y-2">
                        {Object.entries(formData.allowed_formats).map(([format, checked]) => (
                          <div key={format} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <input
                              type="checkbox"
                              id={format}
                              checked={checked}
                              onChange={(e) => setFormData({
                                ...formData, 
                                allowed_formats: {
                                  ...formData.allowed_formats,
                                  [format]: e.target.checked
                                }
                              })}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={format} className="text-sm font-medium text-gray-700 capitalize">
                              {format.toUpperCase()} Files
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'preview' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800">Preview Assignment</h3>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                    <h4 className="text-2xl font-bold text-gray-800 mb-4">{formData.title}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <p><strong>Department:</strong> {formData.department}</p>
                        <p><strong>Year:</strong> {formData.year}</p>
                        <p><strong>Start Date:</strong> {new Date(formData.start_date).toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-2">
                        <p><strong>Due Date:</strong> {new Date(formData.due_date).toLocaleDateString()}</p>
                        <p><strong>Plagiarism Check:</strong> {formData.allow_plagiarism ? 'Enabled' : 'Disabled'}</p>
                        <p><strong>Late Submissions:</strong> {formData.allow_late_submission ? 'Allowed' : 'Not Allowed'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Question:</h5>
                        <p className="text-gray-600 bg-white p-3 rounded-lg">{formData.question}</p>
                      </div>

                      {formData.rules && (
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2">Rules:</h5>
                          <p className="text-gray-600 bg-white p-3 rounded-lg">{formData.rules}</p>
                        </div>
                      )}

                      {formData.instructions && (
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2">Instructions:</h5>
                          <p className="text-gray-600 bg-white p-3 rounded-lg">{formData.instructions}</p>
                        </div>
                      )}

                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Allowed File Formats:</h5>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(formData.allowed_formats)
                            .filter(([_, checked]) => checked)
                            .map(([format]) => (
                              <span key={format} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {format.toUpperCase()}
                              </span>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t flex-shrink-0 rounded-b-lg sm:rounded-b-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                <div className="order-2 sm:order-1">
                  {currentStep !== 'create' && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        if (currentStep === 'settings') setCurrentStep('create');
                        if (currentStep === 'preview') setCurrentStep('settings');
                      }}
                      className="w-full sm:w-auto"
                      size="sm"
                    >
                      ← Back
                    </Button>
                  )}
                </div>
                
                <div className="order-1 sm:order-2 w-full sm:w-auto">
                  {currentStep === 'create' && (
                    <Button 
                      onClick={() => setCurrentStep('settings')}
                      disabled={!formData.title || !formData.question || !formData.due_date || !formData.department || !formData.year}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="sm"
                    >
                      Next: Settings →
                    </Button>
                  )}
                  
                  {currentStep === 'settings' && (
                    <Button 
                      onClick={() => setCurrentStep('preview')}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="sm"
                    >
                      Next: Preview →
                    </Button>
                  )}
                  
                  {currentStep === 'preview' && (
                    <Button 
                      onClick={handleSubmit}
                      className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      size="sm"
                    >
                      🚀 Publish Assignment
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      

      {/* Published Assignments Section */}
      {assignments.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Published Assignments</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {assignments.length} Published
            </Badge>
          </div>

          {/* Modern Assignment Cards Grid */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {assignments.map((assignment) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-tight line-clamp-2 text-gray-800">
                            {assignment.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {assignment.department}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              Year {assignment.year}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={assignment.due_date < new Date().toISOString() ? "destructive" : "default"}
                        className="shrink-0"
                      >
                        <Calendar className="w-3 h-3 mr-1" /> 
                        {new Date(assignment.due_date).toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                      {assignment.description || (assignment as any).question || 'No description available'}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4 p-3 bg-gray-50 rounded-lg">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" /> 
                        {assignment.max_marks || 100} marks
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                    </div>

                    {assignment.attachment_url && (
                      <div className="mb-4">
                        <a
                          href={assignment.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                        >
                          📎 View Attachment
                        </a>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditAssignment(assignment)}
                        className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        ✏️ Edit
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleViewSubmissions(assignment)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        📋 Submissions ({submissions.filter(s => s.assignment_id === assignment.id).length})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {assignments.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No assignments yet</h3>
          <p className="text-gray-600 mb-6">Create your first assignment to get started</p>
        </div>
      )}

      {selectedAssignment && (
        <Card>
          <CardHeader>
            <CardTitle>Submissions for: {selectedAssignment.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="border p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{submission.student_name}</h4>
                      <p className="text-sm text-gray-600">{submission.student_email}</p>
                      <p className="mt-2">{submission.submission_text}</p>
                      {submission.attachment_url && (
                        <a 
                          href={submission.attachment_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          📎 View Submission
                        </a>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Submitted: {new Date(submission.submitted_at!).toLocaleDateString()}
                      </p>
                      {submission.grade && (
                        <p className="font-semibold">Grade: {submission.grade}/100</p>
                      )}
                    </div>
                  </div>
                  {!submission.grade && (
                    <div className="mt-4 flex gap-2">
                      <Input
                        type="number"
                        placeholder="Grade (0-100)"
                        min="0"
                        max="100"
                        className="w-24"
                        onChange={(e) => {
                          const grade = parseInt(e.target.value);
                          const feedback = prompt("Enter feedback:");
                          if (feedback !== null) {
                            handleGrade(submission.id!, grade, feedback);
                          }
                        }}
                      />
                    </div>
                  )}
                  {submission.feedback && (
                    <p className="mt-2 text-sm text-gray-600">
                      <strong>Feedback:</strong> {submission.feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
