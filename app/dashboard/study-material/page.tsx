"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, RefreshCw, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StudyMaterialUpload from './_components/StudyMaterialUpload';
import StudyMaterialList from './_components/StudyMaterialList';
import { getStudyMaterials, type StudyMaterialEntry } from './actions';

export default function StudyMaterialPage() {
  const [materials, setMaterials] = useState<StudyMaterialEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('manage');

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
    setActiveTab('manage');
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
        className="flex items-center justify-between"
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
        
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Materials</p>
                <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Subjects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(materials.map(m => m.subject)).size}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(materials.map(m => m.department)).size}
                </p>
              </div>
              <Plus className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Years Covered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(materials.map(m => m.year)).size}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Upload New
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Manage ({materials.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <StudyMaterialUpload onUploadSuccess={handleUploadSuccess} />
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
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
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
