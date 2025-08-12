"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { createStudyGroup, getFacultyStudyGroups, createStudyGroupTask, StudyGroup, StudyGroupTask } from "@/lib/study-groups";
import { useRealtimeStudyGroups, useRealtimeStudyGroupTasks } from "@/hooks/useRealtimeStudyGroups";

export default function FacultyStudyGroupsPage() {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const { toast } = useToast();

  // Get faculty info from localStorage
  const faculty = JSON.parse(localStorage.getItem("faculty") || "{}");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "",
    year: "",
    max_members: 20
  });

  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    due_date: ""
  });

  // Load study groups
  const loadStudyGroups = async () => {
    try {
      const { data, error } = await getFacultyStudyGroups(faculty.id);
      if (error) throw error;
      setStudyGroups(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load study groups",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Real-time study group updates
  useRealtimeStudyGroups(faculty.department, "", (newGroup: StudyGroup) => {
    if (newGroup.faculty_id === faculty.id) {
      setStudyGroups(prev => [newGroup, ...prev.filter(g => g.id !== newGroup.id)]);
    }
  });

  // Real-time task updates
  useRealtimeStudyGroupTasks(selectedGroup?.id || "", (newTask: StudyGroupTask) => {
    if (selectedGroup?.id === newTask.group_id) {
      // Update the selected group's tasks
      setSelectedGroup(prev => prev ? {
        ...prev,
        tasks: [...(prev.tasks || []), newTask]
      } : null);
    }
  });

  useEffect(() => {
    loadStudyGroups();
  }, [faculty.id]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const group: StudyGroup = {
        ...formData,
        faculty_id: faculty.id,
        faculty_name: faculty.name,
        faculty_email: faculty.email
      };

      const { error } = await createStudyGroup(group);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Study group created successfully!"
      });

      setFormData({
        name: "",
        description: "",
        department: "",
        year: "",
        max_members: 20
      });
      setShowForm(false);
      loadStudyGroups();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create study group",
        variant: "destructive"
      });
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGroup) return;
    
    try {
      const task: StudyGroupTask = {
        ...taskFormData,
        group_id: selectedGroup.id!,
        assigned_by: faculty.id,
        assigned_by_name: faculty.name
      };

      const { error } = await createStudyGroupTask(task);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Task created successfully!"
      });

      setTaskFormData({
        title: "",
        description: "",
        due_date: ""
      });
      setShowTaskForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading study groups...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Study Groups</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Create Study Group"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Study Group</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <Input
                placeholder="Study Group Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Mechanical">Mechanical</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Civil">Civil</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={formData.year} onValueChange={(value) => setFormData({...formData, year: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st Year</SelectItem>
                    <SelectItem value="2nd">2nd Year</SelectItem>
                    <SelectItem value="3rd">3rd Year</SelectItem>
                    <SelectItem value="4th">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="number"
                placeholder="Max Members"
                value={formData.max_members}
                onChange={(e) => setFormData({...formData, max_members: parseInt(e.target.value)})}
                min="1"
                max="50"
              />
              <Button type="submit">Create Study Group</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {studyGroups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{group.name}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {group.department} - {group.year} Year
                  </p>
                </div>
                <Badge variant="secondary">
                  {group.study_group_members?.length || 0} members
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{group.description}</p>
              <div className="flex gap-2">
                <Button onClick={() => setSelectedGroup(group)}>
                  View Details
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedGroup(group);
                    setShowTaskForm(true);
                  }}
                >
                  Add Task
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedGroup && (
        <Card>
          <CardHeader>
            <CardTitle>Study Group: {selectedGroup.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Members</h4>
                <div className="space-y-2">
                  {selectedGroup.study_group_members?.map((member) => (
                    <div key={member.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{member.student_name}</p>
                        <p className="text-sm text-gray-600">{member.student_email}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        Joined: {new Date(member.joined_at!).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {(!selectedGroup.study_group_members || selectedGroup.study_group_members.length === 0) && (
                    <p className="text-gray-500">No members yet</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showTaskForm && selectedGroup && (
        <Card>
          <CardHeader>
            <CardTitle>Create Task for: {selectedGroup.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <Input
                placeholder="Task Title"
                value={taskFormData.title}
                onChange={(e) => setTaskFormData({...taskFormData, title: e.target.value})}
                required
              />
              <Textarea
                placeholder="Task Description"
                value={taskFormData.description}
                onChange={(e) => setTaskFormData({...taskFormData, description: e.target.value})}
                required
              />
              <Input
                type="date"
                value={taskFormData.due_date}
                onChange={(e) => setTaskFormData({...taskFormData, due_date: e.target.value})}
                required
              />
              <div className="flex gap-2">
                <Button type="submit">Create Task</Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowTaskForm(false);
                    setSelectedGroup(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
