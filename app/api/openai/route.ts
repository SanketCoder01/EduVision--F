import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 })
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You generate high-quality academic assignments. Respond with a single well-formatted markdown block including an explicit Title line followed by description, requirements, and evaluation criteria.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`OpenAI API error: ${response.status} ${errText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || "No response generated"

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error calling OpenAI API:", error)
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 })
  }
}


