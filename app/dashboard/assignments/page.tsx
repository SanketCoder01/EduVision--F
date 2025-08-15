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
import { X, Paperclip } from "lucide-react";
import SimplifiedAssignmentModule from "@/components/SimplifiedAssignmentModule";
import { motion } from "framer-motion";
import { DEPARTMENTS } from '@/lib/constants/departments';
import { createAssignment } from './actions';
import { MultiSelect } from '@/components/ui/multi-select';

export default function FacultyAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [assignmentMode, setAssignmentMode] = useState<'manual' | 'ai'>('manual');
  const [currentStep, setCurrentStep] = useState<'create' | 'settings' | 'preview'>('create');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
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
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  async function generateFormFromPrompt(prompt: string) {
    return { title: "AI Generated Assignment", description: prompt } as any;
  }

  const supabase = createClient();

  const fetchFacultyAndAssignments = useCallback(async () => {
    setFacultyLoading(true);
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (user) {
        const { data: facultyProfile, error: facErr } = await supabase
          .from('faculty')
          .select('*')
          .eq('id', user.id)
          .single();
        if (facErr) {
          // Not fatal for loading; surface and continue with empty faculty
          console.warn('Faculty profile fetch error:', facErr);
          toast({ title: 'Warning', description: 'Could not load faculty profile. Some features may be limited.', variant: 'destructive' });
          setFaculty(null);
        } else {
          setFaculty(facultyProfile);
          if (facultyProfile?.email) {
            const { data: assignmentsData, error: assignErr } = await getFacultyAssignments(facultyProfile.email);
            if (assignErr) {
              console.error('Assignments fetch error:', assignErr);
              toast({ title: 'Error', description: 'Failed to load assignments.', variant: 'destructive' });
            }
            setAssignments(assignmentsData || []);
          }
        }
      }
    } catch (err) {
      console.error('Error during initial load:', err);
      toast({ title: 'Error', description: 'Something went wrong while loading assignments.', variant: 'destructive' });
    } finally {
      setFacultyLoading(false);
      setLoading(false);
    }
  }, [supabase, toast]);

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

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    try {
      const generatedForm = await generateFormFromPrompt(aiPrompt);
      setFormData({
        ...formData,
        title: generatedForm.title || "",
        description: generatedForm.description || "",
        question: generatedForm.description || "",
        instructions: generatedForm.description || "",
        department: faculty.department || "",
      });
      toast({ title: "AI Assignment Generated! ✨", description: "Review and complete the form." });
      setAiPrompt("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate with AI.", variant: "destructive" });
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) return <div className="p-6">Loading assignments...</div>;

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
      />

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl w-full max-w-4xl min-h-[95vh] sm:min-h-0 sm:max-h-[95vh] flex flex-col my-2 sm:my-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 rounded-t-lg sm:rounded-t-2xl flex-shrink-0">
              <div className="flex justify-between items-start">
                <h2 className="text-lg sm:text-2xl font-bold">
                  {editingAssignment ? '📝 Edit Assignment' : (assignmentMode === 'manual' ? '📝 Create Manual Assignment' : '✨ Create AI Assignment')}
                </h2>
                <Button variant="ghost" onClick={() => setShowForm(false)} className="text-white hover:bg-white/20 rounded-full p-2 flex-shrink-0">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                {/* Form content based on step */}
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
              <h2 className="text-2xl font-bold text-gray-800">Submissions for {selectedAssignment.title}</h2>
              <Button variant="ghost" size="icon" onClick={() => setSelectedAssignment(null)}><X className="h-6 w-6" /></Button>
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
                          </div>
                          <Badge className={submission.grade != null ? 'bg-green-100 text-green-800' : ''}>
                            {submission.grade != null ? `Graded: ${submission.grade}` : 'Not Graded'}
                          </Badge>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-semibold text-gray-700 mb-2">Submission Details</h4>
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
    </div>
  );
}
