# Complete Registration Module Implementation Guide

## 📋 **Overview**

This document outlines the implementation of a comprehensive registration module for both students and faculty that:
- Locks all dashboard modules until registration is complete
- Collects detailed information across multiple sections
- Stores data in Supabase with proper schema
- Allows editing after initial registration
- Shows all info in profile section

## 🗄️ **Database Schema**

### **SQL Migration Created**: `012_complete_registration_schema.sql`

### **Student Fields Added**:
1. **Personal Details**: middle_name, last_name, date_of_birth, gender, blood_group, nationality, religion, caste, sub_caste, domicile, birth_place, birth_country
2. **Contact Details**: mobile_number, alternate_mobile, aadhar_number, pan_number
3. **Family Details**: father (name, occupation, mobile, email, income), mother (name, occupation, mobile, email, income), guardian (name, relation, mobile, email)
4. **Address**: permanent and current (address, city, state, pincode, country)
5. **Emergency Contact**: name, relation, mobile, address
6. **Passport**: number, issue_date, expiry_date, issue_place
7. **Bank**: name, account_number, ifsc_code, branch, account_holder_name
8. **Registration Status**: registration_completed (boolean), registration_step (integer)

### **New Tables Created**:

#### `student_education_details`
```sql
- education_level (SSC, HSC, Diploma, etc.)
- board_university
- school_college_name
- passing_year
- seat_number
- total_marks, marks_obtained, percentage
- grade, cgpa, sgpa
- subjects (JSONB for subject-wise marks)
```

#### `student_documents`
```sql
- document_type (Photo, Aadhar, PAN, 10th Certificate, etc.)
- document_url
- uploaded_at
```

### **Faculty Fields Added**:
Similar to students but without academic marks (CGPA/SGPA). Additional fields:
- marital_status
- spouse_name, spouse_occupation, spouse_mobile
- number_of_children

### **New Faculty Tables**:
- `faculty_education_details` (degree_type, specialization, university, etc.)
- `faculty_documents`
- `faculty_experience` (organization, designation, from_date, to_date, responsibilities)

## 🎨 **UI Components to Create**

### **1. Student Registration Component**
**File**: `app/student-dashboard/complete-registration/page.tsx`

**Sections** (as horizontal scrollable tabs):
1. **Personal Details**
   - First Name, Middle Name, Last Name
   - Date of Birth, Gender, Blood Group
   - Nationality, Religion, Caste, Sub-Caste
   - Domicile, Birth Place, Birth Country

2. **Identity**
   - Aadhar Number
   - PAN Number
   - Passport Details (if applicable)

3. **Contact Details**
   - Mobile Number, Alternate Mobile
   - Email (pre-filled, read-only)
   - Permanent Address (Address, City, State, Pincode, Country)
   - Current Address (with "Same as Permanent" checkbox)

4. **Family Details**
   - Father: Name, Occupation, Mobile, Email, Annual Income
   - Mother: Name, Occupation, Mobile, Email, Annual Income
   - Guardian: Name, Relation, Mobile, Email (if applicable)

5. **Education Details** (SSC/10th Marks)
   - Board/University
   - School Name
   - Passing Year, Seat Number
   - Total Marks, Marks Obtained, Percentage
   - Subject-wise marks (Mathematics, Science, etc.)

6. **Education Details** (HSC/12th Marks)
   - Same fields as SSC
   - CGPA, SGPA, Grade

7. **Qualifying Examination Details**
   - For diploma/other qualifications
   - Same structure

8. **Diploma Details** (if applicable)
   - Semester-wise marks
   - CGPA, SGPA

9. **Graduations Details** (if applicable)
   - Year-wise performance

10. **Post Graduations Details** (if applicable)

11. **GAP in Academic Year**
    - If any gap years, reason

12. **Bank Details**
    - Bank Name, Account Number
    - IFSC Code, Branch
    - Account Holder Name

13. **Upload Documents**
    - Photo (passport size)
    - Aadhar Card
    - PAN Card
    - 10th Certificate
    - 12th Certificate
    - Diploma Certificate (if applicable)
    - Transfer Certificate
    - Migration Certificate
    - Caste Certificate (if applicable)
    - Income Certificate (if applicable)

14. **Emergency Contact**
    - Name, Relation
    - Mobile Number
    - Address

15. **Medical Details** (optional)
    - Blood Group
    - Any medical conditions
    - Allergies

16. **Social Details** (optional)
    - LinkedIn Profile
    - GitHub Profile
    - Portfolio Website

### **2. Faculty Registration Component**
**File**: `app/dashboard/complete-registration/page.tsx`

**Sections** (similar to student but adapted):
1. Personal Details
2. Identity
3. Contact Details
4. Family Details (Spouse, Children)
5. Education Details (Degrees: Bachelor's, Master's, PhD)
6. Experience Details (Previous organizations)
7. Bank Details
8. Upload Documents
9. Emergency Contact

## 🔒 **Registration Guard Implementation**

### **Student Dashboard Layout Update**
**File**: `app/student-dashboard/layout.tsx`

```typescript
// Check registration status
const { data: student } = await supabase
  .from('students')
  .select('registration_completed')
  .eq('id', userId)
  .single()

if (!student?.registration_completed) {
  // Show only "Complete Registration" in sidebar
  // Lock all other modules
  // Redirect to /student-dashboard/complete-registration
}
```

### **Faculty Dashboard Layout Update**
**File**: `app/dashboard/layout.tsx`

