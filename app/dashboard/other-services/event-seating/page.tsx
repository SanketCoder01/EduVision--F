'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFacultyEvents, getSeatingChartData, assignSeat } from './actions';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Info } from 'lucide-react';
import SeatingGrid from '@/components/events/SeatingGrid';

interface Event {
  id: string;
  title: string;
  venue: string;
}

interface Student {
  id: string;
  name: string;
  department: string;
  year: string;
  gender: string;
}

interface SeatAssignment {
  id: string;
  student_id: string;
  seat_number: string;
}

export default function EventSeatingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seatingData, setSeatingData] = useState<{ students: Student[], assignments: SeatAssignment[], venue: string } | null>(null);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const result = await getFacultyEvents();
      if (result.error) {
        setError(result.error);
      } else if (result.events) {
        setEvents(result.events);
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  const handleEventSelect = (eventId: string) => {
    setSelectedEvent(eventId);
    setSeatingData(null); // Reset seating data when event changes
  };

  const handleLoadChart = useCallback(async () => {
    if (!selectedEvent) return;

    setIsLoadingChart(true);
    setError(null);

    const result = await getSeatingChartData(selectedEvent);

    if (result.error) {
      setError(result.error);
    } else {
      setSeatingData(result as any);
    }
    setIsLoadingChart(false);
  }, [selectedEvent]); // Added selectedEvent dependency

  // Real-time subscription for seating changes
  useEffect(() => {
    if (!selectedEvent) {
      return;
    }

    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`realtime-seating:${selectedEvent}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_seat_assignments',
          filter: `event_id=eq.${selectedEvent}`,
        },
        () => {
          // Refetch data on change
          handleLoadChart();
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount or event change
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedEvent, handleLoadChart]);

  const handleAssignSeat = async (seatNumber: string) => {
    if (!selectedStudentId || !selectedEvent) return;

    const result = await assignSeat(selectedEvent, selectedStudentId, seatNumber);

    if (result.error) {
      alert(`Error: ${result.error}`); // Replace with a toast notification later
    } else {
      // Refresh seating data to show the new assignment
      handleLoadChart();
      setSelectedStudentId(null); // Deselect student after assignment
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Event Seat Assignment</CardTitle>
          <CardDescription>Select an event to manage the seating arrangement for registered students.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading your events...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : events.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No Events Found</AlertTitle>
              <AlertDescription>You have not created any events yet. Please create an event first.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Select onValueChange={handleEventSelect} value={selectedEvent || ''}>
                  <SelectTrigger className="w-full sm:w-[300px]">
                    <SelectValue placeholder="Select an Event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleLoadChart} disabled={!selectedEvent || isLoadingChart}>
                  {isLoadingChart ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isLoadingChart ? 'Loading...' : 'Load Seating Chart'}
                </Button>
              </div>
            </div>
          )}

          {/* Seating chart and student list will be rendered here */}
          {isLoadingChart && (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading seating data...</p>
            </div>
          )}

          {seatingData && (
            <div className="mt-8 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-semibold mb-4">Registered Students ({seatingData.students.length})</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {seatingData.students.map(student => (
                      <Card 
                        key={student.id} 
                        className={`p-3 cursor-pointer transition-all ${selectedStudentId === student.id ? 'ring-2 ring-primary shadow-lg' : 'hover:bg-muted'}`}
                        onClick={() => setSelectedStudentId(student.id)}
                      >
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.department} - {student.year} Year</p>
                      </Card>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                   <h3 className="text-lg font-semibold mb-4">Seating Grid - {seatingData.venue}</h3>
                   <div className="p-4 border rounded-lg bg-background">
                    <SeatingGrid 
                      venue={seatingData.venue}
                      students={seatingData.students}
                      assignments={seatingData.assignments}
                      onAssignSeat={handleAssignSeat}
                      selectedStudentId={selectedStudentId}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
