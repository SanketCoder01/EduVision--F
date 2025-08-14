'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Plus, 
  MessageSquare, 
  ClipboardList, 
  Award, 
  Shuffle,
  Calendar,
  BookOpen,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  Settings
} from 'lucide-react';
import { 
  getFacultyStudyGroups, 
  randomlyAssignStudents, 
  deleteStudyGroup,
  type StudyGroup 
} from './actions';
import CreateGroupModal from './_components/CreateGroupModal';
import GroupDetailsModal from './_components/GroupDetailsModal';

export default function StudyGroupsPage() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assigningStudents, setAssigningStudents] = useState<string | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<string | null>(null);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    
    const result = await getFacultyStudyGroups();
    if (result.error) {
      setError(result.error.message);
    } else {
      setGroups(result.data || []);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleRandomAssignment = async (groupId: string) => {
    setAssigningStudents(groupId);
    
    const result = await randomlyAssignStudents(groupId);
    if (result.error) {
      setError(result.error.message);
    } else {
      await fetchGroups(); // Refresh the groups
    }
    
    setAssigningStudents(null);
  };

  const handleDeleteGroup = async (groupId: string) => {
    setDeletingGroup(groupId);
    
    const result = await deleteStudyGroup(groupId);
    if (result.error) {
      setError(result.error.message);
    } else {
      await fetchGroups(); // Refresh the groups
    }
    
    setDeletingGroup(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'forming': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Loading study groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Study Groups Management
          </h1>
          <p className="text-gray-600 mt-1">Create and manage student study groups with random assignment</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Group
        </Button>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Groups</p>
                <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Groups</p>
                <p className="text-2xl font-bold text-gray-900">
                  {groups.filter(g => g.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Forming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {groups.filter(g => g.status === 'forming').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {groups.reduce((sum, g) => sum + g.current_size, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groups List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {groups.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No study groups yet</h3>
              <p className="text-gray-600 mb-4">Create your first study group to get started with collaborative learning.</p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Study Group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {groups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-gray-900 mb-2">{group.name}</CardTitle>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge className={getStatusColor(group.status)}>
                            {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {group.subject}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {group.department} - Year {group.year}
                          </Badge>
                          <Badge variant="outline">
                            {group.current_size}/{group.max_size} members
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {group.status === 'open' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRandomAssignment(group.id)}
                            disabled={assigningStudents === group.id}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {assigningStudents === group.id ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Shuffle className="h-4 w-4" />
                              </motion.div>
                            ) : (
                              <Shuffle className="h-4 w-4" />
                            )}
                            Random Assign
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedGroup(group)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteGroup(group.id)}
                          disabled={deletingGroup === group.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          {deletingGroup === group.id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {group.description && (
                      <p className="text-gray-600 mb-4">{group.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Created on {formatDate(group.created_at)}</span>
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="text-blue-600">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Messages
                        </Button>
                        <Button variant="ghost" size="sm" className="text-green-600">
                          <ClipboardList className="h-4 w-4 mr-1" />
                          Tasks
                        </Button>
                        <Button variant="ghost" size="sm" className="text-purple-600">
                          <Award className="h-4 w-4 mr-1" />
                          Grades
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create Group Modal - We'll create this component */}
      {showCreateModal && (
        <CreateGroupModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchGroups();
          }}
        />
      )}

      {/* Group Details Modal - We'll create this component */}
      {selectedGroup && (
        <GroupDetailsModal
          group={selectedGroup}
          isOpen={!!selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onRefresh={fetchGroups}
        />
      )}
    </div>
  );
}