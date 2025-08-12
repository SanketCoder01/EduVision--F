import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { userData } = await request.json()

    // Path to the Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'camera_capture.py')
    
    return new Promise((resolve) => {
      // Spawn Python process
      const pythonProcess = spawn('python', [scriptPath, JSON.stringify(userData)], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let output = ''
      let error = ''

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString()
      })

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString()
      })

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            // Parse the JSON output from Python script
            const result = JSON.parse(output.trim())
            resolve(NextResponse.json(result))
          } catch (parseError) {
            resolve(NextResponse.json({
              success: false,
              error: 'Failed to parse capture result'
            }, { status: 500 }))
          }
        } else {
          resolve(NextResponse.json({
            success: false,
            error: error || 'Photo capture failed'
          }, { status: 500 }))
        }
      })

      pythonProcess.on('error', (err) => {
        resolve(NextResponse.json({
          success: false,
          error: `Failed to start capture process: ${err.message}`
        }, { status: 500 }))
      })
    })

  } catch (error) {
    console.error('Photo capture API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Photo capture API endpoint',
    requirements: [
      'Python 3.x installed',
      'OpenCV (cv2) library installed',
      'Camera access permissions'
    ]
  })
}
