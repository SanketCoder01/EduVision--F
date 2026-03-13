"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, Save, ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

const sections = ["University PRN", "Personal Details"]

function getStudentTableName(department: string, year: string): string {
  const deptMap: Record<string, string> = {
    CSE: "cse",
    CYBER: "cyber",
    AIDS: "aids",
    AIML: "aiml",
  }

  const yearMap: Record<string, string> = {
    first: "1st",
    second: "2nd",
    third: "3rd",
    fourth: "4th",
  }

  const dept = deptMap[department?.toUpperCase()] || "cse"
  const yr = yearMap[year?.toLowerCase()] || "3rd"
  return `students_${dept}_${yr}_year`
}

export default function CompleteRegistration() {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [student, setStudent] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    prn: "",
    first_name: "",
    middle_name: "",
    last_name: "",
  })

  useEffect(() => {
    void fetchStudentData()
  }, [])

  const fetchStudentData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      const { data: studentData, error } = await supabase
        .from("students")
        .select("*")
        .eq("email", session.user.email)
        .single()

      if (error || !studentData) {
        throw new Error(error?.message || "Student not found")
      }

      setStudent(studentData)

      setFormData((prev) => ({
        ...prev,
        prn: studentData.prn || "",
        first_name: studentData.name?.split(" ")?.[0] || "",
        middle_name: "",
        last_name: studentData.name?.split(" ")?.slice(-1)?.[0] || "",
      }))

      if (!studentData.registration_completed && typeof studentData.registration_step === "number") {
        setCurrentStep(Math.min(studentData.registration_step, sections.length - 1))
      }
    } catch (err) {
      console.error("Error fetching student data:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load student data",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateCurrentStep = (): boolean => {
    if (currentStep === 0) {
      if (!formData.prn.trim()) {
        toast({ title: "Missing Information", description: "Please enter your University PRN.", variant: "destructive" })
        return false
      }
      return true
    }

    if (!formData.first_name.trim()) {
      toast({ title: "Missing Information", description: "Please enter your first name.", variant: "destructive" })
      return false
    }
    if (!formData.last_name.trim()) {
      toast({ title: "Missing Information", description: "Please enter your last name.", variant: "destructive" })
      return false
    }
    return true
  }

  const saveProgress = async (nextStep?: number, opts?: { silent?: boolean }): Promise<boolean> => {
    try {
      setLoading(true)

      if (!student?.id) throw new Error("Student data not loaded")
      if (!student.department || !student.year) throw new Error("Missing department/year for student")

      const updateData = {
        prn: formData.prn,
        name: `${formData.first_name} ${formData.middle_name} ${formData.last_name}`.trim(),
        registration_step: typeof nextStep === "number" ? nextStep : currentStep,
      }

      const { error: mainError } = await supabase.from("students").update(updateData).eq("id", student.id)
      if (mainError) throw new Error(mainError.message)

      const tableName = getStudentTableName(student.department, student.year)
      const { error: deptError } = await supabase.from(tableName).update(updateData).eq("id", student.id)
      if (deptError) throw new Error(deptError.message)

      if (!opts?.silent) {
        toast({ title: "Progress Saved", description: "Your information has been saved" })
      }
      return true
    } catch (err) {
      console.error("Error saving progress:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save progress",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const completeRegistration = async () => {
    try {
      setLoading(true)

      // Save latest form values first
      const ok = await saveProgress(sections.length, { silent: true })
      if (!ok) return

      const finalName = `${formData.first_name} ${formData.middle_name} ${formData.last_name}`.trim()

      const { error: mainCompleteErr } = await supabase
        .from("students")
        .update({ registration_completed: true, registration_step: sections.length, name: finalName })
        .eq("id", student.id)

      if (mainCompleteErr) throw new Error(mainCompleteErr.message)

      if (student?.department && student?.year) {
        const tableName = getStudentTableName(student.department, student.year)
        const { error: deptCompleteErr } = await supabase
          .from(tableName)
          .update({ registration_completed: true, registration_step: sections.length, name: finalName })
          .eq("id", student.id)
        if (deptCompleteErr) throw new Error(deptCompleteErr.message)
      }

      toast({
        title: "Registration Complete!",
        description: "Saved PRN and personal details.",
      })

      setTimeout(() => router.push("/student-dashboard"), 1200)
    } catch (err) {
      console.error("Error completing registration:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to complete registration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async () => {
    if (!validateCurrentStep()) return
    const next = Math.min(currentStep + 1, sections.length)
    const ok = await saveProgress(next, { silent: true })
    if (!ok) return

    if (currentStep < sections.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      await completeRegistration()
    }
  }

  const handlePrevious = () => {
    setCurrentStep((s) => Math.max(0, s - 1))
  }

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">University PRN</h3>
          <div className="space-y-2">
            <Label>University PRN *</Label>
            <Input value={formData.prn} onChange={(e) => handleInputChange("prn", e.target.value.toUpperCase())} />
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Personal Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>First Name *</Label>
            <Input value={formData.first_name} onChange={(e) => handleInputChange("first_name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Middle Name</Label>
            <Input value={formData.middle_name} onChange={(e) => handleInputChange("middle_name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Last Name *</Label>
            <Input value={formData.last_name} onChange={(e) => handleInputChange("last_name", e.target.value)} />
          </div>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Complete Your Registration</h1>
              <p className="text-gray-600 mt-1">Only PRN and Personal Details are required.</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Step {currentStep + 1} of {sections.length}</p>
              <p className="text-2xl font-bold text-blue-600">{Math.round(((currentStep + 1) / sections.length) * 100)}%</p>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="flex gap-2 p-4 min-w-max">
              {sections.map((section, index) => (
                <button
                  key={section}
                  onClick={() => setCurrentStep(index)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    index === currentStep
                      ? "bg-blue-600 text-white shadow-lg"
                      : index < currentStep
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {index < currentStep && <CheckCircle className="w-4 h-4 inline mr-2" />}
                  {section}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>

            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button onClick={handlePrevious} variant="outline" disabled={currentStep === 0 || loading}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    void saveProgress(undefined, { silent: false })
                  }}
                  variant="outline"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Progress
                </Button>

                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={loading}
                >
                  {loading ? (
                    "Processing..."
                  ) : currentStep === sections.length - 1 ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Registration
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
