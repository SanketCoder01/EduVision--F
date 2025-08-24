'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FIELDS, getCoursesByField, searchCourses, type Field } from '@/lib/constants/fields-courses';

interface CourseSelectorProps {
  selectedField: string;
  selectedCourse: string;
  onFieldChangeAction: (field: string) => void;
  onCourseChangeAction: (course: string) => void;
}

export default function CourseSelector({ 
  selectedField, 
  selectedCourse, 
  onFieldChangeAction, 
  onCourseChangeAction 
}: CourseSelectorProps) {
  const [courseSearchTerm, setCourseSearchTerm] = useState('');

  // Get filtered courses based on search term
  const filteredCourses = useMemo(() => {
    if (!selectedField) return [];
    return searchCourses(selectedField as Field, courseSearchTerm);
  }, [selectedField, courseSearchTerm]);

  const handleFieldChange = (field: string) => {
    onFieldChangeAction(field);
    onCourseChangeAction(''); // Reset course when field changes
    setCourseSearchTerm(''); // Reset search term
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Field Selection */}
      <div className="space-y-2">
        <Label htmlFor="field">Field of Study</Label>
        <Select value={selectedField} onValueChange={handleFieldChange}>
          <SelectTrigger id="field">
            <SelectValue placeholder="Select Field" />
          </SelectTrigger>
          <SelectContent>
            {FIELDS.map((field) => (
              <SelectItem key={field} value={field}>
                {field}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Course Selection with Search */}
      <div className="space-y-2">
        <Label htmlFor="course">Course</Label>
        {selectedField ? (
          <div className="space-y-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courses..."
                value={courseSearchTerm}
                onChange={(e) => setCourseSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Course Dropdown */}
            <Select value={selectedCourse} onValueChange={onCourseChangeAction}>
              <SelectTrigger id="course">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1 text-sm text-gray-500">
                    No courses found
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <Select disabled>
            <SelectTrigger id="course">
              <SelectValue placeholder="Select Field first" />
            </SelectTrigger>
          </Select>
        )}
      </div>
    </div>
  );
}
