"use client";

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FileText, Clock, CheckCircle, Search, Filter, X, Upload, Download, Paperclip } from 'lucide-react';

const statusConfig = {
  Pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  Submitted: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
  Graded: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
};

const AssignmentsPage = () => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submittedFile, setSubmittedFile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const filteredAssignments = assignments.filter(a => a.status === activeTab);

  const onDrop = useCallback(acceptedFiles => {
    setSubmittedFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
      onDrop,
      accept: selectedAssignment ? selectedAssignment.allowedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}) : {},
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
            <div className="flex border-b border-gray-200">
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

                <div className="grid grid-cols-2 gap-4 text-sm">
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
                        {isDragActive ?
                          <p className="mt-2 text-sm text-indigo-600">Drop the files here ...</p> :
                          <p className="mt-2 text-sm text-gray-600">Drag & drop your file here, or click to select.</p>
                        }
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
                      <button 
                        disabled={!submittedFile}
                        className="mt-6 w-full bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Submit Assignment
                      </button>
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
                      <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg">
                        <div>
                            <p className="text-sm text-green-700">Final Score</p>
                            <p className="text-2xl font-bold text-green-600">{selectedAssignment.score}</p>
                        </div>
                        <a href={selectedAssignment.report_url} download className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                          <Download className="w-4 h-4 mr-2" />
                          Download Report
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssignmentsPage;
