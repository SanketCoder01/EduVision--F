"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getStudentAssignments, submitAssignment, getStudentSubmissions, Assignment, AssignmentSubmission } from "@/lib/assignments";
import { useRealtimeAssignments } from "@/hooks/useRealtimeAssignments";
import { uploadAssignmentFile } from "@/lib/storage";

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [mySubmissions, setMySubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const { toast } = useToast();

  // Get student info from localStorage
  const getStudentInfo = () => {
    const studentSession = localStorage.getItem("student_session")
    if (studentSession) {
      const session = JSON.parse(studentSession)
      const users = JSON.parse(localStorage.getItem("student_users") || "[]")
      const user = users.find((u: any) => u.email === session.email)
      return user || session
    }
    return {}
  }
  
  const student = getStudentInfo();

  const [submitFormData, setSubmitFormData] = useState({
    submission_text: "",
    attachment: null as File | null
  });

  // Load assignments
  const loadAssignments = async () => {
    try {
      // Get assignments from localStorage (mock database)
      const allAssignments = JSON.parse(localStorage.getItem("assignments") || "[]")
      
      // Filter assignments for current student's year and department
      const filtered = allAssignments.filter((assignment: any) => {
        // Check if assignment is published
        if (assignment.status !== "published") return false
        
        // Check if assignment is for student's department
        if (assignment.department && assignment.department !== student.department) return false
        
        // Check if assignment is for student's year (most important filter)
        if (assignment.targetYear && assignment.targetYear !== student.year) return false
        
        return true
      })
      
      setAssignments(filtered);
      } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load my submissions
  const loadMySubmissions = async () => {
    try {
      const { data, error } = await getStudentSubmissions(student.id);
      if (error) throw error;
      setMySubmissions(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive"
      });
    }
  };

  // Real-time assignment updates
  useRealtimeAssignments(student.department, student.year, (newAssignment: Assignment) => {
    setAssignments(prev => [newAssignment, ...prev.filter(a => a.id !== newAssignment.id)]);
  });

  useEffect(() => {
    loadAssignments();
    loadMySubmissions();
  }, [student.id]);

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAssignment) return;
    
    try {
      let attachmentUrl: string | undefined = undefined;
      
      if (submitFormData.attachment) {
        const { data: uploadData, error: uploadError } = await uploadAssignmentFile(
          student.id, 
          submitFormData.attachment
        );
        if (uploadError) throw uploadError;
        attachmentUrl = uploadData.path;
      }

      const submission: AssignmentSubmission = {
        assignment_id: selectedAssignment.id!,
        student_id: student.id,
        student_name: student.name,
        student_email: student.email,
        submission_text: submitFormData.submission_text,
        attachment_url: attachmentUrl
      };

      const { error } = await submitAssignment(submission);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment submitted successfully!"
      });

      setSubmitFormData({
        submission_text: "",
        attachment: null
      });
      setShowSubmitForm(false);
      setSelectedAssignment(null);
      loadMySubmissions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit assignment",
        variant: "destructive"
      });
    }
  };

  const getSubmissionForAssignment = (assignmentId: string) => {
    return mySubmissions.find(s => s.assignment_id === assignmentId);
  };

  if (loading) {
    return <div className="p-6">Loading assignments...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Assignments</h1>
        <p className="text-sm text-gray-600">
          {student.department} - {student.year} Year
        </p>
      </div>

      {assignments.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">No Assignments Available</h3>
                <p className="text-gray-500 mt-1">
                  There are no assignments published for your year ({student.year}) at this time.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Check back later or contact your faculty for more information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {assignments.map((assignment) => {
            const mySubmission = getSubmissionForAssignment(assignment.id!);
            const isOverdue = new Date() > new Date(assignment.due_date);
            
            return (
                <Card key={assignment.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{assignment.title}</CardTitle>
                        <p className="text-gray-600 mt-2">{assignment.description}</p>
                      </div>
                      <Badge variant={isOverdue ? "destructive" : "default"}>
                        {isOverdue ? "Overdue" : "Active"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Due Date:</strong> {new Date(assignment.due_date).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Subject:</strong> {assignment.subject || 'N/A'}
                        </div>
                        <div>
                          <strong>Max Marks:</strong> {assignment.max_marks || 'N/A'}
                        </div>
                        <div>
                          <strong>Department:</strong> {assignment.department}
                        </div>
                      </div>
                    </div>

                    {assignment.attachment_url && (
                      <div className="mt-4">
                      <a 
                        href={assignment.attachment_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        📎 View Assignment Attachment
                      </a>
                      </div>
                    )}

                  {mySubmission ? (
                    <div className="border p-4 rounded bg-gray-50">
                      <h4 className="font-semibold mb-2">Your Submission</h4>
                      <p className="mb-2">{mySubmission.submission_text}</p>
                      {mySubmission.attachment_url && (
                        <a 
                          href={mySubmission.attachment_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          📎 View Your Submission
                        </a>
                      )}
                      {mySubmission.grade && (
                        <div className="mt-2">
                          <p className="font-semibold">Grade: {mySubmission.grade}/100</p>
                          {mySubmission.feedback && (
                            <p className="text-sm text-gray-600">
                              <strong>Feedback:</strong> {mySubmission.feedback}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button 
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowSubmitForm(true);
                      }}
                      disabled={isOverdue}
                    >
                      {isOverdue ? "Assignment Overdue" : "Submit Assignment"}
                    </Button>
                  )}
                  </CardContent>
                </Card>
            );
          })}
        </div>
      )}

      {showSubmitForm && selectedAssignment && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Assignment: {selectedAssignment.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <Textarea
                placeholder="Your submission text..."
                value={submitFormData.submission_text}
                onChange={(e) => setSubmitFormData({...submitFormData, submission_text: e.target.value})}
                required
              />
              <Input
                type="file"
                onChange={(e) => setSubmitFormData({...submitFormData, attachment: e.target.files?.[0] || null})}
                accept=".pdf,.doc,.docx,.txt"
              />
              <div className="flex gap-2">
                <Button type="submit">Submit Assignment</Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowSubmitForm(false);
                    setSelectedAssignment(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
