"use client";

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FileText, Clock, CheckCircle, Search, Filter, X, Upload, Download, Paperclip, AlertTriangle, Eye } from 'lucide-react';
import PlagiarismReport from '@/components/PlagiarismReport';
import EnhancedPlagiarismReport from '@/components/EnhancedPlagiarismReport';
import AISuggestions from '@/components/ai/AISuggestions';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Assignment {
  id: number;
  title: string;
  subject: string;
  status: 'Pending' | 'Submitted' | 'Graded';
  due_date: string;
  score?: string | number;
  faculty_name: string;
  question: string;
  instructions: string;
  rules: string;
  allowed_file_types?: string[];
  report_url?: string;
  plagiarism_score?: number;
  plagiarism_status?: string;
  grade?: number;
  feedback?: string;
  auto_grade?: number;
}


const statusConfig: { [key: string]: { icon: React.ElementType; color: string; bg: string } } = {
  Pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  Submitted: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
  Graded: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
};

const AssignmentsPage = () => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submittedFile, setSubmittedFile] = useState<File | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlagiarismReport, setShowPlagiarismReport] = useState<any>(null);
  const [showEnhancedPlagiarism, setShowEnhancedPlagiarism] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/assignments/get');
        const result = await response.json();
        if (result.success) {
          setAssignments(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch assignments');
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    // Mock user data since authentication is disabled
    const mockUser = {
      id: 'demo-student',
      email: 'demo@student.edu',
      name: 'Demo Student'
    };
    setCurrentUser(mockUser);

    fetchAssignments();
  }, []);

  const filteredAssignments = assignments.filter(a => a.status === activeTab);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSubmittedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
      onDrop,
      accept: selectedAssignment && selectedAssignment.allowed_file_types ? selectedAssignment.allowed_file_types.reduce((acc: {[key: string]: string[]}, type: string) => ({ ...acc, [type]: [] }), {}) : {},
      maxFiles: 1
  });

  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
      <ul>
        {errors.map(e => (
          <li key={e.code} className="text-red-500">{e.message}</li>
        ))}
      </ul>
    </li>
  ));

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-gray-800 tracking-tight"
        >
          Assignments
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-gray-500 mt-1"
        >
          Stay on top of your coursework.
        </motion.p>
      </header>

      {loading && <div className="text-center p-10">Loading assignments...</div>}
      {error && <div className="text-center p-10 text-red-500">Error: {error}</div>}
      {!loading && !error && (
        <>
          <div className="mb-6">
            <div className="flex flex-wrap border-b border-gray-200">
              {['Pending', 'Submitted', 'Graded'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${activeTab === tab ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'} relative py-4 px-6 text-sm font-medium focus:outline-none`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                      layoutId="underline"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredAssignments.map((assignment, index) => {
                const StatusIcon = statusConfig[assignment.status]?.icon || Clock;
                return (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col"
                  >
                    <div className="flex-grow">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[assignment.status]?.bg} ${statusConfig[assignment.status]?.color}`}>
                        <StatusIcon className="w-4 h-4 mr-1.5" />
                        {assignment.status}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">{assignment.title}</h3>
                      <p className="text-sm text-gray-500 mb-4">{assignment.subject}</p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <p>Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
                        {assignment.score && <p className='font-bold text-indigo-600'>Score: {assignment.score}</p>}
                        {assignment.plagiarism_score !== undefined && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle className={`h-3 w-3 ${
                              assignment.plagiarism_score > 20 ? 'text-red-500' :
                              assignment.plagiarism_score > 10 ? 'text-yellow-500' : 'text-green-500'
                            }`} />
                            <span className="text-xs">
                              Plagiarism: {assignment.plagiarism_score}%
                            </span>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => setSelectedAssignment(assignment)}
                        className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </>
      )}

      <AnimatePresence>
        {selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAssignment(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative"
              onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
            >
              <button onClick={() => setSelectedAssignment(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedAssignment.title}</h2>
                  <p className="text-sm text-gray-500">{selectedAssignment.subject} - Assigned by {selectedAssignment.faculty_name}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold text-gray-600">Due Date</p>
                    <p className="text-gray-800">{new Date(selectedAssignment.due_date).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold text-gray-600">Status</p>
                    <p className={`font-bold ${statusConfig[selectedAssignment.status]?.color}`}>{selectedAssignment.status}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Assignment Details</h3>
                  <div className="prose prose-sm max-w-none text-gray-600 bg-gray-50 p-4 rounded-lg">
                    <p><strong>Question:</strong> {selectedAssignment.question}</p>
                    <p><strong>Instructions:</strong> {selectedAssignment.instructions}</p>
                    <p><strong>Rules:</strong> {selectedAssignment.rules}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  {selectedAssignment.status === 'Pending' && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">Submit Your Work</h3>
                      <div {...getRootProps()} className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'bg-indigo-50 border-indigo-600' : 'bg-white'}`}>
                        <input {...getInputProps()} />
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        {isDragActive ? (
                          <p className="mt-2 text-sm text-indigo-600">Drop the files here ...</p>
                        ) : (
                          <p className="mt-2 text-sm text-gray-600">Drag & drop your file here, or click to select.</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">Allowed: {selectedAssignment.allowed_file_types?.join(', ') || 'Any'}</p>
                      </div>
                      {submittedFile && (
                        <div className="mt-4 bg-gray-100 p-3 rounded-lg flex items-center justify-between">
                          <div className='flex items-center'>
                            <Paperclip className='w-5 h-5 text-gray-500 mr-2'/>
                            <p className='text-sm text-gray-700'>{submittedFile.name}</p>
                          </div>
                          <button onClick={() => setSubmittedFile(null)} className='text-gray-500 hover:text-gray-700'>
                            <X className='w-4 h-4'/>
                          </button>
                        </div>
                      )}
                      {fileRejectionItems.length > 0 && (
                        <div className="mt-2 text-sm text-red-600">
                          <p>File rejected. Please check the allowed file types.</p>
                          <ul>{fileRejectionItems}</ul>
                        </div>
                      )}
                      <div className="mt-4 space-y-3">
                        <button 
                          onClick={() => setShowEnhancedPlagiarism(true)}
                          disabled={!submittedFile}
                          className="w-full bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          <AlertTriangle className="inline h-4 w-4 mr-2" />
                          Check Plagiarism Before Submit
                        </button>
                        <button 
                          disabled={!submittedFile}
                          className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Submit Assignment
                        </button>
                      </div>
                    </div>
                  )}
                  {selectedAssignment.status === 'Submitted' && (
                    <div className="text-center bg-blue-50 p-4 rounded-lg">
                      <CheckCircle className="mx-auto h-10 w-10 text-blue-500"/>
                      <p className="mt-2 font-semibold text-blue-700">You have submitted this assignment.</p>
                      <p className="text-sm text-blue-600">Awaiting grading from your faculty.</p>
                    </div>
                  )}
                  {selectedAssignment.status === 'Graded' && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">Your Grade</h3>
                      <div className="bg-green-50 p-4 rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-700">Final Score</p>
                            <p className="text-2xl font-bold text-green-600">{selectedAssignment.score}</p>
                            {selectedAssignment.auto_grade && (
                              <p className="text-xs text-gray-600">Auto Grade: {selectedAssignment.auto_grade}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            {selectedAssignment.plagiarism_score !== undefined && (
                              <button
                                onClick={() => setShowPlagiarismReport({
                                  id: `report_${selectedAssignment.id}`,
                                  appName: 'EduVision',
                                  assignment: {
                                    name: selectedAssignment.title,
                                    dateGiven: new Date().toISOString(),
                                    dateSubmitted: new Date().toISOString(),
                                    dueDate: selectedAssignment.due_date,
                                    maxMarks: 100
                                  },
                                  student: {
                                    name: 'Student',
                                    email: 'student@example.com',
                                    department: 'CSE',
                                    year: '3rd'
                                  },
                                  plagiarism: {
                                    percentage: selectedAssignment.plagiarism_score ?? 0,
                                    status: (selectedAssignment.plagiarism_score ?? 0) > 20 ? 'High Risk' :
                                            (selectedAssignment.plagiarism_score ?? 0) > 10 ? 'Medium Risk' : 'Low Risk',
                                    checkedAt: new Date().toISOString(),
                                    sources: []
                                  },
                                  grading: {
                                    grade: selectedAssignment.grade,
                                    feedback: selectedAssignment.feedback,
                                    gradedAt: new Date().toISOString(),
                                    autoGrade: selectedAssignment.auto_grade
                                  },
                                  generatedAt: new Date().toISOString()
                                })}
                                className="flex items-center bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Report
                              </button>
                            )}
                            {selectedAssignment.report_url && (
                              <a href={selectedAssignment.report_url} download className="flex items-center bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </a>
                            )}
                          </div>
                        </div>
                        
                        {selectedAssignment.plagiarism_score !== undefined && (
                          <div className="border-t border-green-200 pt-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-green-700">Plagiarism Check:</span>
                              <div className="flex items-center gap-2">
                                <AlertTriangle className={`h-4 w-4 ${
                                  selectedAssignment.plagiarism_score > 20 ? 'text-red-500' :
                                  selectedAssignment.plagiarism_score > 10 ? 'text-yellow-500' : 'text-green-500'
                                }`} />
                                <span className={`text-sm font-medium ${
                                  selectedAssignment.plagiarism_score > 20 ? 'text-red-600' :
                                  selectedAssignment.plagiarism_score > 10 ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                  {selectedAssignment.plagiarism_score}% similarity
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {selectedAssignment.feedback && (
                          <div className="border-t border-green-200 pt-3">
                            <p className="text-sm text-green-700 font-medium">Feedback:</p>
                            <p className="text-sm text-gray-700 mt-1">{selectedAssignment.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* AI Suggestions Section */}
                  {selectedAssignment && selectedAssignment.grade !== null && (
                    <div className="mt-6">
                      <AISuggestions
                        studentName={currentUser?.user_metadata?.full_name || 'Student'}
                        assignmentTitle={selectedAssignment.title}
                        subject={selectedAssignment.subject}
                        grade={selectedAssignment.grade ?? 0}
                        feedback={selectedAssignment.feedback || ''}
                        weakAreas={(selectedAssignment.grade ?? 0) < 70 ? ['Time Management', 'Concept Understanding'] : []}
                        strongAreas={(selectedAssignment.grade ?? 0) >= 80 ? ['Problem Solving', 'Implementation'] : (selectedAssignment.grade ?? 0) >= 70 ? ['Basic Understanding'] : []}
                        submissionId={selectedAssignment.id.toString()}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {showPlagiarismReport && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Plagiarism Report</h2>
              <button onClick={() => setShowPlagiarismReport(null)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PlagiarismReport
                report={showPlagiarismReport}
                onDownload={() => {}}
              />
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Plagiarism Check Modal */}
      {showEnhancedPlagiarism && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Enhanced Plagiarism Check</h2>
              <button onClick={() => setShowEnhancedPlagiarism(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste your assignment text for plagiarism checking:
                  </label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Paste your assignment content here (minimum 40 characters required)..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Characters: {submissionText.length} (minimum 40 required)
                  </p>
                </div>
                <EnhancedPlagiarismReport
                  text={submissionText}
                  onReportGenerated={(result) => {
                    console.log('Plagiarism check completed:', result);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignmentsPage;
