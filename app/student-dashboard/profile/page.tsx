"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, GraduationCap, Building, Calendar, CreditCard, AlertCircle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function StudentProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<any>(null)

  useEffect(() => {
    loadStudentProfile()
    setupRealtimeSubscription()
  }, [])

  const setupRealtimeSubscription = () => {
    try {
      const studentSession = localStorage.getItem("studentSession")
      const currentUser = localStorage.getItem("currentUser")
      
      let user = null
      if (studentSession) {
        user = JSON.parse(studentSession)
      } else if (currentUser) {
        user = JSON.parse(currentUser)
      }

      if (!user || !user.id) return

      // Subscribe to profile_updates table for real-time changes
      const subscription = supabase
        .channel('student_profile_updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'profile_updates',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Student profile update received:', payload)
            // Reload profile from database
            loadStudentProfile()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error("Error setting up profile subscription:", error)
    }
  }

  const loadStudentProfile = async () => {
    try {
      const studentSession = localStorage.getItem("studentSession")
      const currentUser = localStorage.getItem("currentUser")
      
      let user = null
      if (studentSession) {
        user = JSON.parse(studentSession)
      } else if (currentUser) {
        user = JSON.parse(currentUser)
      }

      if (!user) {
        router.push('/login')
        return
      }

      // Fetch complete student data from Supabase
      const { data: studentData, error } = await supabase
        .from('students')
        .select('*')
        .eq('email', user.email)
        .single()

      if (error) {
        console.error('Error fetching student:', error)
        return
      }

      setStudent(studentData)
      
      // Update localStorage with latest data
      const updatedUser = { ...user, ...studentData }
      if (studentSession) {
        localStorage.setItem("studentSession", JSON.stringify(updatedUser))
      } else {
        localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">Unable to load your profile. Please try logging in again.</p>
            <Button onClick={() => router.push('/login')}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!student.registration_completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Complete Your Registration</h2>
            <p className="text-gray-600 mb-4">Please complete your registration to view your full profile.</p>
            <Button onClick={() => router.push('/student-dashboard/complete-registration')}>
              Complete Registration
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push('/student-dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">My Profile</h1>
          </div>
          <Button onClick={() => router.push('/student-dashboard/complete-registration')} variant="outline">
            Edit Profile
          </Button>
        </div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-6 border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden shadow-lg">
                    {student.photo ? (
                      <img src={student.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-16 w-16 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {student.name || `${student.first_name} ${student.middle_name || ''} ${student.last_name}`.trim()}
                  </h2>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 text-gray-600 mb-4">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <GraduationCap className="h-5 w-5" />
                      <span className="font-semibold">PRN: {student.prn || 'Not Set'}</span>
                    </div>
                    <span className="hidden md:inline">•</span>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <Building className="h-5 w-5" />
                      <span>{student.department}</span>
                    </div>
                    <span className="hidden md:inline">•</span>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>{student.year}</span>
                      {student.division && ` - Division ${student.division}`}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      ✓ Registration Complete
                    </span>
                    {student.roll_number && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        Roll No: {student.roll_number}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <InfoRow label="Full Name" value={`${student.first_name} ${student.middle_name || ''} ${student.last_name}`.trim()} />
                <InfoRow label="Date of Birth" value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'} />
                <InfoRow label="Gender" value={student.gender} />
                <InfoRow label="Blood Group" value={student.blood_group} />
                <InfoRow label="Nationality" value={student.nationality} />
                <InfoRow label="Religion" value={student.religion} />
                <InfoRow label="Caste" value={student.caste} />
                {student.sub_caste && <InfoRow label="Sub Caste" value={student.sub_caste} />}
                <InfoRow label="Domicile" value={student.domicile} />
                <InfoRow label="Birth Place" value={student.birth_place} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <InfoRow label="Email" value={student.email} icon={<Mail className="h-4 w-4" />} />
                <InfoRow label="Mobile Number" value={student.mobile_number} icon={<Phone className="h-4 w-4" />} />
                {student.alternate_mobile && <InfoRow label="Alternate Mobile" value={student.alternate_mobile} />}
                <Separator />
                <InfoRow label="Aadhar Number" value={student.aadhar_number} />
                {student.pan_number && <InfoRow label="PAN Number" value={student.pan_number} />}
                {student.passport_number && (
                  <>
                    <Separator />
                    <InfoRow label="Passport Number" value={student.passport_number} />
                    <InfoRow label="Passport Issue Date" value={student.passport_issue_date ? new Date(student.passport_issue_date).toLocaleDateString() : 'N/A'} />
                    <InfoRow label="Passport Expiry Date" value={student.passport_expiry_date ? new Date(student.passport_expiry_date).toLocaleDateString() : 'N/A'} />
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Address Information */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Permanent Address</h4>
                  <p className="text-gray-900">{student.permanent_address}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {student.permanent_city}, {student.permanent_state} - {student.permanent_pincode}
                  </p>
                  <p className="text-sm text-gray-600">{student.permanent_country}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Current Address</h4>
                  <p className="text-gray-900">{student.current_address}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {student.current_city}, {student.current_state} - {student.current_pincode}
                  </p>
                  <p className="text-sm text-gray-600">{student.current_country}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Family Information */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Family Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Father's Details</h4>
                  <InfoRow label="Name" value={student.father_name} />
                  {student.father_occupation && <InfoRow label="Occupation" value={student.father_occupation} />}
                  {student.father_mobile && <InfoRow label="Mobile" value={student.father_mobile} />}
                  {student.father_email && <InfoRow label="Email" value={student.father_email} />}
                  {student.father_annual_income && <InfoRow label="Annual Income" value={`₹${student.father_annual_income}`} />}
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Mother's Details</h4>
                  <InfoRow label="Name" value={student.mother_name} />
                  {student.mother_occupation && <InfoRow label="Occupation" value={student.mother_occupation} />}
                  {student.mother_mobile && <InfoRow label="Mobile" value={student.mother_mobile} />}
                  {student.mother_email && <InfoRow label="Email" value={student.mother_email} />}
                  {student.mother_annual_income && <InfoRow label="Annual Income" value={`₹${student.mother_annual_income}`} />}
                </div>
                {student.guardian_name && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600 mb-2">Guardian Details</h4>
                      <InfoRow label="Name" value={student.guardian_name} />
                      {student.guardian_relation && <InfoRow label="Relation" value={student.guardian_relation} />}
                      {student.guardian_mobile && <InfoRow label="Mobile" value={student.guardian_mobile} />}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Emergency Contact */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <InfoRow label="Contact Person" value={student.emergency_contact_name} />
                <InfoRow label="Relation" value={student.emergency_contact_relation} />
                <InfoRow label="Mobile Number" value={student.emergency_contact_mobile} icon={<Phone className="h-4 w-4 text-red-500" />} />
                <InfoRow label="Address" value={student.emergency_contact_address} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Bank Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Bank Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <InfoRow label="Bank Name" value={student.bank_name} />
                <InfoRow label="Account Number" value={student.bank_account_number} />
                <InfoRow label="IFSC Code" value={student.bank_ifsc_code} />
                <InfoRow label="Branch" value={student.bank_branch} />
                <InfoRow label="Account Holder Name" value={student.bank_account_holder_name} />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  if (!value) return null
  
  return (
    <div className="flex justify-between items-start">
      <span className="text-sm font-medium text-gray-600">{label}:</span>
      <span className="text-sm text-gray-900 text-right flex items-center gap-2">
        {icon}
        {value}
      </span>
    </div>
  )
}
