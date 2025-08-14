import React from 'react';
import { FacultyHub } from '@/components/todays-hub/faculty-hub';

export const dynamic = 'force-dynamic';

export default function FacultyDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <FacultyHub />
      </div>
    </div>
  );
}
