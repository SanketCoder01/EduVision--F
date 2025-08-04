"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Comment } from "@/types/assignment"

interface CommentSectionProps {
  comments: Comment[]
  onAddComment: (content: string) => Promise<void>
  currentUserId: string
  currentUserType: "faculty" | "student"
}

export function CommentSection({ comments, onAddComment, currentUserId, currentUserType }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock user data - in a real app, you'd fetch this from your database
  const users = {
    "faculty-1": { name: "Prof. Sharma", role: "faculty", avatar: "/placeholder.svg?height=40&width=40" },
    "faculty-2": { name: "Dr. Patel", role: "faculty", avatar: "/placeholder.svg?height=40&width=40" },
    "student-1": { name: "Rahul Sharma", role: "student", avatar: "/placeholder.svg?height=40&width=40" },
    "student-2": { name: "Priya Patel", role: "student", avatar: "/placeholder.svg?height=40&width=40" },
    "student-3": { name: "Amit Kumar", role: "student", avatar: "/placeholder.svg?height=40&width=40" },
  }

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)

    try {
      await onAddComment(newComment)
      setNewComment("")
    } catch (error) {
      console.error("Error adding comment:", error)
      alert("Failed to add comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getUserInfo = (userId: string) => {
    return (
      users[userId as keyof typeof users] || {
        name: "Unknown User",
        role: "unknown",
        avatar: "/placeholder.svg?height=40&width=40",
      }
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Comments</h3>

      <div className="space-y-4 max-h-[400px] overflow-y-auto p-2">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No comments yet. Be the first to comment!</div>
        ) : (
          comments.map((comment) => {
            const user = getUserInfo(comment.user_id)
            const isCurrentUser = comment.user_id === currentUserId

            return (
              <div key={comment.id} className={`flex gap-3 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                {!isCurrentUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[80%] ${isCurrentUser ? "bg-purple-100" : "bg-gray-100"} p-3 rounded-lg`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{user.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>

                {isCurrentUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="flex gap-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px]"
        />
        <Button
          className="self-end bg-purple-600 hover:bg-purple-700"
          onClick={handleSubmit}
          disabled={isSubmitting || !newComment.trim()}
        >
          {isSubmitting ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
