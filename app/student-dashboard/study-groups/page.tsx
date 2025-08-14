'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { 
  Users, 
  MessageSquare, 
  ClipboardList, 
  Award, 
  Send,
  CheckCircle,
  Clock,
  Crown,
  User,
  Download,
  Upload,
  Bell,
  AlertCircle,
  Calendar,
  BookOpen,
  GraduationCap,
  FileText,
  Loader2
} from 'lucide-react';
import { 
  getStudentStudyGroups,
  acceptGroupInvitation,
  getGroupMessages,
  sendStudentMessage,
  getGroupTasks,
  submitTask,
  generateGroupReport,
  type StudentStudyGroup
} from './actions';

export default function StudentStudyGroupsPage() {
  const { toast } = useToast();
  const [groups, setGroups] = useState<StudentStudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<StudentStudyGroup | null>(null);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskSubmission, setShowTaskSubmission] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadStudyGroups();
  }, []);

  const loadStudyGroups = async () => {
    try {
      setLoading(true);
      const result = await getStudentStudyGroups();
      
      if (result.error) {
        setError(result.error.message);
      } else {
        setGroups(result.data || []);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load study groups');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (groupId: string) => {
    try {
      const result = await acceptGroupInvitation(groupId);
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Success',
          description: 'Group invitation accepted successfully!'
        });
        loadStudyGroups();
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to accept invitation',
        variant: 'destructive'
      });
    }
  };

  const handleViewGroup = async (group: StudentStudyGroup) => {
    setSelectedGroup(group);
    setActiveTab('overview');
    setShowGroupDetails(true);
    
    // Load group messages and tasks
    try {
      const [messagesResult, tasksResult] = await Promise.all([
        getGroupMessages(group.id),
        getGroupTasks(group.id)
      ]);
      
      if (messagesResult.data) setMessages(messagesResult.data);
      if (tasksResult.data) setTasks(tasksResult.data);
    } catch (err) {
      console.error('Error loading group details:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedGroup || !newMessage.trim()) return;
    
    try {
      const result = await sendStudentMessage(selectedGroup.id, newMessage);
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error.message,
          variant: 'destructive'
        });
      } else {
        setNewMessage('');
        // Reload messages
        const messagesResult = await getGroupMessages(selectedGroup.id);
        if (messagesResult.data) setMessages(messagesResult.data);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to send message',
        variant: 'destructive'
      });
    }
  };

  const handleSubmitTask = async () => {
    if (!selectedTask || !submissionText.trim()) return;
    
    try {
      const formData = new FormData();
      formData.append('taskId', selectedTask.id);
      formData.append('groupId', selectedTask.group_id);
      formData.append('submissionText', submissionText);
      if (submissionFile) {
        formData.append('file', submissionFile);
      }
      
      const result = await submitTask(formData);
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Success',
          description: 'Task submitted successfully!'
        });
        setShowTaskSubmission(false);
        setSubmissionText('');
        setSubmissionFile(null);
        // Reload tasks
        if (selectedGroup) {
          const tasksResult = await getGroupTasks(selectedGroup.id);
          if (tasksResult.data) setTasks(tasksResult.data);
        }
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to submit task',
        variant: 'destructive'
      });
    }
  };

  const handleDownloadReport = async (group: StudentStudyGroup) => {
    try {
      const result = await generateGroupReport(group.id);
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error.message,
          variant: 'destructive'
        });
      } else {
        // Create and download JSON report
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${group.name}_report.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to generate report',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'forming': { color: 'bg-yellow-100 text-yellow-800', label: 'Forming' },
      'active': { color: 'bg-green-100 text-green-800', label: 'Active' },
      'completed': { color: 'bg-blue-100 text-blue-800', label: 'Completed' },
      'open': { color: 'bg-gray-100 text-gray-800', label: 'Open' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getRoleBadge = (role?: string) => {
    if (role === 'leader') {
      return <Badge className="bg-purple-100 text-purple-800"><Crown className="w-3 h-3 mr-1" />Leader</Badge>;
    }
    return <Badge variant="outline"><User className="w-3 h-3 mr-1" />Member</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Groups</h1>
          <p className="text-gray-600 mt-1">Collaborate and learn with your peers</p>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">
            {groups.filter(g => g.member_status === 'pending').length} pending invitations
          </span>
        </div>
      </div>

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
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Groups</p>
                <p className="text-2xl font-bold">{groups.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Groups</p>
                <p className="text-2xl font-bold">{groups.filter(g => g.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Invites</p>
                <p className="text-2xl font-bold">{groups.filter(g => g.member_status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Leadership Roles</p>
                <p className="text-2xl font-bold">{groups.filter(g => g.member_role === 'leader').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <p className="text-sm text-gray-600">{group.subject}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(group.status)}
                    {group.is_member && getRoleBadge(group.member_role)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{group.department} • {group.year}</span>
                  <span>{group.current_size}/{group.max_size} members</span>
                </div>

                <div className="flex gap-2">
                  {group.member_status === 'pending' ? (
                    <Button 
                      size="sm" 
                      onClick={() => handleAcceptInvitation(group.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Accept Invitation
                    </Button>
                  ) : group.is_member ? (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleViewGroup(group)}
                        className="flex-1"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDownloadReport(group)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" className="flex-1" disabled>
                      Not a Member
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {groups.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Study Groups</h3>
            <p className="text-gray-600">You haven't been assigned to any study groups yet.</p>
          </CardContent>
        </Card>
      )}

      {/* Group Details Modal */}
      <Dialog open={showGroupDetails} onOpenChange={setShowGroupDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {selectedGroup?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedGroup && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
              </TabsList>
              
              <div className="mt-4 h-[500px]">
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Subject</Label>
                      <p className="text-sm text-gray-600">{selectedGroup.subject}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Department</Label>
                      <p className="text-sm text-gray-600">{selectedGroup.department}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Year</Label>
                      <p className="text-sm text-gray-600">{selectedGroup.year}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">{getStatusBadge(selectedGroup.status)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedGroup.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{selectedGroup.current_size}/{selectedGroup.max_size} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Created {new Date(selectedGroup.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="messages" className="h-full flex flex-col">
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <div key={message.id} className="flex gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{message.sender_name}</span>
                              <Badge variant="outline" className="text-xs">
                                {message.sender_type}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(message.sent_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{message.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="tasks" className="space-y-4">
                  <ScrollArea className="h-[450px]">
                    {tasks.map((task) => (
                      <Card key={task.id} className="mb-4">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{task.title}</CardTitle>
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            </div>
                            <Badge className={
                              task.status === 'graded' ? 'bg-green-100 text-green-800' :
                              task.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {task.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                            <span>Max Grade: {task.max_grade}</span>
                          </div>
                          
                          {task.submission ? (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium mb-2">Your Submission:</p>
                              <p className="text-sm text-gray-700">{task.submission.submission_text}</p>
                              {task.submission.file_name && (
                                <p className="text-sm text-blue-600 mt-1">📎 {task.submission.file_name}</p>
                              )}
                              {task.submission.grade !== null && (
                                <div className="mt-2 pt-2 border-t">
                                  <p className="text-sm font-medium">Grade: {task.submission.grade}/{task.max_grade}</p>
                                  {task.submission.feedback && (
                                    <p className="text-sm text-gray-600 mt-1">{task.submission.feedback}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : task.status === 'assigned' ? (
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setSelectedTask(task);
                                setShowTaskSubmission(true);
                              }}
                            >
                              <Upload className="w-4 h-4 mr-1" />
                              Submit Task
                            </Button>
                          ) : null}
                        </CardContent>
                      </Card>
                    ))}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="members" className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    {selectedGroup.current_size} of {selectedGroup.max_size} members
                  </div>
                  
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {/* Note: Member data would come from the group details API */}
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Member details will be loaded from the server</p>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Task Submission Modal */}
      <Dialog open={showTaskSubmission} onOpenChange={setShowTaskSubmission}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Task: {selectedTask?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="submission">Submission Text</Label>
              <Textarea
                id="submission"
                placeholder="Enter your submission..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="file">Attachment (Optional)</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskSubmission(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitTask} disabled={!submissionText.trim()}>
              Submit Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
