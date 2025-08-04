"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import TaskDialog from "@/components/task-dialog"

const StudyGroupPage = () => {
  const [group, setGroup] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTaskDialog, setShowTaskDialog] = useState(false)

  const params = useParams()
  const router = useRouter()
  const { classId, groupId } = params

  useEffect(() => {
    const fetchGroupDetails = async () => {
      setLoading(true)
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/classes/${classId}/groups/${groupId}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setGroup(data.group) // Assuming the API returns a 'group' object
        setTasks(data.tasks) // Assuming the API returns a 'tasks' array
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    if (classId && groupId) {
      fetchGroupDetails()
    }
  }, [classId, groupId])

  if (loading) {
    return <div>Loading group details...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!group) {
    return <div>Group not found.</div>
  }

  const handleOpenTaskDialog = () => {
    setShowTaskDialog(true)
  }

  const handleCloseTaskDialog = () => {
    setShowTaskDialog(false)
  }

  const handleTaskCreated = (newTask) => {
    setTasks([...tasks, newTask])
    handleCloseTaskDialog()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{group.name}</h1>
        <Button onClick={handleOpenTaskDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <TaskDialog
        open={showTaskDialog}
        onClose={handleCloseTaskDialog}
        classId={classId}
        groupId={groupId}
        onTaskCreated={handleTaskCreated}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle>{task.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{task.description}</p>
              <p>Due Date: {task.dueDate}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default StudyGroupPage
