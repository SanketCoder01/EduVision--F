import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY || 'gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

const SYSTEM_PROMPT = `You are an AI Tutor for university students. Your role is to:
1. Help students understand academic concepts in simple, clear language
2. Provide step-by-step explanations for problems
3. Give examples and analogies to make concepts easier to understand
4. Encourage learning and curiosity

IMPORTANT RULES:
1. ONLY answer questions related to studies, academics, subjects, learning, or educational topics
2. If a student asks about anything unrelated to studies (politics, entertainment, personal advice, etc.), politely decline and remind them you're an educational AI tutor
3. Be patient, friendly, and encouraging
4. Use simple language that students can understand
5. Break down complex topics into smaller, digestible parts
6. Provide practical examples when possible

FORMATTING RULES:
1. Use numbered lists (1. 2. 3.) for steps or points
2. Use plain text only - NO asterisks (*), NO hashtags (#), NO dashes (-), NO markdown formatting
3. Use "Step 1:", "Step 2:" for procedures
4. Use "Example:" before giving examples
5. Keep responses clean and easy to read
6. Use line breaks to separate sections

If asked about non-academic topics, respond with:
"I'm sorry, I'm an AI Tutor designed specifically to help with academic and educational questions. I can help you with subjects like programming, mathematics, science, engineering concepts, study techniques, and more. What would you like to learn about today?"`

export async function POST(request: NextRequest) {
  try {
    const { message, subject } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `[Subject: ${subject || 'General'}] ${message}` }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Groq API error:', error)
      return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 })
    }

    const data = await response.json()
    const aiMessage = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.'

    return NextResponse.json({ message: aiMessage })
  } catch (error: any) {
    console.error('AI Tutor API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
