"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Download, Eye, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// This would come from a server action similar to timetables
interface StudyMaterial {
  id: string;
  subject: string;
  title: string;
  description?: string;
  file_url: string;
  file_name: string;
  file_type: string;
  uploaded_at: string;
}

export default function StudentStudyMaterialPage() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Sample data - replace with actual server action call
  const sampleMaterials: StudyMaterial[] = [
    {
      id: '1',
      subject: 'Data Structures',
      title: 'Chapter 1 - Introduction to Arrays',
      description: 'Basic concepts of arrays and their operations',
      file_url: '#',
      file_name: 'arrays-intro.pdf',
      file_type: 'application/pdf',
      uploaded_at: new Date().toISOString(),
    },
    {
      id: '2',
      subject: 'Mathematics',
      title: 'Linear Algebra Notes',
      description: 'Comprehensive notes on matrices and vectors',
      file_url: '#',
      file_name: 'linear-algebra.pdf',
      file_type: 'application/pdf',
      uploaded_at: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    // Simulate loading - replace with actual API call
    setTimeout(() => {
      setMaterials(sampleMaterials);
      setFilteredMaterials(sampleMaterials);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = materials;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by subject
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(material => material.subject === selectedSubject);
    }

    setFilteredMaterials(filtered);
  }, [materials, searchTerm, selectedSubject]);

  const subjects = Array.from(new Set(materials.map(m => m.subject)));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFileTypeColor = (fileType: string) => {
    if (fileType.includes('pdf')) return 'bg-red-100 text-red-800';
    if (fileType.includes('image')) return 'bg-green-100 text-green-800';
    if (fileType.includes('sheet') || fileType.includes('excel')) return 'bg-blue-100 text-blue-800';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'bg-orange-100 text-orange-800';
    if (fileType.includes('document') || fileType.includes('word')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-4"
          >
            <BookOpen className="h-8 w-8 text-blue-600" />
          </motion.div>
          <p className="text-gray-600">Loading study materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          Study Materials
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Access study materials uploaded by your faculty
        </p>
      </motion.div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Materials List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {filteredMaterials.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {materials.length === 0 ? 'No Study Materials Available' : 'No Materials Found'}
              </h3>
              <p className="text-gray-500 text-center text-sm">
                {materials.length === 0 
                  ? 'Your faculty hasn\'t uploaded any study materials yet.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredMaterials.map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {material.title}
                          </h3>
                          
                          {material.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {material.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {material.subject}
                            </Badge>
                            <Badge className={`${getFileTypeColor(material.file_type)} text-xs`}>
                              {material.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDate(material.uploaded_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(material.file_url, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = material.file_url;
                            link.download = material.file_name;
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
