import * as XLSX from "xlsx"

export interface StudentTemplate {
  "Student Name": string
  "Email ID": string
  "Phone No": string
  Department: string
  Year: string
  "Date of Birth": string
  "Parent Name": string
  "Parent Phone": string
  Address: string
}

export interface FacultyTemplate {
  "Faculty Name": string
  "Email ID": string
  "Phone No": string
  Department: string
  Designation: string
  Qualification: string
  "Experience Years": string
  Address: string
}

export function generateStudentTemplate(): StudentTemplate[] {
  return [
    {
      "Student Name": "John Doe",
      "Email ID": "john.doe@student.edu",
      "Phone No": "9876543210",
      Department: "cse",
      Year: "first",
      "Date of Birth": "2005-01-15",
      "Parent Name": "Robert Doe",
      "Parent Phone": "9876543211",
      Address: "123 Main Street, City, State",
    },
    {
      "Student Name": "Jane Smith",
      "Email ID": "jane.smith@student.edu",
      "Phone No": "9876543212",
      Department: "aids",
      Year: "second",
      "Date of Birth": "2004-03-20",
      "Parent Name": "Michael Smith",
      "Parent Phone": "9876543213",
      Address: "456 Oak Avenue, City, State",
    },
  ]
}

export function generateFacultyTemplate(): FacultyTemplate[] {
  return [
    {
      "Faculty Name": "Dr. Alice Johnson",
      "Email ID": "alice.johnson@university.edu",
      "Phone No": "9876543220",
      Department: "cse",
      Designation: "Professor",
      Qualification: "Ph.D. in Computer Science",
      "Experience Years": "15",
      Address: "789 University Drive, City, State",
    },
    {
      "Faculty Name": "Prof. Bob Wilson",
      "Email ID": "bob.wilson@university.edu",
      "Phone No": "9876543221",
      Department: "aiml",
      Designation: "Associate Professor",
      Qualification: "M.Tech in AI & ML",
      "Experience Years": "10",
      Address: "321 Faculty Lane, City, State",
    },
  ]
}

export function downloadTemplate(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()

  // Set column widths
  const columnWidths = [
    { wch: 20 }, // Name
    { wch: 25 }, // Email
    { wch: 15 }, // Phone
    { wch: 15 }, // Department
    { wch: 15 }, // Year/Designation
    { wch: 20 }, // DOB/Qualification
    { wch: 20 }, // Parent Name/Experience
    { wch: 15 }, // Parent Phone
    { wch: 30 }, // Address
  ]

  worksheet["!cols"] = columnWidths

  XLSX.utils.book_append_sheet(workbook, worksheet, "Template")
  XLSX.writeFile(workbook, filename)
}
