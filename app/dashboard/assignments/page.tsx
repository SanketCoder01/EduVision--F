"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { getFacultyAssignments, getAssignmentSubmissions, gradeSubmission, Assignment, AssignmentSubmission } from "@/lib/assignments";
import { useRealtimeAssignments, useRealtimeSubmissions } from "@/hooks/useRealtimeAssignments";
import { X, Paperclip, FileCheck, AlertTriangle, Download, Zap } from "lucide-react";
import SimplifiedAssignmentModule from "@/components/SimplifiedAssignmentModule";
import { motion } from "framer-motion";
import { DEPARTMENTS } from '@/lib/constants/departments';
import { createAssignment } from './actions';
import { MultiSelect } from '@/components/ui/multi-select';
import PlagiarismReport from '@/components/PlagiarismReport';
import { UploadAndGenerate } from '@/components/ai/UploadAndGenerate';
import PromptQuestionGenerator from '@/components/ai/PromptQuestionGenerator';

export default function FacultyAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [assignmentMode, setAssignmentMode] = useState<'manual' | 'ai' | 'upload-generate'>('manual');
  const [currentStep, setCurrentStep] = useState<'create' | 'settings' | 'preview'>('create');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showPlagiarismReport, setShowPlagiarismReport] = useState<any>(null);
  const [autoGrading, setAutoGrading] = useState(false);
  const [maxMarksForGrading, setMaxMarksForGrading] = useState(100);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [faculty, setFaculty] = useState<any>(null);
  const [facultyLoading, setFacultyLoading] = useState(true);

  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    question: "",
    rules: "",
    instructions: "",
    start_date: new Date().toISOString().split('T')[0],
    due_date: "",
    department: "",
    year: "",
    max_marks: 100,
    allow_plagiarism: false,
    allow_late_submission: false,
    allowed_formats: { pdf: true, image: false, docs: true, xlsx: false, zip: false },
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  async function generateFormFromPrompt(prompt: string) {
    return { title: "AI Generated Assignment", description: prompt } as any;
  }

  const supabase = createClient();

  const fetchFacultyAndAssignments = useCallback(async () => {
    setFacultyLoading(true);
    try {
      // Mock faculty data since authentication is disabled
      const mockFaculty = {
        id: 'demo-faculty',
        email: 'demo@faculty.edu',
        name: 'Demo Faculty',
        department: 'Computer Science and Engineering'
      };
      setFaculty(mockFaculty);
      
      // Load assignments with mock data
      const { data: assignmentsData, error: assignErr } = await getFacultyAssignments(mockFaculty.email);
      if (assignErr) {
        console.error('Assignments fetch error:', assignErr);
        toast({ title: 'Error', description: 'Failed to load assignments.', variant: 'destructive' });
      }
      setAssignments(assignmentsData || []);
    } catch (err) {
      console.error('Error during initial load:', err);
      toast({ title: 'Error', description: 'Something went wrong while loading assignments.', variant: 'destructive' });
    } finally {
      setFacultyLoading(false);
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFacultyAndAssignments();
  }, [fetchFacultyAndAssignments]);

  useRealtimeAssignments(
    faculty?.department || "", 
    "", 
    useCallback((newAssignment: Assignment) => {
      if (faculty?.id && newAssignment.faculty_id === faculty.id) {
        setAssignments(prev => [newAssignment, ...prev.filter(a => a.id !== newAssignment.id)]);
      }
    }, [faculty?.id])
  );

  useRealtimeSubmissions(
    selectedAssignment?.id || "", 
    useCallback((newSubmission: AssignmentSubmission) => {
      if (selectedAssignment?.id === newSubmission.assignment_id) {
        setSubmissions(prev => [newSubmission, ...prev.filter(s => s.id !== newSubmission.id)]);
      }
    }, [selectedAssignment?.id])
  );

  if (facultyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createAssignment(formData);
      if (result.success) {
        toast({ title: 'Success', description: result.message });
        setShowForm(false);
        fetchFacultyAndAssignments();
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    });
  };

  const handleViewSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    try {
      const assignmentId = assignment.id || '';
      if (!assignmentId) throw new Error('Assignment ID not found');
      const { data, error } = await getAssignmentSubmissions(assignmentId);
      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({ title: "Error", description: "Failed to load submissions.", variant: "destructive" });
    }
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      question: (assignment as any).question || '',
      rules: (assignment as any).rules || '',
      instructions: (assignment as any).instructions || '',
      due_date: assignment.due_date.split('T')[0],
      start_date: assignment.start_date ? assignment.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
      department: assignment.department,
      year: assignment.year,
      max_marks: assignment.max_marks || 100,
      allow_plagiarism: (assignment as any).allow_plagiarism || false,
      allow_late_submission: (assignment as any).allow_late_submission || false,
      allowed_formats: { pdf: true, image: false, docs: true, xlsx: false, zip: false },
    });
    setEditingAssignment(assignment);
    setAssignmentMode('manual');
    setCurrentStep('create');
    setShowForm(true);
  };

  const handleGradeSubmission = async (submissionId: string, grade: string, feedback: string) => {
    try {
      const numericGrade = grade ? Number(grade) : NaN;
      if (Number.isNaN(numericGrade)) throw new Error('Invalid grade');
      const { error } = await gradeSubmission(submissionId, numericGrade, feedback);
      if (error) throw error;
      toast({ title: "Success", description: "Grade submitted successfully!" });
      setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, grade: numericGrade, feedback } : s));
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit grade", variant: "destructive" });
    }
  };

  const handlePlagiarismCheck = async (submission: AssignmentSubmission) => {
    try {
      const response = await fetch('/api/plagiarism', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: submission.submission_text || submission.content,
          title: selectedAssignment?.title,
          assignmentId: selectedAssignment?.id,
          studentId: submission.student_id
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setShowPlagiarismReport({
          ...result.report,
          submissionId: submission.id,
          studentName: submission.student_name
        });
        toast({ title: "Plagiarism Check Complete", description: `${result.plagiarismScore}% similarity detected` });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to check plagiarism", variant: "destructive" });
    }
  };

  const handleAutoGrade = async () => {
    if (!selectedAssignment?.id) return;
    
    setAutoGrading(true);
    try {
      const response = await fetch('/api/auto-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          maxMarks: maxMarksForGrading
        })
      });
      
      const result = await response.json();
      if (result.success) {
        toast({ 
          title: "Auto-grading Complete", 
          description: `${result.gradedCount} submissions graded automatically` 
        });
        // Refresh submissions
        handleViewSubmissions(selectedAssignment);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to auto-grade submissions", variant: "destructive" });
    } finally {
      setAutoGrading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setAiGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-assignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          subject: formData.department || 'General',
          difficulty: 'medium',
          assignmentType: 'comprehensive'
        }),
      });

      const result = await response.json();

      if (result.success) {
        const aiData = result.data;
        setFormData({
          ...formData,
          title: aiData.title || "AI Generated Assignment",
          description: aiData.description || "This assignment was generated using AI based on your prompt.",
          question: aiData.question || aiPrompt,
          instructions: aiData.instructions || "Follow the guidelines provided and submit your work on time.",
          rules: aiData.rules || "Ensure originality and proper citations."
        });
        setAiPrompt('');
        toast({ title: "Success", description: "Assignment generated successfully!" });
      } else {
        console.error('API Error:', result.error, result.details, result.debug);
        throw new Error(result.details || result.error || 'Failed to generate assignment');
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      
      // Show error message to user
      toast({ 
        title: "AI Generation Failed", 
        description: "Using fallback generation. Check console for details.",
        variant: "destructive"
      });
      
      // Fallback to basic generation with more intelligent parsing
      const fallbackTitle = extractTitleFromPrompt(aiPrompt);
      const fallbackDescription = generateDescriptionFromPrompt(aiPrompt, formData.department);
      
      setFormData({
        ...formData,
        title: fallbackTitle,
        description: fallbackDescription,
        question: aiPrompt,
        instructions: generateInstructionsFromPrompt(aiPrompt),
        rules: "Ensure originality and proper citations. Follow academic integrity guidelines."
      });
      setAiPrompt('');
    } finally {
      setAiGenerating(false);
    }
  };

  // Helper functions for fallback generation
  const extractTitleFromPrompt = (prompt: string): string => {
    const words = prompt.split(' ').slice(0, 6);
    return `Assignment: ${words.join(' ')}`;
  };

  const generateDescriptionFromPrompt = (prompt: string, department?: string): string => {
    return `This assignment focuses on ${prompt.toLowerCase()}. Students will demonstrate their understanding of key concepts in ${department || 'the subject area'} through comprehensive analysis and practical application.`;
  };

  const generateInstructionsFromPrompt = (prompt: string): string => {
    if (prompt.toLowerCase().includes('program') || prompt.toLowerCase().includes('code')) {
      return "1. Write clean, well-documented code\n2. Test your solution thoroughly\n3. Submit source code and documentation\n4. Follow coding best practices";
    } else if (prompt.toLowerCase().includes('essay') || prompt.toLowerCase().includes('write')) {
      return "1. Structure your response clearly with introduction, body, and conclusion\n2. Support arguments with evidence\n3. Cite sources properly\n4. Proofread before submission";
    } else {
      return "1. Read the requirements carefully\n2. Plan your approach before starting\n3. Show your work and reasoning\n4. Submit by the due date";
    }
  };

  if (isPending) return <div className="p-6">Loading assignments...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assignments</h1>
      </div>

      <SimplifiedAssignmentModule
        onCreateManualAction={() => { 
          setAssignmentMode('manual'); 
          setShowForm(true); 
          setEditingAssignment(null); 
          setFormData({ 
            title: "", description: "", question: "", rules: "", instructions: "", 
            start_date: new Date().toISOString().split('T')[0], due_date: "", 
            department: "", year: "", max_marks: 100, 
            allow_plagiarism: false, allow_late_submission: false, 
            allowed_formats: { pdf: true, image: false, docs: true, xlsx: false, zip: false } 
          }); 
        }}
        onCreateAIAction={() => { 
          setAssignmentMode('ai'); 
          setShowForm(true); 
          setEditingAssignment(null); 
        }}
        onUploadGenerateAction={() => { 
          setAssignmentMode('upload-generate'); 
          setShowForm(true); 
          setEditingAssignment(null); 
        }}
      />

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl w-full max-w-4xl min-h-[95vh] sm:min-h-0 sm:max-h-[95vh] flex flex-col my-2 sm:my-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 rounded-t-lg sm:rounded-t-2xl flex-shrink-0">
              <div className="flex justify-between items-start">
                <h2 className="text-lg sm:text-2xl font-bold">
                  {editingAssignment ? '📝 Edit Assignment' : 
                   assignmentMode === 'manual' ? '📝 Create Manual Assignment' : 
                   assignmentMode === 'ai' ? '✨ Create AI Assignment' : 
                   '📤 Upload & Generate Assignment'}
                </h2>
                <Button variant="ghost" onClick={() => setShowForm(false)} className="text-white hover:bg-white/20 rounded-full p-2 flex-shrink-0">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                {/* Form content based on assignment mode */}
                {assignmentMode === 'upload-generate' ? (
                  <UploadAndGenerate />
                ) : assignmentMode === 'ai' ? (
                  <div className="space-y-6">
                    {/* AI Prompt Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
                      <h3 className="text-lg font-semibold text-purple-800 mb-4">✨ AI Assignment Generator</h3>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Describe the assignment you want to create... (e.g., 'Create a programming assignment on data structures focusing on linked lists with 3 problems of varying difficulty')"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          className="min-h-[100px] border-purple-200 focus:border-purple-400"
                        />
                        <Button 
                          type="button"
                          onClick={handleAIGenerate}
                          disabled={aiGenerating || !aiPrompt.trim()}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {aiGenerating ? 'Generating...' : '✨ Generate with AI'}
                        </Button>
                      </div>
                    </div>

                    {/* Generated Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Assignment Title</label>
                        <Input
                          name="title"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          placeholder="Enter assignment title"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Department</label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={(e) => setFormData({...formData, department: e.target.value})}
                          className="w-full p-2 border rounded-lg"
                          required
                        >
                          <option value="">Select Department</option>
                          <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                          <option value="Cyber Security">Cyber Security</option>
                          <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
                          <option value="Artificial Intelligence and Machine Learning">Artificial Intelligence and Machine Learning</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Academic Year</label>
                        <select
                          name="year"
                          value={formData.year}
                          onChange={(e) => setFormData({...formData, year: e.target.value})}
                          className="w-full p-2 border rounded-lg"
                          required
                        >
                          <option value="">Select Year</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Max Marks</label>
                        <Input
                          name="max_marks"
                          type="number"
                          value={formData.max_marks}
                          onChange={(e) => setFormData({...formData, max_marks: parseInt(e.target.value)})}
                          placeholder="100"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Start Date</label>
                        <Input
                          name="start_date"
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Due Date</label>
                        <Input
                          name="due_date"
                          type="date"
                          value={formData.due_date}
                          onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Describe the assignment objectives and context"
                        className="min-h-[100px]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Question/Problem Statement</label>
                      <Textarea
                        name="question"
                        value={formData.question}
                        onChange={(e) => setFormData({...formData, question: e.target.value})}
                        placeholder="Enter the main question or problem statement"
                        className="min-h-[120px]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Instructions</label>
                      <Textarea
                        name="instructions"
                        value={formData.instructions}
                        onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                        placeholder="Provide step-by-step instructions for students"
                        className="min-h-[100px]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Rules & Guidelines</label>
                      <Textarea
                        name="rules"
                        value={formData.rules}
                        onChange={(e) => setFormData({...formData, rules: e.target.value})}
                        placeholder="List any specific rules, constraints, or guidelines"
                        className="min-h-[80px]"
                      />
                    </div>

                    {/* Question Generator Section */}
                    <div className="mt-8 border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">📝 Generate Questions</h3>
                      <PromptQuestionGenerator 
                        onQuestionsGenerated={(questions) => setGeneratedQuestions(questions)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Manual Assignment Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Assignment Title</label>
                        <Input
                          name="title"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          placeholder="Enter assignment title"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Department</label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={(e) => setFormData({...formData, department: e.target.value})}
                          className="w-full p-2 border rounded-lg"
                          required
                        >
                          <option value="">Select Department</option>
                          <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                          <option value="Cyber Security">Cyber Security</option>
                          <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
                          <option value="Artificial Intelligence and Machine Learning">Artificial Intelligence and Machine Learning</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Academic Year</label>
                        <select
                          name="year"
                          value={formData.year}
                          onChange={(e) => setFormData({...formData, year: e.target.value})}
                          className="w-full p-2 border rounded-lg"
                          required
                        >
                          <option value="">Select Year</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Max Marks</label>
                        <Input
                          name="max_marks"
                          type="number"
                          value={formData.max_marks}
                          onChange={(e) => setFormData({...formData, max_marks: parseInt(e.target.value)})}
                          placeholder="100"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Start Date</label>
                        <Input
                          name="start_date"
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Due Date</label>
                        <Input
                          name="due_date"
                          type="date"
                          value={formData.due_date}
                          onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Describe the assignment objectives and context"
                        className="min-h-[100px]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Question/Problem Statement</label>
                      <Textarea
                        name="question"
                        value={formData.question}
                        onChange={(e) => setFormData({...formData, question: e.target.value})}
                        placeholder="Enter the main question or problem statement"
                        className="min-h-[120px]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Instructions</label>
                      <Textarea
                        name="instructions"
                        value={formData.instructions}
                        onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                        placeholder="Provide step-by-step instructions for students"
                        className="min-h-[100px]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Rules & Guidelines</label>
                      <Textarea
                        name="rules"
                        value={formData.rules}
                        onChange={(e) => setFormData({...formData, rules: e.target.value})}
                        placeholder="List any specific rules, constraints, or guidelines"
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 p-4 sm:p-6 rounded-b-lg sm:rounded-b-2xl flex-shrink-0 flex items-center justify-between">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Publishing...' : (editingAssignment ? 'Update Assignment' : 'Publish Assignment')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Your Assignments</CardTitle></CardHeader>
        <CardContent>
          {assignments.length > 0 ? (
            <ul className="space-y-4">
              {assignments.map((assignment) => (
                <li key={assignment.id} className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{assignment.title}</h3>
                    <p className="text-sm text-gray-500">Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
                    <Badge className="mt-2">{assignment.department} - {assignment.year}</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditAssignment(assignment)}>Edit</Button>
                    <Button size="sm" onClick={() => handleViewSubmissions(assignment)}>View Submissions</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>You have not created any assignments yet.</p>
          )}
        </CardContent>
      </Card>

      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Submissions for {selectedAssignment.title}</h2>
                <p className="text-sm text-gray-600 mt-1">{submissions.length} submissions</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Max marks"
                    value={maxMarksForGrading}
                    onChange={(e) => setMaxMarksForGrading(Number(e.target.value))}
                    className="w-24 h-8"
                  />
                  <Button
                    onClick={handleAutoGrade}
                    disabled={autoGrading}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    {autoGrading ? 'Grading...' : 'Auto Grade All'}
                  </Button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedAssignment(null)}><X className="h-6 w-6" /></Button>
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              {submissions.length > 0 ? (
                <div className="space-y-6">
                  {submissions.map(submission => (
                    <div key={submission.id} className="bg-white border border-gray-200 rounded-xl shadow-sm transition-all hover:shadow-md">
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-lg text-gray-800">{submission.student_name || 'Student'}</p>
                            <p className="text-sm text-gray-500">{submission.student_email || ''}</p>
                            <p className="text-sm text-gray-500">Submitted on: {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : '—'}</p>
                            {submission.plagiarism_score !== undefined && (
                              <div className="flex items-center gap-2 mt-1">
                                <AlertTriangle className={`h-4 w-4 ${
                                  submission.plagiarism_score > 20 ? 'text-red-500' :
                                  submission.plagiarism_score > 10 ? 'text-yellow-500' : 'text-green-500'
                                }`} />
                                <span className="text-sm font-medium">
                                  Plagiarism: {submission.plagiarism_score}%
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {submission.plagiarism_score !== undefined && (
                              <Badge className={`${
                                submission.plagiarism_score > 20 ? 'bg-red-100 text-red-800' :
                                submission.plagiarism_score > 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {submission.plagiarism_score > 20 ? 'High Risk' :
                                 submission.plagiarism_score > 10 ? 'Medium Risk' : 'Low Risk'}
                              </Badge>
                            )}
                            <Badge className={submission.grade != null ? 'bg-green-100 text-green-800' : ''}>
                              {submission.grade != null ? `Graded: ${submission.grade}` : 'Not Graded'}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-gray-700">Submission Details</h4>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => handlePlagiarismCheck(submission)}
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-2"
                              >
                                <FileCheck className="h-4 w-4" />
                                Check Plagiarism
                              </Button>
                              {submission.plagiarism_score !== undefined && (
                                <Button
                                  onClick={() => setShowPlagiarismReport({
                                    id: `report_${submission.id}`,
                                    appName: 'EduVision',
                                    assignment: {
                                      name: selectedAssignment?.title || 'Assignment',
                                      dateGiven: selectedAssignment?.created_at || new Date().toISOString(),
                                      dateSubmitted: submission.submitted_at || new Date().toISOString(),
                                      dueDate: selectedAssignment?.due_date || new Date().toISOString(),
                                      maxMarks: selectedAssignment?.max_marks || 100
                                    },
                                    student: {
                                      name: submission.student_name || 'Student',
                                      email: submission.student_email || '',
                                      department: submission.student?.department || '',
                                      year: submission.student?.year || ''
                                    },
                                    plagiarism: {
                                      percentage: submission.plagiarism_score,
                                      status: submission.plagiarism_score > 20 ? 'High Risk' :
                                              submission.plagiarism_score > 10 ? 'Medium Risk' : 'Low Risk',
                                      checkedAt: submission.processed_at || new Date().toISOString(),
                                      sources: submission.plagiarism_sources || []
                                    },
                                    grading: {
                                      grade: submission.grade,
                                      feedback: submission.feedback,
                                      gradedAt: submission.graded_at,
                                      autoGrade: submission.auto_grade
                                    },
                                    generatedAt: new Date().toISOString()
                                  })}
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center gap-2"
                                >
                                  <Download className="h-4 w-4" />
                                  View Report
                                </Button>
                              )}
                            </div>
                          </div>
                          {submission.attachment_url && (
                            <a href={submission.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:underline font-medium">
                              <Paperclip className="h-4 w-4" /> View Submitted File
                            </a>
                          )}
                          {submission.submission_text && <p className="mt-2 text-gray-600 bg-gray-50 p-3 rounded-lg">{submission.submission_text}</p>}
                        </div>
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const grade = formData.get('grade') as string;
                            const feedback = formData.get('feedback') as string;
                            handleGradeSubmission(submission.id!, grade, feedback);
                          }}
                          className="mt-6 pt-6 border-t border-gray-200"
                        >
                          <h4 className="font-semibold text-gray-700 mb-4">Grade Submission</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input name="grade" placeholder="Enter numeric grade (e.g., 85)" defaultValue={submission.grade ?? ''} className="md:col-span-1" />
                            <Input name="feedback" placeholder="Enter feedback (optional)" defaultValue={submission.feedback || ''} className="md:col-span-2" />
                          </div>
                          <Button type="submit" className="mt-4">Submit Grade</Button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No submissions yet for this assignment.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Plagiarism Report Modal */}
      {showPlagiarismReport && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Plagiarism Report</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowPlagiarismReport(null)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PlagiarismReport 
                report={showPlagiarismReport} 
                onDownload={() => {
                  toast({ title: "Report Downloaded", description: "Plagiarism report has been downloaded successfully" });
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
