import { type NextRequest, NextResponse } from "next/server"
import { initializeDatabase } from "@/app/actions/database-actions"

export async function POST(request: NextRequest) {
  try {
    const result = await initializeDatabase()
    
    return NextResponse.json({
      success: result.success,
      message: result.message || "Database initialized successfully"
    })
  } catch (error) {
    console.error("Error in database initialization API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to initialize database",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
