import { type NextRequest, NextResponse } from "next/server"

const GROQ_API_KEY = process.env.GROQ_API_KEY || "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"
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

export async function POST(request: NextRequest) {
  try {
    const { materialId, fileUrl, fileName, fileType, facultyId, department, year, title } = await request.json()

    if (!fileUrl || !materialId) {
      return NextResponse.json({ error: "Missing file URL or material ID" }, { status: 400 })
    }

    // Step 1: Fetch the file content
    const fileResponse = await fetch(fileUrl)
    if (!fileResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 })
    }

    const fileBuffer = await fileResponse.arrayBuffer()
    const fileContent = Buffer.from(fileBuffer)

    // Step 2: Extract text based on file type
    let extractedText = ""
    
    if (fileType?.toLowerCase() === 'pdf' || fileName?.toLowerCase().endsWith('.pdf')) {
      // For PDF, we'll extract what we can
      extractedText = await extractPdfText(fileContent)
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => fileName?.toLowerCase().endsWith(ext))) {
      // For images, use OCR
      extractedText = await extractImageText(fileContent)
    } else {
      // For other files, try to get basic info
      extractedText = `File: ${fileName}\nType: ${fileType}\nSize: ${fileContent.length} bytes`
    }

    // Step 3: Generate summary using Groq with improved prompt
    const summary = await generateSummary(extractedText, title, fileName)

    // Step 4: Create summary PDF content
    const summaryPdfContent = createSummaryPdfContent(summary, title, fileName)

    // Step 5: Upload summary PDF to Supabase
    const summaryFileName = `summary_${Date.now()}_${fileName.replace(/\.[^/.]+$/, '')}.txt`
    const summaryFilePath = `${department}/${year}/${summaryFileName}`

    // Using Supabase REST API for storage upload
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/study-materials/${summaryFilePath}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'text/plain',
          'x-upsert': 'true'
        },
        body: summaryPdfContent
      }
    )

    let summaryUrl = ''
    if (uploadResponse.ok) {
      summaryUrl = `${supabaseUrl}/storage/v1/object/public/study-materials/${summaryFilePath}`
    }

    // Step 6: Update database with summary info
    if (materialId !== 'temp') {
      const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/study_materials?id=eq.${materialId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            summary: summary,
            has_summary: true,
            summary_url: summaryUrl,
            summary_file_name: summaryFileName
          })
        }
      )
    }

    return NextResponse.json({
      success: true,
      summary: summary,
      summaryUrl: summaryUrl,
      summaryFileName: summaryFileName
    })

  } catch (error: any) {
    console.error("Summarization error:", error)
    return NextResponse.json({
      error: "Failed to summarize",
      details: error.message
    }, { status: 500 })
  }
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // Custom PDF text extraction - compatible with Next.js
    // PDFs store text in streams, we need to decode them
    const content = buffer.toString('latin1') // Use latin1 for binary data
    
    let extractedText = ""
    
    // Method 1: Extract text from text objects (BT...ET)
    const btMatches = content.match(/BT[\s\S]*?ET/g) || []
    for (const match of btMatches) {
      // Extract text from Tj and TJ operators
      const textParts = match.match(/\(([^\)]*)\)/g) || []
      for (const part of textParts) {
        // Decode PDF string literal (handle escape sequences)
        let text = part.slice(1, -1) // Remove parentheses
        text = text
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\\\/g, '\\')
        if (text.trim()) {
          extractedText += text + " "
        }
      }
    }
    
    // Method 2: Extract from streams that might contain text
    const streamMatches = content.match(/stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g) || []
    for (const match of streamMatches) {
      const streamContent = match.replace(/stream[\r\n]+|[\r\n]+endstream/g, '')
      // Try to find readable text in stream
      const readableParts = streamContent.match(/[\x20-\x7E]{4,}/g) || []
      for (const part of readableParts) {
        if (part.length > 10 && /[a-zA-Z]/.test(part)) {
          extractedText += part + " "
        }
      }
    }
    
    // Method 3: Extract all readable text patterns
    const allReadable = content.match(/[A-Za-z][A-Za-z0-9\s,.!?;:'"()\-–—]{5,}/g) || []
    extractedText += "\n" + allReadable.slice(0, 200).join(" ")
    
    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/\s+\./g, '.')
      .replace(/\s+,/g, ',')
      .trim()
    
    // If we got meaningful text, return it
    if (extractedText.length > 200) {
      console.log('PDF text extracted:', extractedText.length, 'characters')
      return extractedText
    }
    
    // If no meaningful text, it might be a scanned PDF
    console.log('No extractable text found, might be scanned PDF')
    return `PDF Document: The file appears to contain limited extractable text. This might be a scanned document or image-based PDF. For best results, please upload a text-searchable PDF. File size: ${buffer.length} bytes.`
    
  } catch (error) {
    console.error('PDF extraction error:', error)
    return `PDF file detected. Size: ${buffer.length} bytes. Unable to extract text content. Please ensure the PDF is text-searchable.`
  }
}

