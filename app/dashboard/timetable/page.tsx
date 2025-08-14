"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TimetableUpload from './_components/TimetableUpload';
import TimetableList from './_components/TimetableList';
import { getTimetables, type TimetableEntry } from './actions';

export default function TimetablePage() {
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const fetchTimetables = async () => {
    setIsLoading(true);
    setError('');

    const result = await getTimetables();

    if (result.error) {
      setError(result.error.message);
    } else {
      setTimetables(result.data || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchTimetables();
  }, []);

  const handleUploadSuccess = () => {
    fetchTimetables();
    setIsUploadDialogOpen(false);
  };

  const handleRefresh = () => {
    fetchTimetables();
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
            <Calendar className="h-8 w-8 text-blue-600" />
            Timetable Management
          </h1>
          <p className="mt-2 text-gray-600">
            Upload and manage timetables for students by department and year.
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
                Upload Timetable
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Upload New Timetable</DialogTitle>
              </DialogHeader>
              <TimetableUpload onUploadSuccess={handleUploadSuccess} />
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
                <p className="text-gray-600">Loading timetables...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <TimetableList timetables={timetables} onDelete={fetchTimetables} />
        )}
      </motion.div>
    </div>
  );
}
