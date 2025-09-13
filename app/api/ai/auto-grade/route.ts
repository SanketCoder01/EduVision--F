import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { submission_text, assignment_questions, max_marks, assignment_type } = await request.json()

    if (!submission_text || !assignment_questions || !max_marks) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Call Gemini API for auto-grading
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an AI grading assistant. Please grade the following student submission based on the assignment criteria.

Assignment Questions/Criteria:
${assignment_questions}

Assignment Type: ${assignment_type}
Maximum Marks: ${max_marks}

Student Submission:
${submission_text}

Please provide:
1. A numerical grade out of ${max_marks}
2. Detailed feedback explaining the grade
3. Areas of strength and improvement

Format your response as JSON:
{
  "grade": <number>,
  "feedback": "<detailed feedback>",
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"]
}`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    })

    if (!response.ok) {
      throw new Error('Failed to get AI response')
    }

    const data = await response.json()
    const aiResponse = data.candidates[0]?.content?.parts[0]?.text

    if (!aiResponse) {
      throw new Error('No AI response received')
    }

    // Parse the AI response
    try {
      const gradingResult = JSON.parse(aiResponse)
      
      // Validate the grade is within bounds
      const grade = Math.min(Math.max(0, gradingResult.grade), max_marks)
      
      return NextResponse.json({
        grade,
        feedback: gradingResult.feedback,
        strengths: gradingResult.strengths || [],
        improvements: gradingResult.improvements || []
      })
    } catch (parseError) {
      // Fallback: extract grade and feedback from text response
      const gradeMatch = aiResponse.match(/grade[":]\s*(\d+(?:\.\d+)?)/i)
      const grade = gradeMatch ? Math.min(Math.max(0, parseFloat(gradeMatch[1])), max_marks) : Math.floor(max_marks * 0.7)
      
      return NextResponse.json({
        grade,
        feedback: aiResponse,
        strengths: [],
        improvements: []
      })
    }

  } catch (error) {
    console.error('Auto-grading error:', error)
    return NextResponse.json(
      { error: 'Failed to auto-grade assignment' },
      { status: 500 }
    )
  }
}
