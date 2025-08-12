import * as XLSX from 'xlsx'

export function generateStudentTemplate() {
  const workbook = XLSX.utils.book_new()
  
  const headers = [
    'Name',
    'Email', 
    'Phone',
    'Department',
    'Address',
    'Year',
    'PRN'
  ]
  
  const worksheet = XLSX.utils.aoa_to_sheet([headers])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}

export function generateFacultyTemplate() {
  const workbook = XLSX.utils.book_new()
  
  const headers = [
    'Name',
    'Email',
    'Phone', 
    'Department',
    'Address',
    'Employee ID'
  ]
  
  const worksheet = XLSX.utils.aoa_to_sheet([headers])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Faculty')
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}
