import { type NextRequest, NextResponse } from "next/server"

const GROQ_API_KEY = process.env.GROQ_API_KEY || "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"
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

export async function POST(request: NextRequest) {
  try {
    const { extractedText, department } = await request.json()

    if (!extractedText) {
      return NextResponse.json({ error: "Extracted text is required" }, { status: 400 })
    }

    // Truncate text to avoid context length exceeded error
    const maxLength = 15000
    const truncatedText = extractedText.length > maxLength 
      ? extractedText.substring(0, maxLength) + '\n...[text truncated due to length]'
      : extractedText

    const systemPrompt = `You are an academic calendar extraction expert. Extract events from academic calendar text and return ONLY a valid JSON object.

CRITICAL RULES:
1. Return ONLY valid JSON, no markdown code blocks, no explanations
2. Extract ALL events, holidays, exams, deadlines mentioned
3. Use ISO date format (YYYY-MM-DD) for all dates

JSON FORMAT:
{
  "events": [
    {"title": "Event Title", "type": "exam", "date": "2024-03-15", "time": "10:00-12:00", "description": "Description"}
  ],
  "metadata": {"academicYear": "2024-2025", "semester": "Even", "totalEvents": 0, "exams": 0, "holidays": 0}
}

Event types: exam, practical, semester, assignment, holiday, event, deadline
Return ONLY the JSON object.`

    const userPrompt = `Extract academic calendar events from this text for ${department}:

${truncatedText}

Return ONLY JSON.`

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
        temperature: 0.1,
        max_tokens: 4096,
        top_p: 1,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Groq API error:", response.status, errorData)
      return NextResponse.json({ 
        error: "Failed to extract calendar",
        details: errorData 
      }, { status: 500 })
    }

    const data = await response.json()
    let content = data.choices?.[0]?.message?.content || ""

    try {
      // Remove markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      
      // Try to extract JSON from the content
      let jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        content = jsonMatch[0]
      }
      
      const parsed = JSON.parse(content)
      
      // Validate and return
      if (!parsed.events) {
        parsed.events = []
      }
      if (!parsed.metadata) {
        parsed.metadata = { totalEvents: parsed.events.length }
      }

      console.log('Extracted events:', parsed.events?.length || 0)
      return NextResponse.json(parsed)
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", content.substring(0, 500))
      return NextResponse.json({ 
        error: "Failed to parse calendar JSON",
        raw: content,
        parseError: parseError instanceof Error ? parseError.message : "Unknown parse error"
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Error extracting calendar:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
