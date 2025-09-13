import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Use real AI API integration
    const response = await generateOpenAIResponse(message)

    return NextResponse.json({ response })
  } catch (error) {
    console.error('AI Chat API Error:', error)
    // Fallback to Gemini if OpenAI fails
    try {
      const fallbackResponse = await generateGeminiResponse(message)
      return NextResponse.json({ response: fallbackResponse })
    } catch (fallbackError) {
      console.error('Fallback AI API Error:', fallbackError)
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again.' },
        { status: 503 }
      )
    }
  }
}

// OpenAI Integration
async function generateOpenAIResponse(userMessage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an AI tutor for computer science students at EduVision university. You help with:
          - Programming languages (Java, Python, C++, JavaScript, etc.)
          - Data structures and algorithms
          - Database management and SQL
          - Computer networks and protocols
          - Operating systems concepts
          - Web development
          - Software engineering principles
          - Assignment help and debugging
          - Exam preparation and study strategies
          
          Provide clear, educational explanations with examples when helpful. Be encouraging and supportive. If students share code, help them understand errors and suggest improvements. Always aim to teach concepts rather than just giving answers.`
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// Gemini Integration (Fallback)
async function generateGeminiResponse(userMessage: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured')
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are an AI tutor for computer science students. Help with programming, algorithms, databases, networks, and other CS topics. Be educational and supportive.

Student question: ${userMessage}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 800,
      }
    }),
  })

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}
