"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TimetableUpload from './_components/TimetableUpload';
import TimetableList from './_components/TimetableList';
import { getTimetables, type TimetableEntry } from './actions';

export default function TimetablePage() {
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('manage');

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
    setActiveTab('manage');
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
        className="flex items-center justify-between"
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
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Timetables</p>
                <p className="text-2xl font-bold text-gray-900">{timetables.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(timetables.map(t => t.department)).size}
                </p>
              </div>
              <Plus className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Years Covered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(timetables.map(t => t.year)).size}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
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
              <Calendar className="h-4 w-4" />
              Manage ({timetables.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <TimetableUpload onUploadSuccess={handleUploadSuccess} />
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
                    <p className="text-gray-600">Loading timetables...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <TimetableList timetables={timetables} onDelete={fetchTimetables} />
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
