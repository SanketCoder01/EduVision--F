"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, BookOpen, Users, X, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { uploadStudyMaterial } from '../actions';

interface StudyMaterialUploadProps {
  onUploadSuccess: () => void;
}

export default function StudyMaterialUpload({ onUploadSuccess }: StudyMaterialUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    department: '',
    year: '',
    subject: '',
    title: '',
    description: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [aiSummarizerEnabled, setAiSummarizerEnabled] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [summaryGenerated, setSummaryGenerated] = useState(false);

  const departments = [
    'Computer Science and Engineering (CSE)',
    'Cyber Security',
    'Artificial Intelligence and Data Science (AIDS)',
    'Artificial Intelligence and Machine Learning (AIML)',
    'Electronics and Communication Engineering (ECE)',
    'Electrical and Electronics Engineering (EEE)',
    'Mechanical Engineering (ME)',
    'Civil Engineering (CE)',
    'Information Technology (IT)',
    'Biotechnology (BT)',
    'Chemical Engineering (CHE)',
    'Aerospace Engineering (AE)',
    'Automobile Engineering (AUTO)',
    'Industrial Engineering (IE)',
    'Environmental Engineering (ENV)',
    'Biomedical Engineering (BME)',
    'Materials Science and Engineering (MSE)',
    'Petroleum Engineering (PE)',
    'Mining Engineering (MIN)',
    'Agricultural Engineering (AGE)',
  ];

  const years = ['1', '2', '3', '4'];

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Data Structures', 'Algorithms',
    'Database Systems', 'Computer Networks', 'Operating Systems', 'Software Engineering',
    'Machine Learning', 'Artificial Intelligence', 'Cyber Security Fundamentals',
    'Web Development', 'Mobile App Development', 'Cloud Computing'
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateAISummary = async (file: File) => {
    setIsGeneratingSummary(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/ai/summarize-document', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }
      
      const result = await response.json();
      return result.summaryFile;
    } catch (error) {
      console.error('Error generating AI summary:', error);
      throw error;
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedFile || !formData.department || !formData.year || !formData.subject || !formData.title) {
      setError('Please fill all required fields and select a file.');
      return;
    }

    setIsUploading(true);

    try {
      const submitData = new FormData();
      submitData.append('file', selectedFile);
      submitData.append('department', formData.department);
      submitData.append('year', formData.year);
      submitData.append('subject', formData.subject);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);

      // Upload original file
      const result = await uploadStudyMaterial(submitData);

      if (result.error) {
        setError(result.error.message);
        return;
      }

      // Generate and upload AI summary if enabled
      if (aiSummarizerEnabled) {
        try {
          const summaryFile = await generateAISummary(selectedFile);
          
          const summaryData = new FormData();
          summaryData.append('file', summaryFile);
          summaryData.append('department', formData.department);
          summaryData.append('year', formData.year);
          summaryData.append('subject', formData.subject);
          summaryData.append('title', `${formData.title} - AI Summary`);
          summaryData.append('description', `AI-generated summary of: ${formData.description}`);

          await uploadStudyMaterial(summaryData);
          setSummaryGenerated(true);
        } catch (summaryError) {
          console.error('Failed to generate/upload summary:', summaryError);
          // Continue with success message even if summary fails
        }
      }

      setUploadSuccess(true);
      setSelectedFile(null);
      setFormData({
        department: '',
        year: '',
        subject: '',
        title: '',
        description: '',
      });
      onUploadSuccess();
      
    } catch (error) {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full space-y-6">
      <Card className="w-full">
        <CardHeader className="text-center sm:text-left">
          <CardTitle className="flex items-center justify-center sm:justify-start gap-2 text-lg sm:text-xl">
            <Upload className="h-5 w-5 text-blue-600" />
            Upload Study Material
          </CardTitle>
          <CardDescription className="text-center sm:text-left">
            Upload study materials for students by department, year, and subject.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Department and Year Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium">Department *</Label>
                <Select onValueChange={(value) => handleInputChange('department', value)} value={formData.department}>
                  <SelectTrigger id="department" className="w-full">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept} className="text-sm">
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm font-medium">Year *</Label>
                <Select onValueChange={(value) => handleInputChange('year', value)} value={formData.year}>
                  <SelectTrigger id="year" className="w-full">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((yr) => (
                      <SelectItem key={yr} value={yr} className="text-sm">
                        {yr}{yr === '1' ? 'st' : yr === '2' ? 'nd' : yr === '3' ? 'rd' : 'th'} Year
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subject and Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">Subject *</Label>
                <Select onValueChange={(value) => handleInputChange('subject', value)} value={formData.subject}>
                  <SelectTrigger id="subject" className="w-full">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {subjects.map((subj) => (
                      <SelectItem key={subj} value={subj} className="text-sm">
                        {subj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Chapter 1 - Introduction"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the study material..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* AI Summarizer Toggle */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label htmlFor="ai-summarizer" className="text-sm font-medium">
                      AI Summarizer
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Generate AI summary with key points and upload both files
                    </p>
                  </div>
                </div>
                <Switch
                  id="ai-summarizer"
                  checked={aiSummarizerEnabled}
                  onCheckedChange={setAiSummarizerEnabled}
                  className="self-start sm:self-center"
                />
              </div>
              
              {aiSummarizerEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Bot className="h-4 w-4" />
                    <span className="font-medium">AI Summary Features:</span>
                  </div>
                  <ul className="text-xs text-blue-600 mt-2 space-y-1 ml-6">
                    <li>• Extract key concepts and important points</li>
                    <li>• Create structured bullet points</li>
                    <li>• Generate PDF summary document</li>
                    <li>• Upload both original and summary files</li>
                  </ul>
                </motion.div>
              )}
            </div>

            {/* File Upload Area */}
            <div className="space-y-2">
              <Label>Study Material File *</Label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                  dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.doc,.docx,.ppt,.pptx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {selectedFile ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-900">
                        Drop your study material here, or click to browse
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, Images, Office files up to 25MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isUploading || isGeneratingSummary || !selectedFile || !formData.department || !formData.year || !formData.subject || !formData.title}
            >
              {isUploading || isGeneratingSummary ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  {isGeneratingSummary ? <Bot className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                </motion.div>
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {isGeneratingSummary 
                ? 'Generating AI Summary...' 
                : isUploading 
                  ? aiSummarizerEnabled 
                    ? 'Uploading Files...' 
                    : 'Uploading...'
                  : 'Upload Study Material'
              }
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* AI Summarizer Status - Always visible below upload form */}
      {(aiSummarizerEnabled || uploadSuccess) && (
        <Card className="w-full border-blue-200 bg-blue-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bot className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">AI Summarizer</h3>
            </div>

            {uploadSuccess ? (
              <div className="space-y-3">
                {summaryGenerated ? (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 p-3 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>AI summary generated and uploaded successfully!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-100 p-3 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI summary generation in progress...</span>
                  </div>
                )}

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2 font-medium">Files uploaded:</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Original study material</li>
                    {summaryGenerated && <li>• AI-generated summary (PDF)</li>}
                  </ul>
                </div>

                <Button
                  onClick={() => {
                    setUploadSuccess(false);
                    setSummaryGenerated(false);
                    setAiSummarizerEnabled(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Upload Another File
                </Button>
              </div>
            ) : (
              <div className="text-sm text-blue-700">
                <p className="mb-2">AI Summarizer is enabled. When you upload a file, it will:</p>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• Extract key concepts and important points</li>
                  <li>• Create structured bullet points</li>
                  <li>• Generate PDF summary document</li>
                  <li>• Upload both original and summary files</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
