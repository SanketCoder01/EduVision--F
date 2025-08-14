'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  MessageSquare, 
  ClipboardList, 
  Award, 
  Send,
  Plus,
  Calendar,
  User,
  Crown,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react';
import { 
  type StudyGroup,
  createGroupTask,
  sendGroupMessage,
  gradeTaskSubmission
} from '../actions';

interface GroupDetailsModalProps {
  group: StudyGroup;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function GroupDetailsModal({ group, isOpen, onClose, onRefresh }: GroupDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('members');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Message state
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Task state
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxGrade: 100
  });
  const [creatingTask, setCreatingTask] = useState(false);

  // Grading state
  const [gradingSubmission, setGradingSubmission] = useState<string | null>(null);
  const [gradeData, setGradeData] = useState({ grade: 0, feedback: '' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'forming': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setSendingMessage(true);
    setError(null);
    
    const result = await sendGroupMessage(group.id, message);
    if (result.error) {
      setError(result.error.message);
    } else {
      setMessage('');
      onRefresh();
    }
    
    setSendingMessage(false);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTask(true);
    setError(null);

    const formData = new FormData();
    formData.append('groupId', group.id);
    formData.append('title', taskData.title);
    formData.append('description', taskData.description);
    formData.append('dueDate', taskData.dueDate);
    formData.append('maxGrade', taskData.maxGrade.toString());

    const result = await createGroupTask(formData);
    if (result.error) {
      setError(result.error.message);
    } else {
      setShowCreateTask(false);
      setTaskData({ title: '', description: '', dueDate: '', maxGrade: 100 });
      onRefresh();
    }
    
    setCreatingTask(false);
  };

  const handleGradeSubmission = async (submissionId: string) => {
    setGradingSubmission(submissionId);
    setError(null);

    const result = await gradeTaskSubmission(submissionId, gradeData.grade, gradeData.feedback);
    if (result.error) {
      setError(result.error.message);
    } else {
      setGradingSubmission(null);
      setGradeData({ grade: 0, feedback: '' });
      onRefresh();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold">{group.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getStatusColor(group.status)}>
                    {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                  </Badge>
                  <Badge variant="outline">{group.subject}</Badge>
                  <Badge variant="outline">{group.department} - Year {group.year}</Badge>
                </div>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>{group.current_size}/{group.max_size} members</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="grades" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Grades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Group Members ({group.current_size})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {group.current_size === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No members assigned yet</p>
                    <p className="text-sm">Use "Random Assign" to add students to this group</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {(group as any).group_members?.map((member: any) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            {member.role === 'leader' ? (
                              <Crown className="h-5 w-5 text-yellow-600" />
                            ) : (
                              <User className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{member.student_name}</p>
                            <p className="text-sm text-gray-600">{member.student_email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={member.role === 'leader' ? 'default' : 'secondary'}>
                            {member.role === 'leader' ? 'Group Leader' : 'Member'}
                          </Badge>
                          <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                            {member.status}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Group Messages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message to the group..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !message.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {sendingMessage ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {/* Messages would be loaded here */}
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start a conversation with your group</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Group Tasks
                  </CardTitle>
                  <Button 
                    onClick={() => setShowCreateTask(true)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showCreateTask && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleCreateTask}
                    className="space-y-4 p-4 bg-gray-50 rounded-lg mb-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="taskTitle">Task Title *</Label>
                        <Input
                          id="taskTitle"
                          value={taskData.title}
                          onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Algorithm Analysis Report"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="dueDate">Due Date *</Label>
                        <Input
                          id="dueDate"
                          type="datetime-local"
                          value={taskData.dueDate}
                          onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="taskDescription">Description *</Label>
                      <Textarea
                        id="taskDescription"
                        value={taskData.description}
                        onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the task requirements..."
                        rows={3}
                        required
                      />
                    </div>
                    <div className="w-32">
                      <Label htmlFor="maxGrade">Max Grade</Label>
                      <Input
                        id="maxGrade"
                        type="number"
                        min="1"
                        max="1000"
                        value={taskData.maxGrade}
                        onChange={(e) => setTaskData(prev => ({ ...prev, maxGrade: parseInt(e.target.value) || 100 }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateTask(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={creatingTask}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {creatingTask ? 'Creating...' : 'Create Task'}
                      </Button>
                    </div>
                  </motion.form>
                )}

                <div className="space-y-3">
                  {/* Tasks would be loaded here */}
                  <div className="text-center py-8 text-gray-500">
                    <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No tasks assigned yet</p>
                    <p className="text-sm">Create tasks to assign work to the group</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Grades & Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No grades available yet</p>
                  <p className="text-sm">Grades will appear here after tasks are submitted and graded</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
