import { NextRequest, NextResponse } from "next/server"
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileType = file.type
    const fileName = file.name.toLowerCase()
    let extractedContent = ""

    // Process different file types
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      extractedContent = await processPDF(file)
    } else if (fileType.includes('spreadsheet') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      extractedContent = await processExcel(file)
    } else if (fileType.includes('image') || fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) {
      extractedContent = await processImage(file)
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      extractedContent = await processText(file)
    } else if (fileType.includes('document') || fileName.endsWith('.docx')) {
      extractedContent = await processDocument(file)
    } else if (fileType.includes('presentation') || fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
      extractedContent = await processPowerPoint(file)
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    return NextResponse.json({ 
      content: extractedContent,
      fileType: fileType,
      fileName: file.name
    })

  } catch (error) {
    console.error("Error processing file:", error)
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 })
  }
}

async function processPDF(file: File): Promise<string> {
  // For now, return a placeholder - in production, use pdf-parse or similar
  return `PDF Content from ${file.name}:
This is a placeholder for PDF content extraction. 
In a production environment, this would extract actual text from the PDF file.
File size: ${(file.size / 1024 / 1024).toFixed(2)} MB
Based on this PDF content, generate relevant assignment questions covering the main topics and concepts.`
}

async function processExcel(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    
    let content = `Excel/Spreadsheet Content from ${file.name}:\n\n`
    
    workbook.SheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      content += `Sheet ${index + 1}: ${sheetName}\n`
      content += `Rows: ${jsonData.length}\n`
      
      // Extract first few rows as sample data
      const sampleRows = jsonData.slice(0, 5)
      if (sampleRows.length > 0) {
        content += "Sample Data:\n"
        sampleRows.forEach((row: any, rowIndex) => {
          content += `Row ${rowIndex + 1}: ${Array.isArray(row) ? row.join(' | ') : row}\n`
        })
      }
      content += "\n"
    })
    
    content += "Based on this spreadsheet data, generate assignment questions that involve data analysis, calculations, or interpretation of the information presented."
    
    return content
  } catch (error) {
    return `Excel file processing error. Generate general data analysis assignment questions.`
  }
}

async function processImage(file: File): Promise<string> {
  // For images, we'll provide a template since OCR requires additional libraries
  return `Image Content from ${file.name}:
This is an image file (${file.type}) with size ${(file.size / 1024 / 1024).toFixed(2)} MB.
In a production environment, this would use OCR to extract text from images.
Based on this image content, generate assignment questions that could involve:
- Image analysis and interpretation
- Visual data extraction
- Diagram-based questions
- Chart or graph analysis (if applicable)
Please create questions that require students to analyze visual information.`
}

async function processText(file: File): Promise<string> {
  try {
    const text = await file.text()
    return `Text Content from ${file.name}:

${text}

Based on the above text content, generate relevant assignment questions that test comprehension, analysis, and application of the concepts presented.`
  } catch (error) {
    return `Text file processing error. Generate general text analysis assignment questions.`
  }
}

async function processDocument(file: File): Promise<string> {
  // For DOCX files, we'll provide a template since document parsing requires additional libraries
  return `Document Content from ${file.name}:
This is a document file (${file.type}) with size ${(file.size / 1024 / 1024).toFixed(2)} MB.
In a production environment, this would extract actual text from Word documents.
Based on this document content, generate assignment questions that cover:
- Key concepts and topics from the document
- Critical analysis of the content
- Application of principles discussed
- Synthesis of information presented
Please create comprehensive questions based on the document's subject matter.`
}

async function processPowerPoint(file: File): Promise<string> {
  // For PowerPoint files, we'll provide a template since presentation parsing requires additional libraries
  return `PowerPoint Presentation Content from ${file.name}:
This is a presentation file (${file.type}) with size ${(file.size / 1024 / 1024).toFixed(2)} MB.
In a production environment, this would extract text and slide content from PowerPoint presentations.
Based on this presentation content, generate assignment questions that involve:
- Understanding of key concepts presented in slides
- Analysis of visual information and diagrams
- Application of theories or principles discussed
- Critical evaluation of presentation content
- Synthesis of information across multiple slides
Please create questions that test comprehension and application of the presentation material.`
}
