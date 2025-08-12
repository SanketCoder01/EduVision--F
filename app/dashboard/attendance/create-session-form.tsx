'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const departments = [
  { id: 'cse', name: 'Computer Science and Engineering' },
  { id: 'cyber', name: 'Cyber Security' },
  { id: 'aids', name: 'Artificial Intelligence and Data Science' },
  { id: 'aiml', name: 'Artificial Intelligence and Machine Learning' },
];

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

// Mock data for classrooms - this should be fetched from the database
const classrooms = ['Classroom A', 'Classroom B', 'Classroom C'];

export default function CreateSessionForm() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Attendance Session</CardTitle>
        <CardDescription>Select the department, year, and classroom to start a new session.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="department">Department</Label>
            <Select>
              <SelectTrigger id="department">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="year">Year</Label>
            <Select>
              <SelectTrigger id="year">
                <SelectValue placeholder="Select a year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="classroom">Classroom</Label>
            <Select>
              <SelectTrigger id="classroom">
                <SelectValue placeholder="Select a classroom" />
              </SelectTrigger>
              <SelectContent>
                {classrooms.map((room) => (
                  <SelectItem key={room} value={room}>
                    {room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">Create Session</Button>
        </form>
      </CardContent>
    </Card>
  );
}
