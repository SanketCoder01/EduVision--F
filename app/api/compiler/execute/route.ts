import { NextRequest, NextResponse } from 'next/server'

// JDoodle API configuration
const JDOODLE_CLIENT_ID = '7ff361a67719d03ea8956693333e2093'
const JDOODLE_CLIENT_SECRET = '51cdf24b43d20d3e420e5379dac880df6220127c456ea183ba9723f4763ddef4'

// Language mapping for JDoodle
const LANGUAGE_MAP: Record<string, { language: string; versionIndex: string }> = {
  c: { language: 'c', versionIndex: '5' },
  cpp: { language: 'cpp', versionIndex: '5' },
  python3: { language: 'python3', versionIndex: '4' },
  java: { language: 'java', versionIndex: '5' },
  javascript: { language: 'nodejs', versionIndex: '4' },
  go: { language: 'go', versionIndex: '4' },
  typescript: { language: 'typescript', versionIndex: '4' },
  csharp: { language: 'csharp', versionIndex: '5' },
  php: { language: 'php', versionIndex: '4' },
  ruby: { language: 'ruby', versionIndex: '4' },
  rust: { language: 'rust', versionIndex: '4' },
  swift: { language: 'swift', versionIndex: '4' },
  kotlin: { language: 'kotlin', versionIndex: '3' },
  scala: { language: 'scala', versionIndex: '3' },
  perl: { language: 'perl', versionIndex: '6' },
  bash: { language: 'bash', versionIndex: '4' },
  sql: { language: 'sql', versionIndex: '4' },
  r: { language: 'r', versionIndex: '4' },
  objectivec: { language: 'objectivec', versionIndex: '4' },
  fsharp: { language: 'fsharp', versionIndex: '4' },
  clojure: { language: 'clojure', versionIndex: '4' },
  groovy: { language: 'groovy', versionIndex: '4' },
  vbnet: { language: 'vbnet', versionIndex: '4' },
}

export async function POST(request: NextRequest) {
  let code = ''
  let language = ''
  let input = ''
  
  try {
    const body = await request.json()
    code = body.code || ''
    language = body.language || 'python3'
    input = body.input || ''

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    const langConfig = LANGUAGE_MAP[language]
    if (!langConfig) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 })
    }

    // Execute code using JDoodle API
    const response = await fetch('https://api.jdoodle.com/v1/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: JDOODLE_CLIENT_ID,
        clientSecret: JDOODLE_CLIENT_SECRET,
        script: code,
        language: langConfig.language,
        versionIndex: langConfig.versionIndex,
        stdin: input,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('JDoodle API error:', errorText)
      return NextResponse.json({ 
        error: 'Failed to execute code',
        details: errorText 
      }, { status: 500 })
    }

    const result = await response.json()

    // Format the response
    return NextResponse.json({
      status: result.statusCode === 0 ? 'Accepted' : 'Error',
      stdout: result.output || '',
      stderr: result.error || '',
      compile_output: '',
      time: result.cpuTime || '0',
      memory: result.memory || '0',
      exit_code: result.statusCode || 0,
    })
  } catch (error: any) {
    console.error('Compiler API error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}
