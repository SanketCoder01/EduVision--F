import { type NextRequest, NextResponse } from "next/server"

const GROQ_API_KEY = process.env.GROQ_API_KEY || "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"
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, fileSize, context, subject, fileContent } = await request.json()

    // If file content is provided, use it for better summarization
    const contentToSummarize = fileContent || context || ''

    const systemPrompt = `You are an educational content summarizer for university students. Create a clear, simple summary of study materials.

STRICT RULES:
1. Use ONLY plain text - NO symbols like asterisks, hyphens, hash, underscores, or markdown
2. Use simple language that any student can understand
3. Structure with clear sections using plain text headers
4. Use numbers (1, 2, 3) for lists instead of bullet symbols
5. Keep summary concise but informative
6. Focus on key concepts and learning objectives

OUTPUT FORMAT (plain text only):

STUDY MATERIAL SUMMARY

Title: [Material Title]
Subject: [Subject Name]

KEY TOPICS COVERED
1. [Topic 1]
2. [Topic 2]
3. [Topic 3]

MAIN SUMMARY
[Write 2 to 3 paragraphs explaining the main content in simple language. Make it easy for students to understand what this material covers.]

IMPORTANT CONCEPTS
1. [Concept 1]: [Simple explanation]
2. [Concept 2]: [Simple explanation]
3. [Concept 3]: [Simple explanation]

LEARNING OBJECTIVES
After studying this material, students will be able to:
1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

KEY TAKEAWAYS
1. [Takeaway 1]
2. [Takeaway 2]
3. [Takeaway 3]

Remember: Use ONLY plain text. No special characters or formatting symbols.`

    const userPrompt = `Create a student-friendly summary for this study material:

File Name: ${fileName}
File Type: ${fileType}
File Size: ${fileSize ? (fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}
Subject: ${subject || 'General'}

Content Preview:
${contentToSummarize.substring(0, 5000)}

Generate a clear, simple summary that helps students understand what this material covers. Use plain text only.`

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
        temperature: 0.3,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Groq API error:", response.status, errorData)
      
      // Return a fallback summary
      return NextResponse.json({
        summary: `STUDY MATERIAL SUMMARY

Title: ${fileName}
Subject: ${subject || 'General'}

KEY TOPICS COVERED
1. Main concepts from the study material
2. Important theories and principles
3. Practical applications

MAIN SUMMARY
This study material covers important topics related to ${subject || 'your course'}. The content has been summarized to help you understand the key concepts quickly. Please refer to the original document for detailed explanations and examples.

IMPORTANT CONCEPTS
1. Core concepts from the material
2. Key definitions and terminology
3. Important formulas or procedures

LEARNING OBJECTIVES
After studying this material, students will be able to:
1. Understand the main concepts
2. Apply the knowledge in practical scenarios
3. Prepare effectively for examinations

KEY TAKEAWAYS
1. Focus on understanding core concepts
2. Practice with examples provided
3. Review regularly for better retention`,
        success: false
      })
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
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return NextResponse.json({ 
      summary: content,
      success: true 
    })
  } catch (error) {
    console.error("Error summarizing content:", error)
    return NextResponse.json({ 
      error: "Failed to generate summary",
      summary: "This study material contains important educational content. Please review the file for details.",
      success: false
    }, { status: 500 })
  }
}
