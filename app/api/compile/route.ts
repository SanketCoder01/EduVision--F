import { type NextRequest, NextResponse } from "next/server"

const CLIENT_ID = "cd3e0dbfce3f3cb9817594c65d22208c"
const CLIENT_SECRET = "ecf6830e95e5d631d4a978a9738187a3ba548f6e57e24a1a5a2a60e49481ce1a"

export async function POST(request: NextRequest) {
  try {
    const { language, code, input = "" } = await request.json()

    // Map language names to API format
    const languageMap: { [key: string]: string } = {
      c: "c",
      cpp: "cpp",
      java: "java",
      python: "python3",
      javascript: "nodejs",
      sql: "sql",
    }

    const apiLanguage = languageMap[language] || language

    // Prepare the compilation request
    const compilationData = {
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      script: code,
      language: apiLanguage,
      versionIndex: "0",
      stdin: input,
    }

    // Make request to compilation API
    const response = await fetch("https://api.jdoodle.com/v1/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(compilationData),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      output: result.output || "No output",
      error: result.error || null,
      executionTime: result.cpuTime || "0s",
      memory: result.memory || "0KB",
    })
  } catch (error) {
    console.error("Compilation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Compilation failed",
        output: "Error: Failed to execute code. Please try again.",
      },
      { status: 500 },
    )
  }
}
