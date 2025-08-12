"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, BookOpen, Calendar, Clock, UserPlus, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type StudyGroup = {
  id: string;
  name: string;
  description: string;
  subject: string;
  max_members: number;
  created_at: string;
  study_group_members?: Array<{
    id: string;
    name: string;
    email: string;
  }>;
};

export default function StudyGroupsPage() {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStudyGroups = async () => {
      try {
        setLoading(true);
        // Replace with actual API call
        // const response = await fetch('/api/study-groups');
        // const data = await response.json();
        // setStudyGroups(data);
        
        // Mock data for now
        setTimeout(() => {
          setStudyGroups([]); // Empty array for empty state
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError("Failed to load study groups. Please try again later.");
        setLoading(false);
      }
    };

    fetchStudyGroups();
  }, []);

  const handleCreateGroup = () => {
    router.push("/student-dashboard/study-groups/create");
  };

  const handleJoinGroup = (groupId: string) => {
    // Handle join group logic
    toast.success("Request to join group sent!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading study groups</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Study Groups</h1>
          <p className="text-muted-foreground">Join or create study groups to collaborate with peers</p>
        </div>
        <Button onClick={handleCreateGroup}>
          <Plus className="mr-2 h-4 w-4" /> Create Group
        </Button>
      </div>

      {studyGroups.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No study groups yet</h3>
          <p className="text-gray-500 mb-6">Be the first to create a study group and invite your classmates!</p>
          <Button onClick={handleCreateGroup}>
            <Plus className="mr-2 h-4 w-4" /> Create a Study Group
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {studyGroups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {group.study_group_members?.length || 0}/{group.max_members} members
                  </span>
                </div>
                <CardDescription className="line-clamp-2">{group.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span>{group.subject}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Created on {new Date(group.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button className="w-full mt-4" onClick={() => handleJoinGroup(group.id)}>
                  <UserPlus className="h-4 w-4 mr-2" /> Join Group
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
