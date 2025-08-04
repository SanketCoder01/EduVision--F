"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, UserPlus, Shuffle, Save, ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CreateGroupsPage({ params }) {
  const { toast } = useToast()
  const router = useRouter()
  const [classId] = useState(params.classId)
  const [groupingMethod, setGroupingMethod] = useState("")
  const [groupSize, setGroupSize] = useState(4)
  const [numberOfGroups, setNumberOfGroups] = useState(5)
  const [groups, setGroups] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Mock students data
  const [students] = useState([
    { id: 1, name: "Rahul Sharma", prn: "PRN2023001", cgpa: 8.5, skills: ["React", "Node.js"] },
    { id: 2, name: "Priya Patel", prn: "PRN2023002", cgpa: 9.2, skills: ["Python", "ML"] },
    { id: 3, name: "Amit Kumar", prn: "PRN2023003", cgpa: 7.8, skills: ["Java", "Spring"] },
    { id: 4, name: "Sneha Gupta", prn: "PRN2023004", cgpa: 8.9, skills: ["React", "Python"] },
    { id: 5, name: "Vikram Singh", prn: "PRN2023005", cgpa: 8.1, skills: ["Node.js", "MongoDB"] },
    { id: 6, name: "Neha Verma", prn: "PRN2023006", cgpa: 9.0, skills: ["Flutter", "Dart"] },
    { id: 7, name: "Raj Malhotra", prn: "PRN2023007", cgpa: 7.5, skills: ["C++", "DSA"] },
    { id: 8, name: "Ananya Desai", prn: "PRN2023008", cgpa: 8.7, skills: ["React", "TypeScript"] },
    { id: 9, name: "Rohan Joshi", prn: "PRN2023009", cgpa: 8.3, skills: ["Python", "Django"] },
    { id: 10, name: "Kavita Reddy", prn: "PRN2023010", cgpa: 9.1, skills: ["Java", "Microservices"] },
    { id: 11, name: "Arjun Nair", prn: "PRN2023011", cgpa: 7.9, skills: ["React Native", "Firebase"] },
    { id: 12, name: "Pooja Agarwal", prn: "PRN2023012", cgpa: 8.6, skills: ["Angular", "Node.js"] },
    { id: 13, name: "Karan Mehta", prn: "PRN2023013", cgpa: 8.0, skills: ["Vue.js", "Express"] },
    { id: 14, name: "Riya Sharma", prn: "PRN2023014", cgpa: 9.3, skills: ["Python", "TensorFlow"] },
    { id: 15, name: "Siddharth Rao", prn: "PRN2023015", cgpa: 7.7, skills: ["PHP", "Laravel"] },
    { id: 16, name: "Meera Iyer", prn: "PRN2023016", cgpa: 8.8, skills: ["React", "GraphQL"] },
    { id: 17, name: "Aditya Gupta", prn: "PRN2023017", cgpa: 8.2, skills: ["Kotlin", "Android"] },
    { id: 18, name: "Shruti Pandey", prn: "PRN2023018", cgpa: 8.4, skills: ["Swift", "iOS"] },
    { id: 19, name: "Nikhil Jain", prn: "PRN2023019", cgpa: 7.6, skills: ["Go", "Docker"] },
    { id: 20, name: "Divya Singh", prn: "PRN2023020", cgpa: 9.0, skills: ["React", "AWS"] },
  ])

  useEffect(() => {
    // Initialize with all students selected
    setSelectedStudents(students.map((s) => s.id))
  }, [students])

  const createRandomGroups = () => {
    const shuffled = [...selectedStudents]
      .map((id) => students.find((s) => s.id === id))
      .sort(() => Math.random() - 0.5)

    const newGroups = []
    for (let i = 0; i < shuffled.length; i += groupSize) {
      const groupMembers = shuffled.slice(i, i + groupSize)
      if (groupMembers.length > 0) {
        newGroups.push({
          id: newGroups.length + 1,
          name: `Group ${newGroups.length + 1}`,
          members: groupMembers,
          leader: groupMembers[0], // First member as leader
        })
      }
    }

    setGroups(newGroups)
    setShowPreview(true)
  }

  const createBalancedGroups = () => {
    // Sort students by CGPA for balanced distribution
    const sortedStudents = [...selectedStudents]
      .map((id) => students.find((s) => s.id === id))
      .sort((a, b) => b.cgpa - a.cgpa)

    const newGroups = Array.from({ length: numberOfGroups }, (_, i) => ({
      id: i + 1,
      name: `Group ${i + 1}`,
      members: [],
      leader: null,
    }))

    // Distribute students in round-robin fashion
    sortedStudents.forEach((student, index) => {
      const groupIndex = index % numberOfGroups
      newGroups[groupIndex].members.push(student)
      if (newGroups[groupIndex].members.length === 1) {
        newGroups[groupIndex].leader = student
      }
    })

    setGroups(newGroups.filter((group) => group.members.length > 0))
    setShowPreview(true)
  }

  const createSkillBasedGroups = () => {
    const studentsWithSkills = selectedStudents.map((id) => students.find((s) => s.id === id))

    // Group students with complementary skills
    const skillGroups = {}
    const usedStudents = new Set()

    studentsWithSkills.forEach((student) => {
      if (usedStudents.has(student.id)) return

      const group = [student]
      usedStudents.add(student.id)

      // Find students with different skills
      studentsWithSkills.forEach((otherStudent) => {
        if (
          !usedStudents.has(otherStudent.id) &&
          group.length < groupSize &&
          !student.skills.some((skill) => otherStudent.skills.includes(skill))
        ) {
          group.push(otherStudent)
          usedStudents.add(otherStudent.id)
        }
      })

      if (group.length > 0) {
        skillGroups[Object.keys(skillGroups).length] = group
      }
    })

    const newGroups = Object.entries(skillGroups).map(([index, members]) => ({
      id: Number.parseInt(index) + 1,
      name: `Group ${Number.parseInt(index) + 1}`,
      members,
      leader: members[0],
    }))

    setGroups(newGroups)
    setShowPreview(true)
  }

  const handleGroupingMethod = (method) => {
    setGroupingMethod(method)

    // Immediate execution without loading delay
    switch (method) {
      case "random":
        createRandomGroups()
        break
      case "balanced":
        createBalancedGroups()
        break
      case "skill-based":
        createSkillBasedGroups()
        break
      default:
        break
    }
  }

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  const saveGroups = async () => {
    setIsCreating(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Save groups to localStorage or database
    const groupsData = {
      classId,
      groups,
      createdAt: new Date().toISOString(),
      method: groupingMethod,
    }

    localStorage.setItem(`study-groups-${classId}`, JSON.stringify(groupsData))

    setIsCreating(false)
    toast({
      title: "Groups Created Successfully",
      description: `${groups.length} study groups have been created for ${classId}`,
    })

    router.push(`/dashboard/study-groups/${classId}`)
  }

  const getGroupStats = () => {
    if (groups.length === 0) return null

    const totalStudents = groups.reduce((sum, group) => sum + group.members.length, 0)
    const avgGroupSize = (totalStudents / groups.length).toFixed(1)
    const avgCGPA = (
      groups.reduce((sum, group) => sum + group.members.reduce((gSum, member) => gSum + member.cgpa, 0), 0) /
      totalStudents
    ).toFixed(2)

    return { totalStudents, avgGroupSize, avgCGPA }
  }

  const stats = getGroupStats()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Study Groups</h1>
            <p className="text-gray-500">Class: {classId}</p>
          </div>
        </div>
        {groups.length > 0 && (
          <Button onClick={saveGroups} disabled={isCreating}>
            {isCreating ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Groups
              </>
            )}
          </Button>
        )}
      </div>

      <Tabs defaultValue="method" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="method">Grouping Method</TabsTrigger>
          <TabsTrigger value="students">Select Students</TabsTrigger>
          <TabsTrigger value="preview" disabled={groups.length === 0}>
            Preview Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="method" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose Grouping Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    className={`cursor-pointer transition-colors ${
                      groupingMethod === "random" ? "border-purple-600 bg-purple-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleGroupingMethod("random")}
                  >
                    <CardContent className="p-6 text-center">
                      <Shuffle className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                      <h3 className="font-medium mb-2">Random Groups</h3>
                      <p className="text-sm text-gray-500">Randomly assign students to groups</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    className={`cursor-pointer transition-colors ${
                      groupingMethod === "balanced" ? "border-purple-600 bg-purple-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleGroupingMethod("balanced")}
                  >
                    <CardContent className="p-6 text-center">
                      <Users className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                      <h3 className="font-medium mb-2">Balanced Groups</h3>
                      <p className="text-sm text-gray-500">Balance groups by CGPA and performance</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    className={`cursor-pointer transition-colors ${
                      groupingMethod === "skill-based" ? "border-purple-600 bg-purple-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleGroupingMethod("skill-based")}
                  >
                    <CardContent className="p-6 text-center">
                      <UserPlus className="h-8 w-8 mx-auto mb-3 text-green-600" />
                      <h3 className="font-medium mb-2">Skill-Based Groups</h3>
                      <p className="text-sm text-gray-500">Group by complementary skills</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {groupingMethod && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="border-t pt-4 mt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupingMethod === "random" && (
                      <div className="space-y-2">
                        <Label htmlFor="groupSize">Students per Group</Label>
                        <Input
                          id="groupSize"
                          type="number"
                          min="2"
                          max="8"
                          value={groupSize}
                          onChange={(e) => setGroupSize(Number.parseInt(e.target.value))}
                        />
                      </div>
                    )}

                    {groupingMethod === "balanced" && (
                      <div className="space-y-2">
                        <Label htmlFor="numberOfGroups">Number of Groups</Label>
                        <Input
                          id="numberOfGroups"
                          type="number"
                          min="2"
                          max="10"
                          value={numberOfGroups}
                          onChange={(e) => setNumberOfGroups(Number.parseInt(e.target.value))}
                        />
                      </div>
                    )}

                    {groupingMethod === "skill-based" && (
                      <div className="space-y-2">
                        <Label htmlFor="maxGroupSize">Max Group Size</Label>
                        <Input
                          id="maxGroupSize"
                          type="number"
                          min="3"
                          max="6"
                          value={groupSize}
                          onChange={(e) => setGroupSize(Number.parseInt(e.target.value))}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Students ({selectedStudents.length} selected)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <motion.div
                    key={student.id}
                    whileHover={{ scale: 1.02 }}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedStudents.includes(student.id)
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => toggleStudentSelection(student.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{student.name}</h4>
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center ${
                          selectedStudents.includes(student.id) ? "bg-purple-600 border-purple-600" : "border-gray-300"
                        }`}
                      >
                        {selectedStudents.includes(student.id) && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{student.prn}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">CGPA: {student.cgpa}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {student.skills.slice(0, 2).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {student.skills.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{student.skills.length - 2}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Group Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{groups.length}</div>
                    <div className="text-sm text-gray-500">Total Groups</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.avgGroupSize}</div>
                    <div className="text-sm text-gray-500">Avg Group Size</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.avgCGPA}</div>
                    <div className="text-sm text-gray-500">Avg CGPA</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <motion.div key={group.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{group.name}</span>
                      <Badge variant="outline">{group.members.length} members</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {group.members.map((member, index) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium flex items-center">
                            {member.name}
                            {index === 0 && (
                              <Badge variant="outline" className="ml-2 text-xs bg-yellow-50 text-yellow-700">
                                Leader
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">CGPA: {member.cgpa}</div>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-3 mt-3">
                      <div className="text-sm text-gray-500 mb-2">Group Skills:</div>
                      <div className="flex flex-wrap gap-1">
                        {[...new Set(group.members.flatMap((m) => m.skills))].slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
