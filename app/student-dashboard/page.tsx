"use client"

import { useUser } from "@/contexts/UserContext";
import { StudentHub } from "@/components/todays-hub/student-hub";

export default function StudentDashboardPage() {
  const { profile, isLoading } = useUser();

  return (
    <div className="p-6">
      <header className="mb-8">
        {isLoading ? (
          <div className="h-10 w-64 bg-gray-200 rounded-md animate-pulse" />
        ) : (
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {profile?.full_name || 'Student'}!
          </h1>
        )}
        <p className="text-lg text-gray-500 mt-1">Here's your personalized hub for today.</p>
      </header>
      <StudentHub />
    </div>
  );
}
