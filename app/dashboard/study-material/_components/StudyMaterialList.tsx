"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Trash2, BookOpen, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { deleteStudyMaterial, type StudyMaterialEntry } from '../actions';
import StudyMaterialViewer from './StudyMaterialViewer';

interface StudyMaterialListProps {
  materials: StudyMaterialEntry[];
  onDelete: () => void;
}

export default function StudyMaterialList({ materials, onDelete }: StudyMaterialListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [viewingMaterial, setViewingMaterial] = useState<StudyMaterialEntry | null>(null);

  const handleDelete = async (id: string) => {
    setError('');
    setDeletingId(id);

    const result = await deleteStudyMaterial(id);

    if (result.error) {
      setError(result.error.message);
    } else {
      onDelete();
    }

    setDeletingId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  if (materials.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Study Materials Yet</h3>
            <p className="text-gray-500 text-center">
              Upload your first study material to help students learn better.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Group materials by subject for better organization
  const groupedMaterials = materials.reduce((acc, material) => {
    const key = `${material.department}-${material.year}-${material.subject}`;
    if (!acc[key]) {
      acc[key] = {
        department: material.department,
        year: material.year,
        subject: material.subject,
        materials: []
      };
    }
    acc[key].materials.push(material);
    return acc;
  }, {} as Record<string, any>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {Object.entries(groupedMaterials).map(([key, group], groupIndex) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  {group.subject}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {group.department}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Year {group.year}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.materials.map((material: StudyMaterialEntry, index: number) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0 w-full sm:w-auto">
                    <div className="p-2 bg-white rounded-lg border flex-shrink-0">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                        {material.title}
                      </h4>
                      {material.description && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                          {material.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge className={`${getFileTypeColor(material.file_type)} text-xs`}>
                          {material.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(material.uploaded_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center gap-2 w-full sm:w-auto sm:min-w-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingMaterial(material)}
                      className="w-full sm:w-auto text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
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
                      className="w-full sm:w-auto text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(material.id)}
                      disabled={deletingId === material.id}
                      className="w-full sm:w-auto text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === material.id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </motion.div>
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Study Material Viewer Modal */}
      {viewingMaterial && (
        <StudyMaterialViewer
          material={viewingMaterial}
          isOpen={!!viewingMaterial}
          onClose={() => setViewingMaterial(null)}
        />
      )}
    </motion.div>
  );
}
