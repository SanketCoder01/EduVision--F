import { type NextRequest, NextResponse } from "next/server"

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || "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"
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

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

DIFFICULTY LEVELS:
- EASY: Basic syntax, simple loops, input/output, calculations (10-15 minutes)
- MEDIUM: Arrays, strings, functions, basic data structures (20-30 minutes)  
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
      "title": "Clear Question Title",
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
- Avoid special characters like *, #, &
- Each question must be unique`

    // Build user prompt - focus on simple coding questions
    let userPrompt = `Generate exactly ${numQuestions || 3} SIMPLE coding questions for ${language} programming language.

${customPrompt ? `USER REQUEST: ${customPrompt}

Generate questions based on the user's specific request above. Make sure questions are:
- Simple and practical
- Related to what the user asked for
- Solvable by students in 15-30 minutes` : `Generate a mix of easy and medium difficulty questions covering:
- Basic input/output operations
- Simple loops and conditionals  
- Array/string manipulations
- Basic function implementations`}

DIFFICULTY: ${difficulty || 'mixed (easy and medium)'}
NUMBER OF QUESTIONS: ${numQuestions || 3}
${totalMarks ? `TOTAL MARKS: ${totalMarks}` : ''}
${topics && topics.length > 0 ? `TOPICS: ${topics.join(', ')}` : ''}`

    // Avoid repetition
    if (previousQuestions.length > 0) {
      userPrompt += `\n\nDO NOT repeat these previous question titles: ${previousQuestions.slice(0, 10).join(', ')}`
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
    const validatedQuestions = questions.map((q: any, index: number) => ({
      id: q.id || `q${index + 1}`,
      title: q.title || `Question ${index + 1}`,
      description: q.description || q.problemStatement || "Solve the given problem",
      difficulty: q.difficulty || difficulty || "medium",
      marks: q.marks || Math.floor((totalMarks || 100) / (numQuestions || 3)),
      timeLimit: q.timeLimit || `${Math.floor((examDuration || 120) / (numQuestions || 3))} minutes`,
      inputFormat: q.inputFormat || "See problem description",
      outputFormat: q.outputFormat || "See problem description",
      constraints: q.constraints || "Standard constraints apply",
      sampleInput: q.sampleInput || "",
      sampleOutput: q.sampleOutput || "",
      explanation: q.explanation || "",
      testCases: q.testCases || [{ input: q.sampleInput || "", expectedOutput: q.sampleOutput || "", isHidden: false }],
      conceptsTested: q.conceptsTested || q.tags || [language.toLowerCase()],
      hints: q.hints || [],
      tags: q.conceptsTested || q.tags || [language.toLowerCase()]
    }))

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