Similar logic for faculty

## 💾 **Data Saving Logic**

### **Multi-Step Form with Progress**
```typescript
const [currentStep, setCurrentStep] = useState(0)
const [formData, setFormData] = useState({
  personalDetails: {},
  contactDetails: {},
  familyDetails: {},
  educationDetails: [],
  bankDetails: {},
  documents: [],
  emergencyContact: {}
})

// Save progress after each step
const saveProgress = async () => {
  await supabase
    .from('students')
    .update({
      ...formData.personalDetails,
      ...formData.contactDetails,
      registration_step: currentStep
    })
    .eq('id', studentId)
}

// Final submission
const completeRegistration = async () => {
  // Save all data
  await supabase
    .from('students')
    .update({
      ...allFormData,
      registration_completed: true,
      registration_step: totalSteps
    })
    .eq('id', studentId)
  
  // Save education details
  await supabase
    .from('student_education_details')
    .insert(formData.educationDetails)
  
  // Upload documents
  for (const doc of formData.documents) {
    const { data } = await supabase.storage
      .from('student-documents')
      .upload(`${studentId}/${doc.type}`, doc.file)
    
    await supabase
      .from('student_documents')
      .insert({
        student_id: studentId,
        document_type: doc.type,
        document_url: data.path
      })
  }
}
```

## 🎯 **Implementation Steps**

### **Step 1**: Run SQL Migration
```bash
# Apply the schema
supabase db push
```

### **Step 2**: Create Storage Buckets
```sql
-- Create buckets for documents
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('student-documents', 'student-documents', false),
  ('faculty-documents', 'faculty-documents', false);

-- RLS Policies
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'student-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### **Step 3**: Create Registration Components
1. Create `StudentRegistrationForm` component with all sections
2. Create `FacultyRegistrationForm` component
3. Add horizontal scrollable tabs for sections
4. Implement form validation
5. Add file upload functionality
6. Implement progress saving

### **Step 4**: Update Dashboard Layouts
1. Add registration check in `student-dashboard/layout.tsx`
2. Add registration check in `dashboard/layout.tsx`
3. Show "Complete Registration" in sidebar if not completed
4. Lock all other modules
5. Remove "Complete Registration" from sidebar after completion

### **Step 5**: Update Profile Pages
1. Fetch all registration data
2. Display in organized sections
3. Add "Edit" functionality
4. Allow updating any field
5. Save changes to Supabase

## 📱 **UI Design**

### **Horizontal Scrollable Tabs** (like in image)
```tsx
<div className="overflow-x-auto">
  <div className="flex gap-2 min-w-max">
    <Tab active={step === 0}>Personal Details</Tab>
    <Tab active={step === 1}>Identity</Tab>
    <Tab active={step === 2}>Religion</Tab>
    <Tab active={step === 3}>Physically Handicapped</Tab>
    <Tab active={step === 4}>Minority Details</Tab>
    <Tab active={step === 5}>Passport Details</Tab>
    {/* ... more tabs */}
  </div>
</div>
```

### **Form Layout**
- 3-column grid for form fields
- Proper labels and placeholders
- Validation messages
- Progress indicator
- "Save & Next" and "Previous" buttons
- "Save as Draft" option

## 🔄 **Edit Functionality**

### **Profile Page with Edit Mode**
```typescript
const [isEditing, setIsEditing] = useState(false)
const [editData, setEditData] = useState(profileData)

const handleUpdate = async () => {
  await supabase
    .from('students')
    .update(editData)
    .eq('id', studentId)
  
  // Refresh profile data
  fetchProfileData()
  setIsEditing(false)
}
```

## ✅ **Validation Rules**

- **Required Fields**: Name, DOB, Gender, Mobile, Email, Address
- **Email**: Valid email format
- **Mobile**: 10 digits
- **Aadhar**: 12 digits
- **PAN**: Valid PAN format (ABCDE1234F)
- **Percentage**: 0-100
- **CGPA**: 0-10
- **File Size**: Max 5MB per document
- **File Types**: PDF, JPG, PNG only

## 🎨 **Progress Indicator**

```tsx
<div className="flex items-center justify-between mb-6">
  {sections.map((section, index) => (
    <div key={index} className="flex items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-300'
      }`}>
        {index + 1}
      </div>
      {index < sections.length - 1 && (
        <div className={`w-12 h-1 ${
          index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
        }`} />
      )}
    </div>
  ))}
</div>
```

## 📊 **Data Flow**

1. **First Login** → Check `registration_completed`
2. **If false** → Redirect to registration page
3. **Show only "Complete Registration"** in sidebar
4. **Lock all other modules**
5. **User fills form** → Save progress after each step
6. **Upload documents** → Store in Supabase Storage
7. **Submit final** → Set `registration_completed = true`
8. **Unlock all modules** → Remove registration from sidebar
9. **Show in profile** → Display all registered data
10. **Allow editing** → Update Supabase on save

## 🚀 **Next Steps**

Due to the massive size of this implementation (would require 3000+ lines of code), I recommend:

1. **Start with database migration** (already created)
2. **Create student registration component** (one section at a time)
3. **Test each section** before moving to next
4. **Implement file upload** for documents
5. **Add registration guard** in layout
6. **Update profile page** to show all data
7. **Repeat for faculty** registration

Would you like me to create a specific section of the registration form (e.g., Personal Details section) as a starting point?
