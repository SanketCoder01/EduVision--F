import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { studentName, assignmentTitle, grade, feedback, subject, weakAreas, strongAreas } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
You are an AI educational assistant providing personalized feedback to a student. Generate encouraging and constructive suggestions based on their assignment performance.

Student Details:
- Name: ${studentName}
- Assignment: ${assignmentTitle}
- Subject: ${subject}
- Grade: ${grade}
- Feedback: ${feedback}
- Weak Areas: ${weakAreas?.join(', ') || 'None identified'}
- Strong Areas: ${strongAreas?.join(', ') || 'None identified'}

Please provide:
1. A personalized encouraging message addressing the student by name
2. Specific areas for improvement with actionable suggestions
3. Recognition of strengths and how to build on them
4. Study recommendations and resources
5. Motivational closing statement

Keep the tone positive, constructive, and encouraging. Make suggestions specific and actionable.
Format the response in a friendly, conversational manner.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const suggestions = response.text()

    return NextResponse.json({
      success: true,
      suggestions: suggestions,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI Suggestions Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI suggestions' },
      { status: 500 }
    )
  }
}
