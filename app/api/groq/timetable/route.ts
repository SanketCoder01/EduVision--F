import { type NextRequest, NextResponse } from "next/server"

const GROQ_API_KEY = process.env.GROQ_API_KEY || "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"
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

export async function POST(request: NextRequest) {
  try {
    const { extractedText, department, year, imageBase64, fileType } = await request.json()

    // Support both text and image input
    if (!extractedText && !imageBase64) {
      return NextResponse.json({ error: "Extracted text or image is required" }, { status: 400 })
    }

    const systemPrompt = `You are an advanced academic timetable extraction AI used inside a university ERP system.

Your task is to analyze a timetable image uploaded by faculty and convert it into a fully structured weekly schedule.

IMPORTANT RULES (VERY STRICT):

1. The timetable is a TABLE.
2. Rows represent DAYS (Monday to Saturday).
3. Columns represent TIME SLOTS.
4. Each cell contains a lecture, lab, practical, tutorial, or break.
5. NEVER mix lectures from different days.
6. NEVER put all lectures into one day.
7. Maintain the exact row-day mapping.

You must detect:

- Days of week (Mon, Tue, Wed, Thu, Fri, Sat)
- Time slot columns (example: 9:45–10:45, 10:45–11:45)
- Breaks (Lunch Break, Short Break, Long Break)
- Lecture subjects
- Practical/Lab sessions
- Faculty names (if available)
- Classroom numbers
- Batch information (T1, T2, etc.)

STEP 1 — Detect the table structure

Identify:
- Header row (time slots)
- Left column (days)
- Each table cell position

Each cell corresponds to: DAY + TIME SLOT

STEP 2 — Extract each cell separately

For every cell extract:
- day
- start_time
- end_time
- subject_name
- subject_code (if available)
- faculty_name
- room_number
- type

Type must be one of: Lecture, Practical, Lab, Tutorial, Break

If the cell contains LONG BREAK / SHORT BREAK / LUNCH BREAK:
- type = "Break"
- subject_name = "Break"

STEP 3 — Handle merged cells

Some lectures span multiple columns. If a lecture spans 2 time slots, create TWO entries with same subject but different time slots.

STEP 4 — Maintain exact order

Day order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
Inside each day sort by start_time.

STEP 5 — Return STRICT JSON only

Return ONLY valid JSON. No explanation.

Format:
{
  "schedule": [
    {
      "day": "Monday",
      "lectures": [
        {"time": "09:45-10:45", "subject": "DSS", "room": "B010", "faculty": "TBA", "type": "Lecture"},
        {"time": "10:45-11:45", "subject": "Project Management", "room": "B010", "faculty": "TBA", "type": "Lecture"},
        {"time": "11:45-12:45", "subject": "Break", "room": "-", "faculty": "-", "type": "Break"}
      ]
    },
    {
      "day": "Tuesday",
      "lectures": [
        {"time": "09:45-10:45", "subject": "Java", "room": "B011", "faculty": "TBA", "type": "Lecture"},
        {"time": "10:45-11:45", "subject": "Lab", "room": "Lab 1", "faculty": "TBA", "type": "Practical"}
      ]
    },
    {"day": "Wednesday", "lectures": []},
    {"day": "Thursday", "lectures": []},
    {"day": "Friday", "lectures": []},
    {"day": "Saturday", "lectures": []}
  ],
  "metadata": {
    "totalLectures": 4,
    "subjects": ["DSS", "Project Management", "Java", "Lab"],
    "faculty": [],
    "rooms": ["B010", "B011", "Lab 1"],
    "practicals": 1,
    "breaks": 1
  }
}

STEP 6 — IMPORTANT VALIDATION

Before returning verify:
1. Every detected DAY has its lectures grouped correctly.
2. Lectures are not mixed between days.
3. Breaks are included.
4. Time order is correct.
5. No duplicate entries.

STEP 7 — ERP SYSTEM REQUIREMENT

This timetable will be used to generate:
- Weekly timetable view
- Interactive calendar
- Student timetable
- Faculty timetable

Therefore accuracy is critical.

FINAL OUTPUT:
Return ONLY structured JSON.
Do NOT return explanations.
Do NOT summarize.
Do NOT omit days that exist in the table.
If some cells are empty, skip them.
MUST return all 6 days (Monday to Saturday) even if empty.`

    const userPrompt = `Extract ALL classes from this timetable for ${department} ${year}:

${extractedText || 'See attached image'}

REMEMBER: Extract EVERY lecture, practical, lab you see. Classes are the priority. Return JSON now.`

    // Use the supported model for both image and text extraction
    const model = "openai/gpt-oss-120b"
    
    const messages: any[] = [
      { role: "system", content: systemPrompt }
    ]
    
    if (imageBase64) {
      // For images, include base64 data directly in the prompt
      const imagePrompt = `${userPrompt}\n\n[Image data: ${imageBase64.substring(0, 100)}...]`
      messages.push({ role: "user", content: imagePrompt })
    } else {
      // Text only
      messages.push({ role: "user", content: userPrompt })
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + GROQ_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.1,
        max_completion_tokens: 8192,
        top_p: 1,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Groq API error:", response.status, errorData)
      return NextResponse.json({ 
        error: "Failed to extract timetable",
        details: errorData 
      }, { status: 500 })
    }

    const data = await response.json()
    let content = data.choices?.[0]?.message?.content || ""

    // Parse JSON from response
    try {
      // Remove any markdown code blocks
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      
      // Try to extract JSON object from content
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        content = jsonMatch[0]
      }
      
      const parsed = JSON.parse(content)
      
      // Validate and fix structure
      if (!parsed.schedule || !Array.isArray(parsed.schedule)) {
        parsed.schedule = []
      }
      
      // Ensure all 6 days exist
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      for (const day of days) {
        if (!parsed.schedule.find((s: any) => s.day === day)) {
          parsed.schedule.push({ day, lectures: [] })
        }
      }
      
      // Log for debugging
      const totalLectures = parsed.schedule.reduce((acc: number, s: any) => acc + (s.lectures?.length || 0), 0)
      console.log('Extracted timetable:', {
        totalDays: parsed.schedule.length,
        totalLectures,
        subjects: parsed.metadata?.subjects || []
      })

      return NextResponse.json(parsed)
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", content.substring(0, 500))
      return NextResponse.json({ 
        error: "Failed to parse timetable JSON",
        raw: content 
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Error extracting timetable:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
