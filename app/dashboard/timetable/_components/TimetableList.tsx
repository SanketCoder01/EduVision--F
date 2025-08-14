"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Trash2, Eye, Calendar, Users } from 'lucide-react';
import { deleteTimetable, type TimetableEntry } from '../actions';
import TimetableViewer from './TimetableViewer';

interface TimetableListProps {
  timetables: TimetableEntry[];
  onDelete: () => void;
}

export default function TimetableList({ timetables, onDelete }: TimetableListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewingTimetable, setViewingTimetable] = useState<TimetableEntry | null>(null);

  const handleDelete = async (id: string) => {
    setError('');
    setDeletingId(id);

    const result = await deleteTimetable(id);

    if (result.error) {
      setError(result.error.message);
    } else {
      onDelete();
      // Group timetables by department and year
      const groupedTimetables = timetables.reduce((acc, timetable) => {
        const key = `${timetable.department}-${timetable.year}`;
        if (!acc[key]) {
          acc[key] = {
            department: timetable.department,
            year: timetable.year,
            timetables: []
          };
        }
        acc[key].timetables.push(timetable);
        return acc;
      }, {} as Record<string, any>);
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
    return 'bg-gray-100 text-gray-800';
  };

  if (timetables.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Timetables Yet</h3>
            <p className="text-gray-500 text-center">
              Upload your first timetable to get started. Students will be able to view and receive notifications.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Group timetables by department and year
  const groupedTimetables = timetables.reduce((acc, timetable) => {
    const key = `${timetable.department}-${timetable.year}`;
    if (!acc[key]) {
      acc[key] = {
        department: timetable.department,
        year: timetable.year,
        timetables: []
      };
    }
    acc[key].timetables.push(timetable);
    return acc;
  }, {} as Record<string, any>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-4"
    >
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {Object.entries(groupedTimetables).map(([key, group], groupIndex) => (
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
                    <Calendar className="h-5 w-5 text-blue-600" />
                    {group.department}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      Year {group.year}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {group.timetables.length} file{group.timetables.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.timetables.map((timetable: TimetableEntry, index: number) => (
                  <motion.div
                    key={timetable.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                    onClick={() => setViewingTimetable(timetable)}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-white rounded-lg border">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {timetable.file_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`${getFileTypeColor(timetable.file_type)} text-xs`}>
                            {timetable.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(timetable.uploaded_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingTimetable(timetable)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
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
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(timetable.id)}
                        disabled={deletingId === timetable.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deletingId === timetable.id ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Timetable Viewer Modal */}
      {viewingTimetable && (
        <TimetableViewer
          timetable={viewingTimetable}
          isOpen={!!viewingTimetable}
          onClose={() => setViewingTimetable(null)}
        />
      )}
    </motion.div>
  );
}