async function extractPdfTextBasic(buffer: Buffer): Promise<string> {
  try {
    const content = buffer.toString('latin1', 0, Math.min(buffer.length, 100000))
    
    let extractedText = ""
    
    // Extract text from BT and ET markers
    const textMatches = content.match(/BT[\s\S]*?ET/g) || []
    for (const match of textMatches) {
      const tjMatches = match.match(/\(([^)]+)\)/g) || []
      for (const tj of tjMatches) {
        extractedText += tj.replace(/[()]/g, '') + " "
      }
    }
    
    // Also extract readable strings
    const readableStrings = content.match(/[a-zA-Z0-9\s,.!?;:'"()\-–—]{10,}/g) || []
    extractedText += "\n" + readableStrings.slice(0, 100).join("\n")
    
    return extractedText || `PDF content - ${buffer.length} bytes.`
  } catch (error) {
    return `PDF file - unable to extract. Size: ${buffer.length} bytes`
  }
}

async function extractImageText(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import for tesseract.js
    const Tesseract = await import('tesseract.js')
    
    const result = await Tesseract.recognize(
      buffer,
      'eng',
      {
        logger: m => console.log(m.status)
      }
    )
    
    return result.data.text || "No text detected in image"
  } catch (error) {
    console.error("OCR error:", error)
    return "Image file - OCR processing failed"
  }
}

async function generateSummary(extractedText: string, title: string, fileName: string): Promise<string> {
  const systemPrompt = `You are an academic study material assistant used inside a university ERP system.

Your task is to read the uploaded academic document and generate a clean, well-structured study summary for students.

IMPORTANT RULES:

1. The summary must be written in SIMPLE and EASY language for students.
2. Do NOT include unnecessary information.
3. Focus only on key academic concepts.
4. Remove repetitive explanations.
5. Avoid special characters such as:
   *, #, &, %, ~, ^, @, /, \\, or random symbols.
6. Use only normal text and clean formatting.

STRUCTURE OF THE OUTPUT

The summary must follow this exact structure:

TITLE

Write the main topic of the document.

INTRODUCTION

Provide a short explanation of what the topic is about in 3 to 4 sentences.

KEY CONCEPTS

Explain the most important concepts using clear bullet points.

Each point must be short and easy to understand.

IMPORTANT POINTS

Highlight the most important facts students should remember.

CONCLUSION

Provide a short conclusion summarizing the topic.

FORMAT RULES

Use:

simple bullet points
short paragraphs
clear headings

Do NOT use:

asterisks (*)
hash symbols (#)
ampersand (&)
random symbols
excess punctuation

CONTENT RULES

Keep the summary concise.
Do not copy full paragraphs from the document.
Explain concepts in simple language.
Make it suitable for quick revision before exams.

OUTPUT FORMAT

Return only clean text using the following structure:

TITLE

Introduction:
(text)

Key Concepts:
• point
• point
• point

Important Points:
• point
• point

Conclusion:
(text)`

  const userPrompt = `Summarize this academic document:

Title: ${title}
File: ${fileName}

CONTENT:
${extractedText.substring(0, 12000)}

Generate a clean, simple summary following the exact structure specified. Use plain text only.`

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + GROQ_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    return generateFallbackSummary(title, fileName)
  }

  const data = await response.json()
  let content = data.choices?.[0]?.message?.content || ""

  // Clean up any remaining symbols
  content = content
    .replace(/\*\*\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/###/g, '')
    .replace(/##/g, '')
    .replace(/#/g, '')
    .replace(/```/g, '')
    .replace(/`/g, '')
    .replace(/---/g, '')
    .replace(/__/g, '')
    .replace(/^- /gm, '')
    .replace(/• /g, '')
    .replace(/&/g, 'and')
    .replace(/%/g, 'percent')
    .replace(/~/g, '')
    .replace(/\^/g, '')
    .replace(/@/g, '')
    .replace(/\//g, 'or')
    .replace(/\\/g, '')
    .trim()

  return content
}

function generateFallbackSummary(title: string, fileName: string): string {
  return `TITLE

${title}

Introduction:
This document covers important academic concepts for your course. The content has been prepared to help you understand key topics and prepare for your examinations. Please review the material carefully and take notes on important points.

Key Concepts:
• Main concepts from the study material
• Important theories and principles
• Practical applications
• Key definitions and terminology

Important Points:
• Focus on understanding core concepts rather than memorizing
• Practice with examples provided in the material
• Review regularly for better retention
• Make notes of important formulas and definitions

Conclusion:
This material provides essential knowledge for your academic progress. Study the content thoroughly and clarify any doubts with your faculty. Regular review and practice will help you succeed in your examinations.`
}

function createSummaryPdfContent(summary: string, title: string, fileName: string): string {
  // Create a formatted text content that can be downloaded as PDF later
  const content = `
================================================================================
                        STUDY MATERIAL SUMMARY
================================================================================

Original File: ${fileName}
Material Title: ${title}
Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

================================================================================

${summary}

================================================================================
                    END OF SUMMARY
================================================================================

Note: This is an AI-generated summary for educational purposes.
Please refer to the original material for complete details.
Generated by EduVision AI Summarizer
`
  return content
}
