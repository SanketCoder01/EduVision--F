"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, RefreshCw, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StudyMaterialUpload from './_components/StudyMaterialUpload';
import StudyMaterialList from './_components/StudyMaterialList';
import { getStudyMaterials, type StudyMaterialEntry } from './actions';

export default function StudyMaterialPage() {
  const [materials, setMaterials] = useState<StudyMaterialEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const fetchMaterials = async () => {
    setIsLoading(true);
    setError('');

    const result = await getStudyMaterials();

    if (result.error) {
      setError(result.error.message);
    } else {
      setMaterials(result.data || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleUploadSuccess = () => {
    fetchMaterials();
    setIsUploadDialogOpen(false);
  };

  const handleRefresh = () => {
    fetchMaterials();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Study Material Management
          </h1>
          <p className="mt-2 text-gray-600">
            Upload and manage study materials for students by department, year, and subject.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Upload Material
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload New Study Material</DialogTitle>
              </DialogHeader>
              <StudyMaterialUpload onUploadSuccess={handleUploadSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}



      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mx-auto mb-4"
                >
                  <RefreshCw className="h-8 w-8 text-blue-600" />
                </motion.div>
                <p className="text-gray-600">Loading study materials...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <StudyMaterialList materials={materials} onDelete={fetchMaterials} />
        )}
      </motion.div>
    </div>
  );
}
