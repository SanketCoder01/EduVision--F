import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import path from "path"
import fs from "fs"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, userType, department, image } = body

    if (!firstName || !lastName || !userType || !department || !image) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Create faces directory if it doesn't exist
    const faceDbPath = path.join(process.cwd(), "public", "faces", userType)
    if (!fs.existsSync(faceDbPath)) {
      fs.mkdirSync(faceDbPath, { recursive: true })
    }

    // Save face image
    const fileName = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${userType}.jpg`
    const filePath = path.join(faceDbPath, fileName)

    // Convert base64 to buffer and save
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, "")
    const buffer = Buffer.from(base64Data, "base64")
    fs.writeFileSync(filePath, buffer)

    // Generate user credentials
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${userType === "faculty" ? "faculty" : "student"}.edu`
    const hashedPassword = await bcrypt.hash("password123", 10)
    const userId = `${userType.toUpperCase()}${Date.now().toString().slice(-6)}`

    // Save user data to localStorage simulation (since we're having DB issues)
    const userData = {
      id: userId,
      firstName,
      lastName,
      email,
      userType,
      department,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      verified: true,
      ...(userType === "student" && {
        studentId: `STU${Date.now().toString().slice(-6)}`,
        year: 2,
      }),
      ...(userType === "faculty" && {
        phone: "+1234567890",
      }),
    }

    // Try to save to database, but don't fail if it doesn't work
    try {
      const supabase = createServerSupabaseClient()

      if (userType === "faculty") {
        const { error } = await supabase.from("faculty").insert({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: "+1234567890",
          department: department,
          password: hashedPassword,
          verified: true,
        })

        if (error) {
          console.log("Database insert failed, continuing with file storage:", error.message)
        }
      } else {
        const { error } = await supabase.from("students").insert({
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: hashedPassword,
          student_id: userData.studentId,
          department: department,
          year: 2,
        })

        if (error) {
          console.log("Database insert failed, continuing with file storage:", error.message)
        }
      }
    } catch (dbError) {
      console.log("Database operation failed, continuing with file storage:", dbError)
    }

    // Save user data to a JSON file as backup
    const usersDbPath = path.join(process.cwd(), "public", "data")
    if (!fs.existsSync(usersDbPath)) {
      fs.mkdirSync(usersDbPath, { recursive: true })
    }

    const usersFilePath = path.join(usersDbPath, "users.json")
    let existingUsers = []

    try {
      if (fs.existsSync(usersFilePath)) {
        const fileContent = fs.readFileSync(usersFilePath, "utf8")
        existingUsers = JSON.parse(fileContent)
      }
    } catch (error) {
      console.log("Could not read existing users file, starting fresh")
      existingUsers = []
    }

    existingUsers.push(userData)
    fs.writeFileSync(usersFilePath, JSON.stringify(existingUsers, null, 2))

    return NextResponse.json({
      success: true,
      message: "Face data saved successfully",
      fileName: fileName,
      userId: userId,
      email: email,
    })
  } catch (error) {
    console.error("Save face error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to save face data: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
