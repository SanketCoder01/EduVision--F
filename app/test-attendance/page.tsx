'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function TestAttendancePage() {
  const [loading, setLoading] = useState(false);

  const initializeAttendanceTables = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/attendance/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Attendance tables initialized successfully');
      } else {
        toast.error(data.error || 'Failed to initialize attendance tables');
      }
    } catch (error) {
      toast.error('Error initializing attendance system');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance System Test</h1>
        <p className="text-gray-600 mt-2">Test the attendance system functionality</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Setup</CardTitle>
            <CardDescription>
              Initialize attendance tables in the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={initializeAttendanceTables}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Initializing...' : 'Initialize Attendance Tables'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Navigation Links</CardTitle>
            <CardDescription>
              Test the attendance pages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => window.open('/dashboard/attendance', '_blank')}
              variant="outline"
              className="w-full"
            >
              Faculty Attendance Dashboard
            </Button>
            <Button 
              onClick={() => window.open('/student-dashboard/attendance', '_blank')}
              variant="outline"
              className="w-full"
            >
              Student Attendance Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance System Features</CardTitle>
          <CardDescription>
            Overview of implemented features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Face Recognition</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time face detection</li>
                <li>• Face encoding generation</li>
                <li>• Confidence scoring</li>
                <li>• Anti-spoofing measures</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Geo-fencing</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• GPS location verification</li>
                <li>• Configurable radius</li>
                <li>• Distance calculation</li>
                <li>• Campus boundary enforcement</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Liveness Detection</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Eye movement detection</li>
                <li>• Blink detection</li>
                <li>• Video spoofing prevention</li>
                <li>• Real-time analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 