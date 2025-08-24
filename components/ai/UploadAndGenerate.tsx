"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Brain, Download, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface Question {
  id: number;
  type: 'multiple_choice' | 'short_answer' | 'essay' | 'true_false';
  question: string;
  options?: string[];
  correctAnswer?: string;
  expectedLength?: string;
  keyPoints?: string[];
  marks: number;
}

interface GeneratedQuestions {
  questions: Question[];
  totalMarks: number;
  estimatedTime: string;
  metadata?: {
    fileName: string;
    fileType: string;
    subject: string;
    difficulty: string;
    questionCount: number;
    generatedAt: string;
  };
}

function UploadAndGenerate() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [questionType, setQuestionType] = useState('mixed');
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestions | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploadedFile(acceptedFiles[0]);
        setError(null);
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const generateQuestions = async () => {
    if (!uploadedFile || !subject) {
      setError('Please upload a file and enter a subject');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('subject', subject);
      formData.append('difficulty', difficulty);
      formData.append('questionCount', questionCount.toString());
      formData.append('questionType', questionType);

      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedQuestions(result.data);
      } else {
        setError(result.error || 'Failed to generate questions');
      }
    } catch (err) {
      setError('Network error occurred while generating questions');
    } finally {
      setLoading(false);
    }
  };

  const downloadQuestions = () => {
    if (!generatedQuestions) return;

    const dataStr = JSON.stringify(generatedQuestions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `generated-questions-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const createAssignment = () => {
    if (!generatedQuestions) return;
    
    // Here you would integrate with your assignment creation flow
    // For now, we'll just show a success message
    alert('Assignment creation feature will be integrated with the main assignment system');
  };

  const resetForm = () => {
    setUploadedFile(null);
    setSubject('');
    setDifficulty('medium');
    setQuestionCount(5);
    setQuestionType('mixed');
    setGeneratedQuestions(null);
    setError(null);
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'multiple_choice': return 'bg-blue-100 text-blue-800';
      case 'short_answer': return 'bg-green-100 text-green-800';
      case 'essay': return 'bg-purple-100 text-purple-800';
      case 'true_false': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Upload and Generate Questions
          </CardTitle>
          <p className="text-sm text-gray-600">
            Upload study materials and automatically generate questions using AI
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Section */}
          <div>
            <Label className="text-sm font-medium">Upload Study Material</Label>
            <div
              {...getRootProps()}
              className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              {isDragActive ? (
                <p className="text-blue-600">Drop the file here...</p>
              ) : (
                <div>
                  <p className="text-gray-600">Drag & drop a file here, or click to select</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports: Images, Excel, PowerPoint, CSV, PDF, Text files (max 10MB)
                  </p>
                </div>
              )}
            </div>
            
            {uploadedFile && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">{uploadedFile.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadedFile(null)}
                  className="text-green-600 hover:text-green-800"
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          {/* Configuration Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Mathematics, Physics, Computer Science"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="questionCount">Number of Questions</Label>
              <Select value={questionCount.toString()} onValueChange={(value) => setQuestionCount(parseInt(value))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Questions</SelectItem>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                  <SelectItem value="20">20 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="questionType">Question Type</Label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed">Mixed Types</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                  <SelectItem value="essay">Essay Questions</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex gap-3">
            <Button
              onClick={generateQuestions}
              disabled={!uploadedFile || !subject || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Questions
                </>
              )}
            </Button>
            
            {generatedQuestions && (
              <Button variant="outline" onClick={resetForm}>
                Reset
              </Button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Generated Questions Display */}
      {generatedQuestions && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Generated Questions
                </CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">
                    {generatedQuestions.questions.length} Questions
                  </Badge>
                  <Badge variant="outline">
                    {generatedQuestions.totalMarks} Total Marks
                  </Badge>
                  <Badge variant="outline">
                    {generatedQuestions.estimatedTime}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadQuestions}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button size="sm" onClick={createAssignment}>
                  Create Assignment
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {generatedQuestions.questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <div className="flex gap-2">
                      <Badge className={getQuestionTypeColor(question.type)}>
                        {question.type.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">{question.marks} marks</Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-800 mb-3">{question.question}</p>
                  
                  {question.options && (
                    <div className="space-y-1 mb-2">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-2 rounded text-sm ${
                            question.correctAnswer === String.fromCharCode(65 + optIndex)
                              ? 'bg-green-100 border border-green-300'
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.expectedLength && (
                    <p className="text-xs text-gray-600">
                      Expected length: {question.expectedLength}
                    </p>
                  )}
                  
                  {question.keyPoints && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 mb-1">Key points to cover:</p>
                      <ul className="text-xs text-gray-600 list-disc list-inside">
                        {question.keyPoints.map((point, pointIndex) => (
                          <li key={pointIndex}>{point}</li>
                        ))}
                      </ul>
                    </div>
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

export { UploadAndGenerate };
export default UploadAndGenerate;
