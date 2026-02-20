"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { CheckCircle, Upload, Save, ArrowRight, ArrowLeft } from "lucide-react"

const sections = [
  "University PRN", "Personal Details", "Identity", "Religion", "Physically Handicapped", 
  "Minority Details", "Passport Details", "Contact Details", "Family Details",
  "SSC/10th Marks", "HSC/12th Marks", "Qualifying Examination", "Diploma Details",
  "Graduations Details", "Post Graduations", "GAP in Academic Year",
  "Bank Details", "Upload Documents", "Emergency Contact"
]

// Helper function to get table name based on department and year
function getStudentTableName(department: string, year: string): string {
  const deptMap: Record<string, string> = {
    'CSE': 'cse',
    'CYBER': 'cyber', 
    'AIDS': 'aids',
    'AIML': 'aiml'
  }
  
  const yearMap: Record<string, string> = {
    'first': '1st',
    'second': '2nd',
    'third': '3rd',
    'fourth': '4th'
  }
  
  const dept = deptMap[department?.toUpperCase()] || 'cse'
  const yr = yearMap[year?.toLowerCase()] || '3rd'
  
  return `students_${dept}_${yr}_year`
}

export default function CompleteRegistration() {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [student, setStudent] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    // University Details
    prn: "",
    
    // Personal Details
    first_name: "", middle_name: "", last_name: "", date_of_birth: "",
    gender: "", blood_group: "", nationality: "Indian", religion: "",
    caste: "", sub_caste: "", domicile: "", birth_place: "", birth_country: "India",
    
    // Identity
    mobile_number: "", alternate_mobile: "", aadhar_number: "", pan_number: "",
    
    // Passport
    passport_number: "", passport_issue_date: "", passport_expiry_date: "", passport_issue_place: "",
    
    // Address
    permanent_address: "", permanent_city: "", permanent_state: "", permanent_pincode: "", permanent_country: "India",
    current_address: "", current_city: "", current_state: "", current_pincode: "", current_country: "India",
    sameAsPermanent: false,
    
    // Family
    father_name: "", father_occupation: "", father_mobile: "", father_email: "", father_annual_income: "",
    mother_name: "", mother_occupation: "", mother_mobile: "", mother_email: "", mother_annual_income: "",
    guardian_name: "", guardian_relation: "", guardian_mobile: "", guardian_email: "",
    
    // Emergency
    emergency_contact_name: "", emergency_contact_relation: "", emergency_contact_mobile: "", emergency_contact_address: "",
    
    // Bank
    bank_name: "", bank_account_number: "", bank_ifsc_code: "", bank_branch: "", bank_account_holder_name: "",
    
    // Education - SSC
    ssc_board: "", ssc_school: "", ssc_passing_year: "", ssc_seat_number: "",
    ssc_total_marks: "", ssc_obtained_marks: "", ssc_percentage: "", ssc_grade: "",
    
    // Education - HSC
    hsc_board: "", hsc_school: "", hsc_passing_year: "", hsc_seat_number: "",
    hsc_total_marks: "", hsc_obtained_marks: "", hsc_percentage: "", hsc_cgpa: "", hsc_sgpa: "", hsc_grade: "",
    
    // Diploma
    diploma_university: "", diploma_college: "", diploma_passing_year: "",
    diploma_percentage: "", diploma_cgpa: "", diploma_sgpa: "",
    
    // Documents
    photo: null as File | null,
    aadhar_doc: null as File | null,
    pan_doc: null as File | null,
    ssc_certificate: null as File | null,
    hsc_certificate: null as File | null,
    
    // Other
    physically_handicapped: "No",
    minority_status: "No",
    gap_year: "No",
    gap_reason: ""
  })

  useEffect(() => {
    fetchStudentData()
  }, [])

  const fetchStudentData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // First, try to fetch from the students view to get department and year
      const { data: studentData, error } = await supabase
        .from('students')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (error) {
        console.error('Student fetch error:', error)
        toast({
          title: "Error",
          description: "Student not found. Please contact admin.",
          variant: "destructive"
        })
        return
      }

      // Allow editing even if registration is completed
      setStudent(studentData)
      
      // Load ALL existing data into form
      if (studentData) {
        setFormData(prev => ({
          ...prev,
          // University PRN
          prn: studentData.prn || "",
          
          // Personal Details
          first_name: studentData.first_name || studentData.name?.split(' ')[0] || "",
          middle_name: studentData.middle_name || "",
          last_name: studentData.last_name || studentData.name?.split(' ').slice(-1)[0] || "",
          date_of_birth: studentData.date_of_birth || "",
          gender: studentData.gender || "",
          blood_group: studentData.blood_group || "",
          nationality: studentData.nationality || "Indian",
          religion: studentData.religion || "",
          caste: studentData.caste || "",
          sub_caste: studentData.sub_caste || "",
          domicile: studentData.domicile || "",
          birth_place: studentData.birth_place || "",
          birth_country: studentData.birth_country || "India",
          
          // Identity
          mobile_number: studentData.mobile_number || "",
          alternate_mobile: studentData.alternate_mobile || "",
          aadhar_number: studentData.aadhar_number || "",
          pan_number: studentData.pan_number || "",
          
          // Passport
          passport_number: studentData.passport_number || "",
          passport_issue_date: studentData.passport_issue_date || "",
          passport_expiry_date: studentData.passport_expiry_date || "",
          passport_issue_place: studentData.passport_issue_place || "",
          
          // Address
          permanent_address: studentData.permanent_address || "",
          permanent_city: studentData.permanent_city || "",
          permanent_state: studentData.permanent_state || "",
          permanent_pincode: studentData.permanent_pincode || "",
          permanent_country: studentData.permanent_country || "India",
          current_address: studentData.current_address || "",
          current_city: studentData.current_city || "",
          current_state: studentData.current_state || "",
          current_pincode: studentData.current_pincode || "",
          current_country: studentData.current_country || "India",
          
          // Family
          father_name: studentData.father_name || "",
          father_occupation: studentData.father_occupation || "",
          father_mobile: studentData.father_mobile || "",
          father_email: studentData.father_email || "",
          father_annual_income: studentData.father_annual_income || "",
          mother_name: studentData.mother_name || "",
          mother_occupation: studentData.mother_occupation || "",
          mother_mobile: studentData.mother_mobile || "",
          mother_email: studentData.mother_email || "",
          mother_annual_income: studentData.mother_annual_income || "",
          guardian_name: studentData.guardian_name || "",
          guardian_relation: studentData.guardian_relation || "",
          guardian_mobile: studentData.guardian_mobile || "",
          guardian_email: studentData.guardian_email || "",
          
          // Emergency
          emergency_contact_name: studentData.emergency_contact_name || "",
          emergency_contact_relation: studentData.emergency_contact_relation || "",
          emergency_contact_mobile: studentData.emergency_contact_mobile || "",
          emergency_contact_address: studentData.emergency_contact_address || "",
          
          // Bank
          bank_name: studentData.bank_name || "",
          bank_account_number: studentData.bank_account_number || "",
          bank_ifsc_code: studentData.bank_ifsc_code || "",
          bank_branch: studentData.bank_branch || "",
          bank_account_holder_name: studentData.bank_account_holder_name || "",
          
          // Other
          physically_handicapped: studentData.physically_handicapped || "No",
          minority_status: studentData.minority_status || "No",
          gap_year: studentData.gap_year || "No",
          gap_reason: studentData.gap_reason || ""
        }))
        
        // If editing completed registration, start from first step
        if (studentData.registration_completed) {
          setCurrentStep(0)
        } else if (studentData.registration_step > 0) {
          setCurrentStep(studentData.registration_step)
        }
      }
    } catch (error) {
      console.error('Error fetching student:', error)
      toast({
        title: "Error",
        description: "Failed to load student data",
        variant: "destructive"
      })
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-fill current address if same as permanent
    if (field === 'sameAsPermanent' && value) {
      setFormData(prev => ({
        ...prev,
        current_address: prev.permanent_address,
        current_city: prev.permanent_city,
        current_state: prev.permanent_state,
        current_pincode: prev.permanent_pincode,
        current_country: prev.permanent_country
      }))
    }
  }

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }))
  }

  const saveProgress = async () => {
    try {
      setLoading(true)
      
      const updateData: any = {
        prn: formData.prn,
        name: `${formData.first_name} ${formData.middle_name} ${formData.last_name}`.trim(),
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth && formData.date_of_birth.trim() !== "" ? formData.date_of_birth : null,
        gender: formData.gender,
        blood_group: formData.blood_group,
        nationality: formData.nationality,
        religion: formData.religion,
        caste: formData.caste,
        sub_caste: formData.sub_caste,
        domicile: formData.domicile,
        birth_place: formData.birth_place,
        birth_country: formData.birth_country,
        mobile_number: formData.mobile_number,
        alternate_mobile: formData.alternate_mobile,
        aadhar_number: formData.aadhar_number,
        pan_number: formData.pan_number,
        passport_number: formData.passport_number,
        passport_issue_date: formData.passport_issue_date && formData.passport_issue_date.trim() !== "" ? formData.passport_issue_date : null,
        passport_expiry_date: formData.passport_expiry_date && formData.passport_expiry_date.trim() !== "" ? formData.passport_expiry_date : null,
        passport_issue_place: formData.passport_issue_place,
        permanent_address: formData.permanent_address,
        permanent_city: formData.permanent_city,
        permanent_state: formData.permanent_state,
        permanent_pincode: formData.permanent_pincode,
        permanent_country: formData.permanent_country,
        current_address: formData.current_address,
        current_city: formData.current_city,
        current_state: formData.current_state,
        current_pincode: formData.current_pincode,
        current_country: formData.current_country,
        father_name: formData.father_name,
        father_occupation: formData.father_occupation,
        father_mobile: formData.father_mobile,
        father_email: formData.father_email,
        father_annual_income: formData.father_annual_income ? parseFloat(formData.father_annual_income) : null,
        mother_name: formData.mother_name,
        mother_occupation: formData.mother_occupation,
        mother_mobile: formData.mother_mobile,
        mother_email: formData.mother_email,
        mother_annual_income: formData.mother_annual_income ? parseFloat(formData.mother_annual_income) : null,
        guardian_name: formData.guardian_name,
        guardian_relation: formData.guardian_relation,
        guardian_mobile: formData.guardian_mobile,
        guardian_email: formData.guardian_email,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_relation: formData.emergency_contact_relation,
        emergency_contact_mobile: formData.emergency_contact_mobile,
        emergency_contact_address: formData.emergency_contact_address,
        bank_name: formData.bank_name,
        bank_account_number: formData.bank_account_number,
        bank_ifsc_code: formData.bank_ifsc_code,
        bank_branch: formData.bank_branch,
        bank_account_holder_name: formData.bank_account_holder_name,
        registration_step: currentStep
      }

      console.log('📝 Student data:', { id: student.id, department: student.department, year: student.year })
      
      // Update main students table first
      const { error: mainError } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', student.id)

      if (mainError) {
        console.error('Main table update error:', mainError)
        throw new Error(`Failed to update main table: ${mainError.message}`)
      }

      // Try to update department-specific table if student has department and year
      if (student.department && student.year) {
        try {
          const tableName = getStudentTableName(student.department, student.year)
          console.log(`📝 Updating department table: ${tableName}`)
          
          const { error: deptError } = await supabase
            .from(tableName)
            .update(updateData)
            .eq('id', student.id)

          if (deptError) {
            console.warn('Department table update warning:', deptError)
            // Don't fail the whole save if department table update fails
          }
        } catch (deptErr) {
          console.warn('Department table update failed:', deptErr)
          // Continue even if department table fails
        }
      }

      toast({
        title: "Progress Saved",
        description: "Your information has been saved",
      })
    } catch (error) {
      console.error('Error saving progress:', error)
      toast({
        title: "Error",
        description: "Failed to save progress",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const saveEducationDetails = async () => {
    try {
      // Save SSC details
      if (formData.ssc_board) {
        await supabase.from('student_education_details').insert({
          student_id: student.id,
          education_level: 'SSC',
          board_university: formData.ssc_board,
          school_college_name: formData.ssc_school,
          passing_year: parseInt(formData.ssc_passing_year),
          seat_number: formData.ssc_seat_number,
          total_marks: parseInt(formData.ssc_total_marks),
          marks_obtained: parseInt(formData.ssc_obtained_marks),
          percentage: parseFloat(formData.ssc_percentage),
          grade: formData.ssc_grade
        })
      }

      // Save HSC details
      if (formData.hsc_board) {
        await supabase.from('student_education_details').insert({
          student_id: student.id,
          education_level: 'HSC',
          board_university: formData.hsc_board,
          school_college_name: formData.hsc_school,
          passing_year: parseInt(formData.hsc_passing_year),
          seat_number: formData.hsc_seat_number,
          total_marks: parseInt(formData.hsc_total_marks),
          marks_obtained: parseInt(formData.hsc_obtained_marks),
          percentage: parseFloat(formData.hsc_percentage),
          cgpa: formData.hsc_cgpa ? parseFloat(formData.hsc_cgpa) : null,
          sgpa: formData.hsc_sgpa ? parseFloat(formData.hsc_sgpa) : null,
          grade: formData.hsc_grade
        })
      }

      // Save Diploma details
      if (formData.diploma_university) {
        await supabase.from('student_education_details').insert({
          student_id: student.id,
          education_level: 'Diploma',
          board_university: formData.diploma_university,
          school_college_name: formData.diploma_college,
          passing_year: parseInt(formData.diploma_passing_year),
          percentage: parseFloat(formData.diploma_percentage),
          cgpa: formData.diploma_cgpa ? parseFloat(formData.diploma_cgpa) : null,
          sgpa: formData.diploma_sgpa ? parseFloat(formData.diploma_sgpa) : null
        })
      }
    } catch (error) {
      console.error('Error saving education details:', error)
    }
  }

  const uploadDocuments = async () => {
    try {
      const documentsToUpload = [
        { file: formData.photo, type: 'Photo' },
        { file: formData.aadhar_doc, type: 'Aadhar Card' },
        { file: formData.pan_doc, type: 'PAN Card' },
        { file: formData.ssc_certificate, type: '10th Certificate' },
        { file: formData.hsc_certificate, type: '12th Certificate' }
      ]

      for (const doc of documentsToUpload) {
        if (doc.file) {
          const fileExt = doc.file.name.split('.').pop()
          const fileName = `${student.id}/${doc.type.replace(/\s/g, '_')}.${fileExt}`
          
          const { data, error: uploadError } = await supabase.storage
            .from('student-documents')
            .upload(fileName, doc.file, { upsert: true })

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('student-documents')
            .getPublicUrl(fileName)

          await supabase.from('student_documents').insert({
            student_id: student.id,
            document_type: doc.type,
            document_url: publicUrl
          })
        }
      }
    } catch (error) {
      console.error('Error uploading documents:', error)
      throw error
    }
  }

  const completeRegistration = async () => {
    try {
      setLoading(true)

      // Save all data
      await saveProgress()
      await saveEducationDetails()
      
      // Try to upload documents if available
      try {
        if (formData.photo || formData.aadhar_doc || formData.ssc_certificate || formData.hsc_certificate) {
          await uploadDocuments()
        }
      } catch (uploadError) {
        console.warn('Document upload failed, continuing registration:', uploadError)
      }

      // Mark registration as complete
      const { error } = await supabase
        .from('students')
        .update({
          registration_completed: true,
          registration_step: sections.length,
          name: `${formData.first_name} ${formData.middle_name} ${formData.last_name}`.trim()
        })
        .eq('id', student.id)

      if (error) throw error

      toast({
        title: "Registration Complete!",
        description: "Your profile has been successfully created. All dashboard features are now unlocked!",
      })

      // Update local storage
      const currentUser = localStorage.getItem("currentUser")
      if (currentUser) {
        const user = JSON.parse(currentUser)
        user.registration_completed = true
        localStorage.setItem("currentUser", JSON.stringify(user))
      }

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/student-dashboard')
      }, 2000)
    } catch (error) {
      console.error('Error completing registration:', error)
      toast({
        title: "Error",
        description: "Failed to complete registration",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0: // University PRN
        if (!formData.prn.trim()) {
          toast({ title: "Missing Information", description: "Please enter your University PRN.", variant: "destructive" })
          return false
        }
        if (formData.prn.length < 8) {
          toast({ title: "Invalid PRN", description: "PRN must be at least 8 characters.", variant: "destructive" })
          return false
        }
        break
      
      case 1: // Personal Details
        if (!formData.first_name.trim()) {
          toast({ title: "Missing Information", description: "Please enter your first name.", variant: "destructive" })
          return false
        }
        if (!formData.last_name.trim()) {
          toast({ title: "Missing Information", description: "Please enter your last name.", variant: "destructive" })
          return false
        }
        if (!formData.date_of_birth) {
          toast({ title: "Missing Information", description: "Please select your date of birth.", variant: "destructive" })
          return false
        }
        if (!formData.gender) {
          toast({ title: "Missing Information", description: "Please select your gender.", variant: "destructive" })
          return false
        }
        if (!formData.nationality.trim()) {
          toast({ title: "Missing Information", description: "Please enter your nationality.", variant: "destructive" })
          return false
        }
        break
      
      case 1: // Identity
        if (!formData.mobile_number.trim() || formData.mobile_number.length !== 10) {
          toast({ title: "Missing Information", description: "Please enter a valid 10-digit mobile number.", variant: "destructive" })
          return false
        }
        if (!formData.aadhar_number.trim() || formData.aadhar_number.length !== 12) {
          toast({ title: "Missing Information", description: "Please enter a valid 12-digit Aadhar number.", variant: "destructive" })
          return false
        }
        break
      
      case 6: // Contact Details
        if (!formData.permanent_address.trim()) {
          toast({ title: "Missing Information", description: "Please enter your permanent address.", variant: "destructive" })
          return false
        }
        if (!formData.permanent_city.trim()) {
          toast({ title: "Missing Information", description: "Please enter your permanent city.", variant: "destructive" })
          return false
        }
        if (!formData.permanent_state.trim()) {
          toast({ title: "Missing Information", description: "Please enter your permanent state.", variant: "destructive" })
          return false
        }
        if (!formData.permanent_pincode.trim() || formData.permanent_pincode.length !== 6) {
          toast({ title: "Missing Information", description: "Please enter a valid 6-digit pincode.", variant: "destructive" })
          return false
        }
        if (!formData.current_address.trim()) {
          toast({ title: "Missing Information", description: "Please enter your current address.", variant: "destructive" })
          return false
        }
        if (!formData.current_city.trim()) {
          toast({ title: "Missing Information", description: "Please enter your current city.", variant: "destructive" })
          return false
        }
        if (!formData.current_state.trim()) {
          toast({ title: "Missing Information", description: "Please enter your current state.", variant: "destructive" })
          return false
        }
        if (!formData.current_pincode.trim() || formData.current_pincode.length !== 6) {
          toast({ title: "Missing Information", description: "Please enter a valid 6-digit pincode for current address.", variant: "destructive" })
          return false
        }
        break
      
      case 7: // Family Details
        if (!formData.father_name.trim()) {
          toast({ title: "Missing Information", description: "Please enter your father's name.", variant: "destructive" })
          return false
        }
        break
      
      case 17: // Emergency Contact
        if (!formData.emergency_contact_name.trim()) {
          toast({ title: "Missing Information", description: "Please enter emergency contact name.", variant: "destructive" })
          return false
        }
        if (!formData.emergency_contact_relation.trim()) {
          toast({ title: "Missing Information", description: "Please enter emergency contact relation.", variant: "destructive" })
          return false
        }
        if (!formData.emergency_contact_mobile.trim() || formData.emergency_contact_mobile.length !== 10) {
          toast({ title: "Missing Information", description: "Please enter a valid 10-digit emergency contact mobile.", variant: "destructive" })
          return false
        }
        if (!formData.emergency_contact_address.trim()) {
          toast({ title: "Missing Information", description: "Please enter emergency contact address.", variant: "destructive" })
          return false
        }
        break
    }
    return true
  }

  const handleNext = async () => {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      return
    }
    
    await saveProgress()
    if (currentStep < sections.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      await completeRegistration()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // University PRN
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">University PRN (Permanent Registration Number)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>University PRN *</Label>
                <Input
                  value={formData.prn}
                  onChange={(e) => handleInputChange('prn', e.target.value.toUpperCase())}
                  placeholder="Enter your University PRN"
                  required
                />
                <p className="text-sm text-gray-600">
                  Enter your official University Permanent Registration Number (PRN)
                </p>
              </div>
            </div>
          </div>
        )

      case 1: // Personal Details
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Middle Name</Label>
              <Input
                value={formData.middle_name}
                onChange={(e) => handleInputChange('middle_name', e.target.value)}
                placeholder="Enter middle name"
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth *</Label>
              <Input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Gender *</Label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Blood Group</Label>
              <select
                value={formData.blood_group}
                onChange={(e) => handleInputChange('blood_group', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Nationality *</Label>
              <Input
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                placeholder="Enter nationality"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Birth Place</Label>
              <Input
                value={formData.birth_place}
                onChange={(e) => handleInputChange('birth_place', e.target.value)}
                placeholder="Enter birth place"
              />
            </div>
            <div className="space-y-2">
              <Label>Birth Country</Label>
              <Input
                value={formData.birth_country}
                onChange={(e) => handleInputChange('birth_country', e.target.value)}
                placeholder="Enter birth country"
              />
            </div>
          </div>
        )

      case 1: // Identity
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mobile Number *</Label>
              <Input
                value={formData.mobile_number}
                onChange={(e) => handleInputChange('mobile_number', e.target.value)}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Alternate Mobile</Label>
              <Input
                value={formData.alternate_mobile}
                onChange={(e) => handleInputChange('alternate_mobile', e.target.value)}
                placeholder="Enter alternate mobile"
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label>Aadhar Number *</Label>
              <Input
                value={formData.aadhar_number}
                onChange={(e) => handleInputChange('aadhar_number', e.target.value)}
                placeholder="Enter 12-digit Aadhar number"
                maxLength={12}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>PAN Number</Label>
              <Input
                value={formData.pan_number}
                onChange={(e) => handleInputChange('pan_number', e.target.value.toUpperCase())}
                placeholder="Enter PAN number"
                maxLength={10}
              />
            </div>
          </div>
        )

      case 2: // Religion
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Religion</Label>
              <Input
                value={formData.religion}
                onChange={(e) => handleInputChange('religion', e.target.value)}
                placeholder="Enter religion"
              />
            </div>
            <div className="space-y-2">
              <Label>Caste</Label>
              <select
                value={formData.caste}
                onChange={(e) => handleInputChange('caste', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Caste</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="NT">NT</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Sub Caste</Label>
              <Input
                value={formData.sub_caste}
                onChange={(e) => handleInputChange('sub_caste', e.target.value)}
                placeholder="Enter sub caste"
              />
            </div>
            <div className="space-y-2">
              <Label>Domicile</Label>
              <Input
                value={formData.domicile}
                onChange={(e) => handleInputChange('domicile', e.target.value)}
                placeholder="Enter domicile state"
              />
            </div>
          </div>
        )

      case 3: // Physically Handicapped
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Are you physically handicapped?</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="physically_handicapped"
                    value="No"
                    checked={formData.physically_handicapped === "No"}
                    onChange={(e) => handleInputChange('physically_handicapped', e.target.value)}
                  />
                  <span>No</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="physically_handicapped"
                    value="Yes"
                    checked={formData.physically_handicapped === "Yes"}
                    onChange={(e) => handleInputChange('physically_handicapped', e.target.value)}
                  />
                  <span>Yes</span>
                </label>
              </div>
            </div>
          </div>
        )

      case 4: // Minority Details
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Do you belong to minority category?</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="minority_status"
                    value="No"
                    checked={formData.minority_status === "No"}
                    onChange={(e) => handleInputChange('minority_status', e.target.value)}
                  />
                  <span>No</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="minority_status"
                    value="Yes"
                    checked={formData.minority_status === "Yes"}
                    onChange={(e) => handleInputChange('minority_status', e.target.value)}
                  />
                  <span>Yes</span>
                </label>
              </div>
            </div>
          </div>
        )

      case 5: // Passport Details
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Passport Number</Label>
              <Input
                value={formData.passport_number}
                onChange={(e) => handleInputChange('passport_number', e.target.value.toUpperCase())}
                placeholder="Enter passport number"
              />
            </div>
            <div className="space-y-2">
              <Label>Issue Date</Label>
              <Input
                type="date"
                value={formData.passport_issue_date}
                onChange={(e) => handleInputChange('passport_issue_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={formData.passport_expiry_date}
                onChange={(e) => handleInputChange('passport_expiry_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Issue Place</Label>
              <Input
                value={formData.passport_issue_place}
                onChange={(e) => handleInputChange('passport_issue_place', e.target.value)}
                placeholder="Enter issue place"
              />
            </div>
          </div>
        )

      case 6: // Contact Details
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Permanent Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Address *</Label>
                  <Textarea
                    value={formData.permanent_address}
                    onChange={(e) => handleInputChange('permanent_address', e.target.value)}
                    placeholder="Enter permanent address"
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input
                    value={formData.permanent_city}
                    onChange={(e) => handleInputChange('permanent_city', e.target.value)}
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Input
                    value={formData.permanent_state}
                    onChange={(e) => handleInputChange('permanent_state', e.target.value)}
                    placeholder="Enter state"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pincode *</Label>
                  <Input
                    value={formData.permanent_pincode}
                    onChange={(e) => handleInputChange('permanent_pincode', e.target.value)}
                    placeholder="Enter pincode"
                    maxLength={6}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Input
                    value={formData.permanent_country}
                    onChange={(e) => handleInputChange('permanent_country', e.target.value)}
                    placeholder="Enter country"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="sameAsPermanent"
                  checked={formData.sameAsPermanent}
                  onChange={(e) => handleInputChange('sameAsPermanent', e.target.checked)}
                />
                <Label htmlFor="sameAsPermanent">Current address same as permanent</Label>
              </div>

              <h3 className="text-lg font-semibold mb-4">Current Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Address *</Label>
                  <Textarea
                    value={formData.current_address}
                    onChange={(e) => handleInputChange('current_address', e.target.value)}
                    placeholder="Enter current address"
                    rows={3}
                    disabled={formData.sameAsPermanent}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input
                    value={formData.current_city}
                    onChange={(e) => handleInputChange('current_city', e.target.value)}
                    placeholder="Enter city"
                    disabled={formData.sameAsPermanent}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Input
                    value={formData.current_state}
                    onChange={(e) => handleInputChange('current_state', e.target.value)}
                    placeholder="Enter state"
                    disabled={formData.sameAsPermanent}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pincode *</Label>
                  <Input
                    value={formData.current_pincode}
                    onChange={(e) => handleInputChange('current_pincode', e.target.value)}
                    placeholder="Enter pincode"
                    maxLength={6}
                    disabled={formData.sameAsPermanent}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Input
                    value={formData.current_country}
                    onChange={(e) => handleInputChange('current_country', e.target.value)}
                    placeholder="Enter country"
                    disabled={formData.sameAsPermanent}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 7: // Family Details
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Father's Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Father's Name *</Label>
                  <Input
                    value={formData.father_name}
                    onChange={(e) => handleInputChange('father_name', e.target.value)}
                    placeholder="Enter father's name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Occupation</Label>
                  <Input
                    value={formData.father_occupation}
                    onChange={(e) => handleInputChange('father_occupation', e.target.value)}
                    placeholder="Enter occupation"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input
                    value={formData.father_mobile}
                    onChange={(e) => handleInputChange('father_mobile', e.target.value)}
                    placeholder="Enter mobile number"
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.father_email}
                    onChange={(e) => handleInputChange('father_email', e.target.value)}
                    placeholder="Enter email"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Annual Income</Label>
                  <Input
                    type="number"
                    value={formData.father_annual_income}
                    onChange={(e) => handleInputChange('father_annual_income', e.target.value)}
                    placeholder="Enter annual income"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Mother's Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mother's Name *</Label>
                  <Input
                    value={formData.mother_name}
                    onChange={(e) => handleInputChange('mother_name', e.target.value)}
                    placeholder="Enter mother's name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Occupation</Label>
                  <Input
                    value={formData.mother_occupation}
                    onChange={(e) => handleInputChange('mother_occupation', e.target.value)}
                    placeholder="Enter occupation"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input
                    value={formData.mother_mobile}
                    onChange={(e) => handleInputChange('mother_mobile', e.target.value)}
                    placeholder="Enter mobile number"
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.mother_email}
                    onChange={(e) => handleInputChange('mother_email', e.target.value)}
                    placeholder="Enter email"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Annual Income</Label>
                  <Input
                    type="number"
                    value={formData.mother_annual_income}
                    onChange={(e) => handleInputChange('mother_annual_income', e.target.value)}
                    placeholder="Enter annual income"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Guardian Details (if applicable)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Guardian Name</Label>
                  <Input
                    value={formData.guardian_name}
                    onChange={(e) => handleInputChange('guardian_name', e.target.value)}
                    placeholder="Enter guardian name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Relation</Label>
                  <Input
                    value={formData.guardian_relation}
                    onChange={(e) => handleInputChange('guardian_relation', e.target.value)}
                    placeholder="Enter relation"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input
                    value={formData.guardian_mobile}
                    onChange={(e) => handleInputChange('guardian_mobile', e.target.value)}
                    placeholder="Enter mobile number"
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.guardian_email}
                    onChange={(e) => handleInputChange('guardian_email', e.target.value)}
                    placeholder="Enter email"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 8: // SSC/10th Marks
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">SSC / 10th Standard Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Board/University *</Label>
                <Input
                  value={formData.ssc_board}
                  onChange={(e) => handleInputChange('ssc_board', e.target.value)}
                  placeholder="e.g., Maharashtra State Board"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>School Name *</Label>
                <Input
                  value={formData.ssc_school}
                  onChange={(e) => handleInputChange('ssc_school', e.target.value)}
                  placeholder="Enter school name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Passing Year *</Label>
                <Input
                  type="number"
                  value={formData.ssc_passing_year}
                  onChange={(e) => handleInputChange('ssc_passing_year', e.target.value)}
                  placeholder="e.g., 2020"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Seat Number</Label>
                <Input
                  value={formData.ssc_seat_number}
                  onChange={(e) => handleInputChange('ssc_seat_number', e.target.value)}
                  placeholder="Enter seat number"
                />
              </div>
              <div className="space-y-2">
                <Label>Total Marks *</Label>
                <Input
                  type="number"
                  value={formData.ssc_total_marks}
                  onChange={(e) => handleInputChange('ssc_total_marks', e.target.value)}
                  placeholder="e.g., 500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Marks Obtained *</Label>
                <Input
                  type="number"
                  value={formData.ssc_obtained_marks}
                  onChange={(e) => handleInputChange('ssc_obtained_marks', e.target.value)}
                  placeholder="e.g., 450"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Percentage *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.ssc_percentage}
                  onChange={(e) => handleInputChange('ssc_percentage', e.target.value)}
                  placeholder="e.g., 90.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Grade</Label>
                <Input
                  value={formData.ssc_grade}
                  onChange={(e) => handleInputChange('ssc_grade', e.target.value)}
                  placeholder="e.g., A+"
                />
              </div>
            </div>
          </div>
        )

      case 9: // HSC/12th Marks
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">HSC / 12th Standard Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Board/University *</Label>
                <Input
                  value={formData.hsc_board}
                  onChange={(e) => handleInputChange('hsc_board', e.target.value)}
                  placeholder="e.g., Maharashtra State Board"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>School Name *</Label>
                <Input
                  value={formData.hsc_school}
                  onChange={(e) => handleInputChange('hsc_school', e.target.value)}
                  placeholder="Enter school name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Passing Year *</Label>
                <Input
                  type="number"
                  value={formData.hsc_passing_year}
                  onChange={(e) => handleInputChange('hsc_passing_year', e.target.value)}
                  placeholder="e.g., 2022"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Seat Number</Label>
                <Input
                  value={formData.hsc_seat_number}
                  onChange={(e) => handleInputChange('hsc_seat_number', e.target.value)}
                  placeholder="Enter seat number"
                />
              </div>
              <div className="space-y-2">
                <Label>Total Marks *</Label>
                <Input
                  type="number"
                  value={formData.hsc_total_marks}
                  onChange={(e) => handleInputChange('hsc_total_marks', e.target.value)}
                  placeholder="e.g., 500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Marks Obtained *</Label>
                <Input
                  type="number"
                  value={formData.hsc_obtained_marks}
                  onChange={(e) => handleInputChange('hsc_obtained_marks', e.target.value)}
                  placeholder="e.g., 450"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Percentage *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.hsc_percentage}
                  onChange={(e) => handleInputChange('hsc_percentage', e.target.value)}
                  placeholder="e.g., 90.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>CGPA</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.hsc_cgpa}
                  onChange={(e) => handleInputChange('hsc_cgpa', e.target.value)}
                  placeholder="e.g., 9.5"
                />
              </div>
              <div className="space-y-2">
                <Label>SGPA</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.hsc_sgpa}
                  onChange={(e) => handleInputChange('hsc_sgpa', e.target.value)}
                  placeholder="e.g., 9.5"
                />
              </div>
              <div className="space-y-2">
                <Label>Grade</Label>
                <Input
                  value={formData.hsc_grade}
                  onChange={(e) => handleInputChange('hsc_grade', e.target.value)}
                  placeholder="e.g., A+"
                />
              </div>
            </div>
          </div>
        )

      case 10: // Qualifying Examination
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Qualifying Examination Details</h3>
            <p className="text-sm text-gray-600">If you have any other qualifying examination (JEE, MHT-CET, etc.), please provide details</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Examination Name</Label>
                <Input placeholder="e.g., JEE Main, MHT-CET" />
              </div>
              <div className="space-y-2">
                <Label>Roll Number</Label>
                <Input placeholder="Enter roll number" />
              </div>
              <div className="space-y-2">
                <Label>Score/Percentile</Label>
                <Input placeholder="Enter score" />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input type="number" placeholder="e.g., 2023" />
              </div>
            </div>
          </div>
        )

      case 11: // Diploma Details
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Diploma Details (if applicable)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>University/Board</Label>
                <Input
                  value={formData.diploma_university}
                  onChange={(e) => handleInputChange('diploma_university', e.target.value)}
                  placeholder="Enter university name"
                />
              </div>
              <div className="space-y-2">
                <Label>College Name</Label>
                <Input
                  value={formData.diploma_college}
                  onChange={(e) => handleInputChange('diploma_college', e.target.value)}
                  placeholder="Enter college name"
                />
              </div>
              <div className="space-y-2">
                <Label>Passing Year</Label>
                <Input
                  type="number"
                  value={formData.diploma_passing_year}
                  onChange={(e) => handleInputChange('diploma_passing_year', e.target.value)}
                  placeholder="e.g., 2023"
                />
              </div>
              <div className="space-y-2">
                <Label>Percentage</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.diploma_percentage}
                  onChange={(e) => handleInputChange('diploma_percentage', e.target.value)}
                  placeholder="e.g., 85.50"
                />
              </div>
              <div className="space-y-2">
                <Label>CGPA</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.diploma_cgpa}
                  onChange={(e) => handleInputChange('diploma_cgpa', e.target.value)}
                  placeholder="e.g., 8.5"
                />
              </div>
              <div className="space-y-2">
                <Label>SGPA</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.diploma_sgpa}
                  onChange={(e) => handleInputChange('diploma_sgpa', e.target.value)}
                  placeholder="e.g., 8.5"
                />
              </div>
            </div>
          </div>
        )

      case 12: // Graduations Details
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Graduation Details (if applicable)</h3>
            <p className="text-sm text-gray-600">For students with prior graduation degree</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>University</Label>
                <Input placeholder="Enter university name" />
              </div>
              <div className="space-y-2">
                <Label>College Name</Label>
                <Input placeholder="Enter college name" />
              </div>
              <div className="space-y-2">
                <Label>Degree</Label>
                <Input placeholder="e.g., B.E., B.Tech" />
              </div>
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Input placeholder="e.g., Computer Science" />
              </div>
              <div className="space-y-2">
                <Label>Passing Year</Label>
                <Input type="number" placeholder="e.g., 2023" />
              </div>
              <div className="space-y-2">
                <Label>CGPA</Label>
                <Input type="number" step="0.01" placeholder="e.g., 8.5" />
              </div>
            </div>
          </div>
        )

      case 13: // Post Graduations
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Post Graduation Details (if applicable)</h3>
            <p className="text-sm text-gray-600">For students with prior post-graduation degree</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>University</Label>
                <Input placeholder="Enter university name" />
              </div>
              <div className="space-y-2">
                <Label>College Name</Label>
                <Input placeholder="Enter college name" />
              </div>
              <div className="space-y-2">
                <Label>Degree</Label>
                <Input placeholder="e.g., M.E., M.Tech, MBA" />
              </div>
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Input placeholder="e.g., Computer Science" />
              </div>
              <div className="space-y-2">
                <Label>Passing Year</Label>
                <Input type="number" placeholder="e.g., 2023" />
              </div>
              <div className="space-y-2">
                <Label>CGPA</Label>
                <Input type="number" step="0.01" placeholder="e.g., 8.5" />
              </div>
            </div>
          </div>
        )

      case 14: // GAP in Academic Year
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">GAP in Academic Year</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Do you have any gap in your academic career?</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="gap_year"
                      value="No"
                      checked={formData.gap_year === "No"}
                      onChange={(e) => handleInputChange('gap_year', e.target.value)}
                    />
                    <span>No</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="gap_year"
                      value="Yes"
                      checked={formData.gap_year === "Yes"}
                      onChange={(e) => handleInputChange('gap_year', e.target.value)}
                    />
                    <span>Yes</span>
                  </label>
                </div>
              </div>

              {formData.gap_year === "Yes" && (
                <div className="space-y-2">
                  <Label>Please specify the reason for gap</Label>
                  <Textarea
                    value={formData.gap_reason}
                    onChange={(e) => handleInputChange('gap_reason', e.target.value)}
                    placeholder="Enter reason for gap year(s)"
                    rows={4}
                  />
                </div>
              )}
            </div>
          </div>
        )

      case 15: // Bank Details
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bank Account Details</h3>
            <p className="text-sm text-gray-600">For scholarship and refund purposes</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bank Name *</Label>
                <Input
                  value={formData.bank_name}
                  onChange={(e) => handleInputChange('bank_name', e.target.value)}
                  placeholder="Enter bank name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Account Number *</Label>
                <Input
                  value={formData.bank_account_number}
                  onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
                  placeholder="Enter account number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>IFSC Code *</Label>
                <Input
                  value={formData.bank_ifsc_code}
                  onChange={(e) => handleInputChange('bank_ifsc_code', e.target.value.toUpperCase())}
                  placeholder="Enter IFSC code"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Branch Name *</Label>
                <Input
                  value={formData.bank_branch}
                  onChange={(e) => handleInputChange('bank_branch', e.target.value)}
                  placeholder="Enter branch name"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Account Holder Name *</Label>
                <Input
                  value={formData.bank_account_holder_name}
                  onChange={(e) => handleInputChange('bank_account_holder_name', e.target.value)}
                  placeholder="Enter account holder name"
                  required
                />
              </div>
            </div>
          </div>
        )

      case 16: // Upload Documents
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Upload Documents</h3>
            <p className="text-sm text-gray-600">Please upload clear scanned copies (PDF/JPG/PNG, max 5MB each)</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Passport Size Photo *</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('photo', e.target.files?.[0] || null)}
                  required
                />
                {formData.photo && (
                  <p className="text-sm text-green-600">✓ {formData.photo.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Aadhar Card *</Label>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange('aadhar_doc', e.target.files?.[0] || null)}
                  required
                />
                {formData.aadhar_doc && (
                  <p className="text-sm text-green-600">✓ {formData.aadhar_doc.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>PAN Card</Label>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange('pan_doc', e.target.files?.[0] || null)}
                />
                {formData.pan_doc && (
                  <p className="text-sm text-green-600">✓ {formData.pan_doc.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>10th Certificate *</Label>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange('ssc_certificate', e.target.files?.[0] || null)}
                  required
                />
                {formData.ssc_certificate && (
                  <p className="text-sm text-green-600">✓ {formData.ssc_certificate.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>12th Certificate *</Label>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange('hsc_certificate', e.target.files?.[0] || null)}
                  required
                />
                {formData.hsc_certificate && (
                  <p className="text-sm text-green-600">✓ {formData.hsc_certificate.name}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 17: // Emergency Contact
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Emergency Contact Details</h3>
            <p className="text-sm text-gray-600">Person to contact in case of emergency</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Person Name *</Label>
                <Input
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                  placeholder="Enter name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Relation *</Label>
                <Input
                  value={formData.emergency_contact_relation}
                  onChange={(e) => handleInputChange('emergency_contact_relation', e.target.value)}
                  placeholder="e.g., Father, Mother, Guardian"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Mobile Number *</Label>
                <Input
                  value={formData.emergency_contact_mobile}
                  onChange={(e) => handleInputChange('emergency_contact_mobile', e.target.value)}
                  placeholder="Enter mobile number"
                  maxLength={10}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address *</Label>
                <Textarea
                  value={formData.emergency_contact_address}
                  onChange={(e) => handleInputChange('emergency_contact_address', e.target.value)}
                  placeholder="Enter complete address"
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Complete Your Registration</h1>
              <p className="text-gray-600 mt-1">Please fill in all the required information</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Step {currentStep + 1} of {sections.length}</p>
              <p className="text-2xl font-bold text-blue-600">{Math.round(((currentStep + 1) / sections.length) * 100)}%</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Horizontal Scrollable Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="flex gap-2 p-4 min-w-max">
              {sections.map((section, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    index === currentStep
                      ? 'bg-blue-600 text-white shadow-lg'
                      : index < currentStep
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {index < currentStep && <CheckCircle className="w-4 h-4 inline mr-2" />}
                  {section}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
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

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                onClick={handlePrevious}
                variant="outline"
                disabled={currentStep === 0 || loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-3">
                <Button
                  onClick={saveProgress}
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

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Need help? Contact support at support@sanjivani.edu.in</p>
        </div>
      </div>
    </div>
  )
}
