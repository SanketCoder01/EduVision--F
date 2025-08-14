"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Maximize2, BookOpen, Users, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type StudyMaterialEntry } from '../actions';

interface StudyMaterialViewerProps {
  material: StudyMaterialEntry;
  isOpen: boolean;
  onClose: () => void;
}

export default function StudyMaterialViewer({ material, isOpen, onClose }: StudyMaterialViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderFileContent = () => {
    const fileType = material.file_type.toLowerCase();
    
    if (fileType.includes('pdf')) {
      return (
        <div className="w-full h-[600px] border rounded-lg overflow-hidden">
          <iframe
            src={`${material.file_url}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full"
            title="Study Material PDF"
          />
        </div>
      );
    }
    
    if (fileType.includes('image')) {
      return (
        <div className="flex justify-center">
          <img
            src={material.file_url}
            alt="Study Material"
            className="max-w-full h-auto rounded-lg shadow-lg"
            style={{ maxHeight: '600px' }}
          />
        </div>
      );
    }
    
    // For Office files, show download option with preview attempt
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
      return (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50">
            <FileText className="h-16 w-16 text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              PowerPoint Presentation
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {material.file_name}
            </p>
            <Button
              onClick={() => {
                const link = document.createElement('a');
                link.href = material.file_url;
                link.download = material.file_name;
                link.click();
              }}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download to View
            </Button>
          </div>
        </div>
      );
    }
    
    if (fileType.includes('sheet') || fileType.includes('excel')) {
      return (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-green-300 rounded-lg bg-green-50">
            <FileText className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Excel Spreadsheet
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {material.file_name}
            </p>
            <Button
              onClick={() => {
                const link = document.createElement('a');
                link.href = material.file_url;
                link.download = material.file_name;
                link.click();
              }}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download to View
            </Button>
          </div>
        </div>
      );
    }
    
    // For Word documents and other files
    return (
      <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <FileText className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {material.file_name}
        </h3>
        <p className="text-gray-500 text-center mb-6">
          This file type cannot be previewed. Click download to view the content.
        </p>
        <Button
          onClick={() => {
            const link = document.createElement('a');
            link.href = material.file_url;
            link.download = material.file_name;
            link.click();
          }}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download File
        </Button>
      </div>
    );
  };

  const getFileTypeColor = (fileType: string) => {
    if (fileType.includes('pdf')) return 'bg-red-100 text-red-800';
    if (fileType.includes('image')) return 'bg-green-100 text-green-800';
    if (fileType.includes('sheet') || fileType.includes('excel')) return 'bg-blue-100 text-blue-800';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'bg-orange-100 text-orange-800';
    if (fileType.includes('document') || fileType.includes('word')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'max-w-[95vw] h-[95vh]' : 'max-w-5xl max-h-[90vh]'} overflow-hidden`}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex-1">
            <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
              {material.title}
            </DialogTitle>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {material.department}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {material.year}{material.year === '1' ? 'st' : material.year === '2' ? 'nd' : material.year === '3' ? 'rd' : 'th'} Year
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {material.subject}
              </Badge>
              <Badge className={getFileTypeColor(material.file_type)}>
                {material.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
              </Badge>
            </div>
            {material.description && (
              <p className="text-sm text-gray-600">{material.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Uploaded on {formatDate(material.uploaded_at)}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="h-4 w-4" />
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
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {renderFileContent()}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
