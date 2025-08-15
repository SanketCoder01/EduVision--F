'use client';

import { useState, useEffect } from 'react';
import { getStudentSeatAssignments } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Info, Calendar, Armchair } from 'lucide-react';

interface SeatAssignment {
  seat_number: string;
  events: {
    id: string;
    title: string;
    date: string;
    venue: string;
  };
}

export default function StudentSeatingPage() {
  const [assignments, setAssignments] = useState<SeatAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      const result = await getStudentSeatAssignments();
      if (result.error) {
        setError(result.error);
      } else if (result.assignments) {
        setAssignments(result.assignments);
      }
      setLoading(false);
    };

    fetchAssignments();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">My Event Seat Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : assignments.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No Seat Assignments</AlertTitle>
              <AlertDescription>You have not been assigned a seat for any upcoming events.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Card key={assignment.events.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{assignment.events.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(assignment.events.date).toLocaleDateString()} at {assignment.events.venue}</span>
                    </div>
                  </div>
                  <div className="flex items-center bg-primary text-primary-foreground rounded-lg px-4 py-2">
                    <Armchair className="h-5 w-5 mr-2" />
                    <span className="font-bold text-lg">{assignment.seat_number}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
