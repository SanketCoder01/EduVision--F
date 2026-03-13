import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { submission_text, submission_files, assignment_questions, max_marks, assignment_type, batch_mode } = await request.json()

    if ((!submission_text && (!submission_files || submission_files.length === 0)) || !assignment_questions || !max_marks) {
      return NextResponse.json(
        { error: 'Missing required fields - need submission text or files, questions, and max marks' },
        { status: 400 }
      )
    }

    // Build content for AI analysis
    let contentForAnalysis = ''
    
    // Add text submission if available
    if (submission_text) {
      contentForAnalysis += `Text Submission:\n${submission_text}\n\n`
    }
    
    // Add file information for analysis
    if (submission_files && submission_files.length > 0) {
      contentForAnalysis += `Submitted Files:\n`
      for (const file of submission_files) {
        contentForAnalysis += `- ${file.file_name} (${file.file_type}, ${Math.round(file.file_size / 1024)}KB)\n`
        // For text-based files, we would extract content here
        // For now, we note the file presence and type
        if (file.file_type?.includes('pdf')) {
          contentForAnalysis += `  [PDF document - contains formatted content]\n`
        } else if (file.file_type?.includes('word') || file.file_type?.includes('document')) {
          contentForAnalysis += `  [Word document - contains formatted content]\n`
        } else if (file.file_type?.includes('image')) {
          contentForAnalysis += `  [Image file - visual content]\n`
        }
      }
      contentForAnalysis += '\n'
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
            text: `You are an expert AI grading assistant for educational assignments. Grade the following student submission fairly and accurately.

Assignment Questions/Criteria:
${assignment_questions}

Assignment Type: ${assignment_type || 'general'}
Maximum Marks: ${max_marks}

Student Submission:
${contentForAnalysis}

Grading Instructions:
1. Evaluate based on the assignment questions and criteria
2. Consider completeness, accuracy, and quality of work
3. Provide constructive feedback
4. Award marks proportionally - partial credit for partial completion

Please provide your response as valid JSON only:
{
  "grade": <number between 0 and ${max_marks}>,
  "feedback": "<detailed feedback for the student>",
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<area for improvement 1>", "<area for improvement 2>"],
  "question_scores": [{"question": "<question or criteria>", "score": <points>, "max": <max points>}]
}`
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
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
      // Clean the response - remove markdown code blocks if present
      let cleanedResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      const gradingResult = JSON.parse(cleanedResponse)
      
      // Validate the grade is within bounds
      const grade = Math.min(Math.max(0, Number(gradingResult.grade)), max_marks)
      
      return NextResponse.json({
        grade,
        feedback: gradingResult.feedback || 'Auto-graded submission',
        strengths: gradingResult.strengths || [],
        improvements: gradingResult.improvements || [],
        question_scores: gradingResult.question_scores || [],
        auto_graded: true
      })
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Response:', aiResponse)
      // Fallback: extract grade and feedback from text response
      const gradeMatch = aiResponse.match(/grade[":]\s*(\d+(?:\.\d+)?)/i)
      const grade = gradeMatch ? Math.min(Math.max(0, parseFloat(gradeMatch[1])), max_marks) : Math.floor(max_marks * 0.7)
      
      return NextResponse.json({
        grade,
        feedback: aiResponse.substring(0, 500) || 'Auto-graded submission',
        strengths: [],
        improvements: [],
        auto_graded: true
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
