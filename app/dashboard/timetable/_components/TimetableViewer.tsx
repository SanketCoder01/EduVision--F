"use client"

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Maximize2, Calendar, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type TimetableEntry } from '../actions';

interface TimetableViewerProps {
  timetable: TimetableEntry;
  isOpen: boolean;
  onClose: () => void;
}

export default function TimetableViewer({ timetable, isOpen, onClose }: TimetableViewerProps) {
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
    const fileType = timetable.file_type.toLowerCase();
    
    if (fileType.includes('pdf')) {
      return (
        <div className="w-full h-[600px] border rounded-lg overflow-hidden">
          <iframe
            src={`${timetable.file_url}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full"
            title="Timetable PDF"
          />
        </div>
      );
    }
    
    if (fileType.includes('image')) {
      return (
        <div className="flex justify-center">
          <img
            src={timetable.file_url}
            alt="Timetable"
            className="max-w-full h-auto rounded-lg shadow-lg"
            style={{ maxHeight: '600px' }}
          />
        </div>
      );
    }
    
    // For Excel/other files, show download option
    return (
      <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <Calendar className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {timetable.file_name}
        </h3>
        <p className="text-gray-500 text-center mb-6">
          This file type cannot be previewed. Click download to view the timetable.
        </p>
        <Button
          onClick={() => {
            const link = document.createElement('a');
            link.href = timetable.file_url;
            link.download = timetable.file_name;
            link.click();
          }}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Timetable
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'max-w-[95vw] h-[95vh]' : 'max-w-4xl max-h-[90vh]'} overflow-hidden`}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex-1">
            <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
              Timetable Preview
            </DialogTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {timetable.department}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {timetable.year}{timetable.year === '1' ? 'st' : timetable.year === '2' ? 'nd' : timetable.year === '3' ? 'rd' : 'th'} Year
              </Badge>
              <Badge className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(timetable.uploaded_at)}
              </Badge>
            </div>
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
                link.href = timetable.file_url;
                link.download = timetable.file_name;
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
