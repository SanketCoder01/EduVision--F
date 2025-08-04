import * as XLSX from "xlsx"
import { generatePRN, generateEmployeeId, generateSecurePassword } from "./supabase"

export interface BulkProcessingStats {
  total: number
  processed: number
  successful: number
  failed: number
  errors: Array<{ row: number; error: string }>
}

export async function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        resolve(jsonData)
      } catch (error) {
        reject(new Error("Failed to parse Excel file"))
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsArrayBuffer(file)
  })
}

export function validateStudentData(data: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const requiredFields = ["Student Name", "Email ID", "Department", "Year"]

  if (data.length === 0) {
    errors.push("No data found in the file")
    return { valid: false, errors }
  }

  data.forEach((row, index) => {
    const rowNumber = index + 2 // Excel row number (1-indexed + header)

    requiredFields.forEach((field) => {
      if (!row[field] || row[field].toString().trim() === "") {
        errors.push(`Row ${rowNumber}: ${field} is required`)
      }
    })

    // Validate email format
    if (row["Email ID"]) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(row["Email ID"])) {
        errors.push(`Row ${rowNumber}: Invalid email format`)
      }
    }

    // Validate department
    const validDepartments = ["cse", "cy", "aids", "aiml"]
    if (row["Department"] && !validDepartments.includes(row["Department"].toLowerCase())) {
      errors.push(`Row ${rowNumber}: Invalid department. Must be one of: ${validDepartments.join(", ")}`)
    }

    // Validate year
    const validYears = ["first", "second", "third", "fourth"]
    if (row["Year"] && !validYears.includes(row["Year"].toLowerCase())) {
      errors.push(`Row ${rowNumber}: Invalid year. Must be one of: ${validYears.join(", ")}`)
    }
  })

  return { valid: errors.length === 0, errors }
}

export function validateFacultyData(data: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const requiredFields = ["Faculty Name", "Email ID", "Department", "Designation"]

  if (data.length === 0) {
    errors.push("No data found in the file")
    return { valid: false, errors }
  }

  data.forEach((row, index) => {
    const rowNumber = index + 2 // Excel row number (1-indexed + header)

    requiredFields.forEach((field) => {
      if (!row[field] || row[field].toString().trim() === "") {
        errors.push(`Row ${rowNumber}: ${field} is required`)
      }
    })

    // Validate email format
    if (row["Email ID"]) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(row["Email ID"])) {
        errors.push(`Row ${rowNumber}: Invalid email format`)
      }
    }

    // Validate department
    const validDepartments = ["cse", "cy", "aids", "aiml"]
    if (row["Department"] && !validDepartments.includes(row["Department"].toLowerCase())) {
      errors.push(`Row ${rowNumber}: Invalid department. Must be one of: ${validDepartments.join(", ")}`)
    }

    // Validate designation
    const validDesignations = [
      "Professor",
      "Associate Professor",
      "Assistant Professor",
      "Lecturer",
      "Senior Lecturer",
      "Visiting Faculty",
    ]
    if (row["Designation"] && !validDesignations.includes(row["Designation"])) {
      errors.push(`Row ${rowNumber}: Invalid designation. Must be one of: ${validDesignations.join(", ")}`)
    }
  })

  return { valid: errors.length === 0, errors }
}

export async function mapStudentData(data: any[]): Promise<any[]> {
  return data.map((row) => ({
    name: row["Student Name"],
    email: row["Email ID"],
    phone: row["Phone No"] || "",
    department: row["Department"].toLowerCase(),
    year: row["Year"].toLowerCase(),
    date_of_birth: row["Date of Birth"] || "",
    parent_name: row["Parent Name"] || "",
    parent_phone: row["Parent Phone"] || "",
    address: row["Address"] || "",
    prn: generatePRN(row["Department"].toLowerCase(), row["Year"].toLowerCase()),
    password: generateSecurePassword(),
  }))
}

export async function mapFacultyData(data: any[]): Promise<any[]> {
  return data.map((row) => ({
    name: row["Faculty Name"],
    email: row["Email ID"],
    phone: row["Phone No"] || "",
    department: row["Department"].toLowerCase(),
    designation: row["Designation"],
    qualification: row["Qualification"] || "",
    experience_years: Number.parseInt(row["Experience Years"]) || 0,
    address: row["Address"] || "",
    employee_id: generateEmployeeId(row["Department"].toLowerCase()),
    password: generateSecurePassword(),
  }))
}

export async function processBulkData<T>(
  data: T[],
  processBatch: (batch: T[]) => Promise<void>,
  batchSize = 50,
  onProgress?: (stats: BulkProcessingStats) => void,
): Promise<BulkProcessingStats> {
  const stats: BulkProcessingStats = {
    total: data.length,
    processed: 0,
    successful: 0,
    failed: 0,
    errors: [],
  }

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)

    try {
      await processBatch(batch)
      stats.successful += batch.length
    } catch (error: any) {
      stats.failed += batch.length
      batch.forEach((_, index) => {
        stats.errors.push({
          row: i + index + 2, // Excel row number
          error: error.message || "Unknown error",
        })
      })
    }

    stats.processed += batch.length
    onProgress?.(stats)

    // Small delay to prevent overwhelming the database
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return stats
}
