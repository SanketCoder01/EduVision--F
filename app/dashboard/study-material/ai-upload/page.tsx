'use client';

import { useState } from 'react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Textarea } from '@/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Upload, FileText, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AIStudyMaterialUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedMaterial, setUploadedMaterial] = useState<any>(null);
  const [formData, setFormData] = useState({
    department: '',
    year: '',
    subject: '',
    title: '',
    description: '',
    file: null as File | null
  });

  const departments = ['CSE', 'AIDS', 'AIML', 'IT', 'ECE', 'MECH', 'CIVIL'];
  const years = ['1st', '2nd', '3rd', '4th'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file || !formData.department || !formData.year || !formData.subject || !formData.title) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.file);
      uploadFormData.append('department', formData.department);
      uploadFormData.append('year', formData.year);
      uploadFormData.append('subject', formData.subject);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);

      const response = await fetch('/api/study-material/gemini-upload', {
        method: 'POST',
        body: uploadFormData
      });

      const result = await response.json();

      if (result.success) {
        setUploadedMaterial(result.data);
        toast({
          title: "Upload Successful!",
          description: "Study material uploaded with AI enhancement",
        });
        
        // Reset form
        setFormData({
          department: '',
          year: '',
          subject: '',
          title: '',
          description: '',
          file: null
        });
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
          <span>AI-Enhanced Study Material Upload</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Upload study materials with AI-powered metadata generation and enhancement
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Material
            </CardTitle>
            <CardDescription>
              Fill in the details and upload your study material
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department" className="text-sm font-medium">Department *</Label>
                  <Select value={formData.department} onValueChange={(value: string) => setFormData(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="year" className="text-sm font-medium">Year *</Label>
                  <Select value={formData.year} onValueChange={(value: string) => setFormData(prev => ({ ...prev, year: value }))}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year} Year</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject" className="text-sm font-medium">Subject *</Label>
                <Input
                  id="subject"
                  className="h-10"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g., Data Structures, Machine Learning"
                />
              </div>

              <div>
                <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                <Input
                  id="title"
                  className="h-10"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Binary Trees and Algorithms"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  className="min-h-[80px] resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the material (AI will enhance this)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="file" className="text-sm font-medium">File *</Label>
                <Input
                  id="file"
                  type="file"
                  className="h-10 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Supported: PDF, Word, PowerPoint, Excel, Images (max 25MB)
                </p>
              </div>

              <Button type="submit" disabled={isUploading} className="w-full h-11 text-sm font-medium">
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Upload with AI Enhancement
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* AI Enhancement Preview */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Enhancement Preview
            </CardTitle>
            <CardDescription className="text-sm">
              See how AI enhances your study material
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {uploadedMaterial ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 mb-4">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-medium text-sm sm:text-base">Successfully Enhanced!</span>
                </div>

                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-gray-600 mb-2">Enhanced Description</h4>
                  <p className="text-xs sm:text-sm bg-purple-50 p-3 rounded-lg leading-relaxed">{uploadedMaterial.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-gray-600 mb-2">Key Topics</h4>
                  <p className="text-xs sm:text-sm bg-blue-50 p-3 rounded-lg">{uploadedMaterial.key_topics}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-gray-600 mb-2">Learning Objectives</h4>
                  <ul className="text-xs sm:text-sm bg-green-50 p-3 rounded-lg space-y-2">
                    {uploadedMaterial.learning_objectives?.map((obj: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5 text-sm">•</span>
                        <span className="flex-1">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-gray-600 mb-2">Difficulty Level</h4>
                  <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                    uploadedMaterial.difficulty_level === 'Beginner' ? 'bg-green-100 text-green-800' :
                    uploadedMaterial.difficulty_level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {uploadedMaterial.difficulty_level}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm">Upload a file to see AI enhancement preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
