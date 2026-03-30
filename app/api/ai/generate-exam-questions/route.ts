import { type NextRequest, NextResponse } from "next/server"
import { getSecureApiKey, checkRateLimit, logSecurityEvent, getSecurityHeaders } from "@/lib/security/security-utils"

// Groq API configuration - NEVER expose keys in client-side code
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

// Clean text by removing markdown symbols and special characters
function cleanText(text: string): string {
  if (!text) return text
  return text
    // Remove markdown headers (# ## ###)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic markers
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
    // Remove bullet points and list markers
    .replace(/^[\s]*[-•*+]\s+/gm, '')
    .replace(/^[\s]*\d+[.)]\s+/gm, '')
    // Remove backticks and code blocks
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
    // Remove @ symbols
    .replace(/@/g, '')
    // Remove special characters but keep basic punctuation
    .replace(/[\*#\-]/g, ' ')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

// Clean all text fields in a question
function cleanQuestion(q: any): any {
  return {
    ...q,
    title: cleanText(q.title || ''),
    description: cleanText(q.description || ''),
    inputFormat: cleanText(q.inputFormat || ''),
    outputFormat: cleanText(q.outputFormat || ''),
    constraints: cleanText(q.constraints || ''),
    sampleInput: cleanText(q.sampleInput || ''),
    sampleOutput: cleanText(q.sampleOutput || ''),
    explanation: cleanText(q.explanation || ''),
    hints: (q.hints || []).map((h: string) => cleanText(h)),
    tags: (q.tags || []).map((t: string) => cleanText(t))
  }
}

// Extract questions from uploaded file content
async function extractQuestionsFromFile(fileContent: string, language: string, numQuestions: number): Promise<NextResponse> {
  const systemPrompt = `You are an expert at extracting programming questions from documents.
Extract coding questions from the provided text and format them as JSON.

OUTPUT FORMAT - Return ONLY valid JSON:
{
  "questions": [
    {
      "id": "q1",
      "title": "Extracted Question Title",
      "difficulty": "easy",
      "marks": 10,
      "timeLimit": "15 minutes",
      "description": "Problem statement",
      "inputFormat": "Input description",
      "outputFormat": "Output description",
      "constraints": "Constraints",
      "sampleInput": "Example input",
      "sampleOutput": "Example output",
      "explanation": "Explanation",
      "testCases": [{"input": "test", "expectedOutput": "result", "isHidden": false}],
      "conceptsTested": ["concept"],
      "hints": ["Hint"]
    }
  ]
}`

  const userPrompt = `Extract up to ${numQuestions} coding questions from this document content for ${language}:

${fileContent.substring(0, 4000)}

Return ONLY valid JSON with extracted questions. If no questions found, return empty questions array.`

  const GROQ_API_KEY = getSecureApiKey('GROQ_API_KEY')
  if (!GROQ_API_KEY) {
    logSecurityEvent({ type: 'unauthorized_access', details: 'Missing GROQ_API_KEY' })
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
  
  try {
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
        max_tokens: 4096
      }),
    })

    const data = await response.json()
    let content = data.choices?.[0]?.message?.content || ""
    
    // Parse JSON
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return NextResponse.json({
        success: true,
        questions: parsed.questions || [],
        source: "file-extraction"
      })
    }
    
    return NextResponse.json({ success: true, questions: [], source: "file-extraction" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to extract questions from file" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      language, 
      difficulty, 
      topics, 
      numQuestions, 
      examDuration,
      totalMarks,
      customPrompt,
      previousQuestions = [],
      fileContent // Added for file extraction
    } = await request.json()

    if (!language) {
      return NextResponse.json({ error: "Language is required" }, { status: 400 })
    }

    // If file content is provided, extract questions from it
    if (fileContent) {
      return extractQuestionsFromFile(fileContent, language, numQuestions || 3)
    }

    // Build the prompt for generating simple coding questions
    const systemPrompt = `You are an expert programming instructor at a university. Your task is to generate SIMPLE, PRACTICAL coding questions for students.

CRITICAL RULES:
1. Generate SIMPLE coding problems that can be solved in 15-30 minutes
2. Focus on basic programming concepts: loops, arrays, strings, functions, basic logic
3. Avoid complex algorithms or advanced topics
4. Each question must be CLEAR and CONCISE
5. Problems must be executable in a standard compiler
6. DO NOT use special symbols like asterisks (*), at signs (@), hash (#), dashes (-), ampersands (&), or any other special characters in question titles or descriptions
7. Use plain text only - no markdown formatting, no bullet points with symbols

DIFFICULTY LEVELS:
- EASY (Simple): Basic syntax, simple loops, input/output, calculations (10-15 minutes)
- MEDIUM (Intermediate): Arrays, strings, functions, basic data structures (20-30 minutes)  
- HARD: Complex logic, multiple data structures, optimization (30-45 minutes)

LANGUAGE-SPECIFIC EXAMPLES:
- C/C++: Array operations, loops, functions, pointers, structures
- Python: Lists, dictionaries, strings, functions, basic algorithms
- Java: Classes, methods, arrays, collections, basic OOP
- JavaScript: Arrays, objects, string methods, basic DOM operations

OUTPUT FORMAT - Return ONLY valid JSON:
{
  "questions": [
    {
      "id": "q1",
      "title": "Clear Question Title Without Symbols",
      "difficulty": "easy",
      "marks": 10,
      "timeLimit": "15 minutes",
      "description": "Simple problem statement explaining what to do",
      "inputFormat": "What input the program receives",
      "outputFormat": "What the program should output",
      "constraints": "Simple constraints like 1 <= n <= 100",
      "sampleInput": "Example input",
      "sampleOutput": "Example output",
      "explanation": "Brief explanation",
      "testCases": [{"input": "test", "expectedOutput": "result", "isHidden": false}],
      "conceptsTested": ["loop", "array"],
      "hints": ["Hint to help solve"]
    }
  ]
}

IMPORTANT:
- Generate ONLY valid JSON, no markdown, no code blocks
- Keep questions SIMPLE and PRACTICAL
- NO special characters or symbols in any text field
- Use only letters, numbers, spaces, and basic punctuation (comma, period, parentheses)
- Each question must be unique`

    // Build user prompt - focus on simple coding questions
    // Map difficulty to user-friendly terms
    const difficultyLabel = difficulty === 'easy' ? 'simple (beginner level)' : 
                           difficulty === 'medium' ? 'intermediate (moderate level)' : 
                           'advanced (complex level)'
    
    let userPrompt = `Generate exactly ${numQuestions || 3} SIMPLE coding questions for ${language} programming language.

${customPrompt ? `USER REQUEST: ${customPrompt}

Generate questions based on the user's specific request above. Make sure questions are:
- Simple and practical
- Related to what the user asked for
- Solvable by students in 15-30 minutes
- NO special symbols like asterisks, hashes, at signs, or dashes in titles or descriptions` : `Generate questions that are:
- Clear and easy to understand
- Practical programming exercises
- Focused on basic concepts like input/output, loops, arrays, strings
- NO special symbols or markdown formatting in any text`}

DIFFICULTY LEVEL: ${difficultyLabel}
NUMBER OF QUESTIONS: ${numQuestions || 3}
${totalMarks ? `TOTAL MARKS: ${totalMarks}` : ''}
${topics && topics.length > 0 ? `TOPICS TO COVER: ${topics.join(', ')}` : ''}

IMPORTANT: Use only plain text with letters, numbers, spaces, and basic punctuation. No symbols or special characters.`

    // Avoid repetition
    if (previousQuestions.length > 0) {
      userPrompt += `\n\nDO NOT repeat these previous question titles: ${previousQuestions.slice(0, 10).join(', ')}`
    }

    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
    const rateCheck = checkRateLimit(`exam-questions-${clientIp}`, 10, 60000)
    if (!rateCheck.allowed) {
      logSecurityEvent({ type: 'rate_limit', ip: clientIp, details: 'Exam question generation' })
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
    
    const GROQ_API_KEY = getSecureApiKey('GROQ_API_KEY')
    if (!GROQ_API_KEY) {
      logSecurityEvent({ type: 'unauthorized_access', details: 'Missing GROQ_API_KEY' })
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }
    
    // Call Groq API
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + GROQ_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        temperature: 0.9,
        max_completion_tokens: 8192,
        top_p: 1,
        stream: false
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Groq API error:", response.status, errorData)
      return NextResponse.json({ 
        error: "Failed to generate questions",
        details: errorData 
      }, { status: 500 })
    }

    const data = await response.json()
    let content = data.choices?.[0]?.message?.content || ""

    // Parse JSON from response
    let questions
    try {
      // Remove any markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      
      // Try to find JSON object in response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        questions = parsed.questions || parsed
      } else {
        const parsed = JSON.parse(content)
        questions = parsed.questions || parsed
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      console.log("Raw content:", content.substring(0, 500))
      
      return NextResponse.json({ 
        error: "Failed to parse AI response",
        rawContent: content.substring(0, 500)
      }, { status: 500 })
    }

    // Validate questions array
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ 
        error: "No valid questions generated",
        questions: []
      }, { status: 500 })
    }

    // Ensure each question has required fields with proper structure
    const validatedQuestions = questions.map((q: any, index: number) => {
      const cleaned = cleanQuestion(q)
      return {
        id: cleaned.id || `q${index + 1}`,
        title: cleaned.title || `Question ${index + 1}`,
        description: cleaned.description || "Solve the given problem",
        difficulty: cleaned.difficulty || difficulty || "medium",
        marks: cleaned.marks || Math.floor((totalMarks || 100) / (numQuestions || 3)),
        timeLimit: cleaned.timeLimit || `${Math.floor((examDuration || 120) / (numQuestions || 3))} minutes`,
        inputFormat: cleaned.inputFormat || "See problem description",
        outputFormat: cleaned.outputFormat || "See problem description",
        constraints: cleaned.constraints || "Standard constraints apply",
        sampleInput: cleaned.sampleInput || "",
        sampleOutput: cleaned.sampleOutput || "",
        explanation: cleaned.explanation || "",
        testCases: cleaned.testCases || [{ input: cleaned.sampleInput || "", expectedOutput: cleaned.sampleOutput || "", isHidden: false }],
        conceptsTested: cleaned.conceptsTested || cleaned.tags || [language.toLowerCase()],
        hints: cleaned.hints || [],
        tags: cleaned.tags || [language.toLowerCase()]
      }
    })

    return NextResponse.json({
      success: true,
      questions: validatedQuestions,
      generatedAt: new Date().toISOString(),
      source: "groq-ai"
    })

  } catch (error) {
    console.error("Error generating exam questions:", error)
    return NextResponse.json({ 
      error: "Failed to generate questions",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "AI Exam Question Generator API",
    status: "healthy",
    model: "openai/gpt-oss-120b",
    features: [
      "unique-question-generation",
      "no-repetition",
      "custom-prompts",
      "difficulty-levels",
      "topic-based",
      "language-specific-rules"
    ]
  })
}
