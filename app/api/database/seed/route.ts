import { type NextRequest, NextResponse } from "next/server"
import { seedDatabase } from "@/app/actions/database-actions"

export async function POST(request: NextRequest) {
  try {
    const result = await seedDatabase()
    
    return NextResponse.json({
      success: result.success,
      message: "Database seeded successfully"
    })
  } catch (error) {
    console.error("Error in database seeding API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to seed database",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
