import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const prompt = formData.get('prompt') as string
    const questionTypes = JSON.parse(formData.get('questionTypes') as string || '["mcq"]')
    const difficulty = formData.get('difficulty') as string || 'medium'
    const numQuestions = parseInt(formData.get('numQuestions') as string || '20')
    const file = formData.get('file') as File | null

    let contentToProcess = prompt || ''

    // If file is uploaded, extract text from it
    if (file) {
      const fileBuffer = await file.arrayBuffer()
      const fileType = file.name.split('.').pop()?.toLowerCase()

      if (fileType === 'txt') {
        contentToProcess += '\n' + new TextDecoder().decode(fileBuffer)
      } else if (fileType === 'pdf') {
        contentToProcess += '\n[PDF content extraction - in production, use pdf-parse library]'
      } else if (fileType === 'docx') {
        contentToProcess += '\n[DOCX content extraction - in production, use mammoth library]'
      }
    }

    // Build the prompt for AI
    const questionTypeDescriptions = {
      mcq: 'Multiple Choice Questions with 4 options (A, B, C, D) and one correct answer',
      true_false: 'True/False questions with a statement and correct answer as true or false',
      fill_blank: 'Fill in the blank questions with ___ representing the blank and the correct answer',
      descriptive: 'Descriptive questions requiring detailed answers'
    }

    const selectedTypes = questionTypes.map((type: string) => questionTypeDescriptions[type as keyof typeof questionTypeDescriptions] || type).join(', ')

    const aiPrompt = `You are an expert quiz question generator. Generate ${numQuestions} quiz questions based on the following content.

Content/Topic: ${contentToProcess || 'General knowledge'}

Requirements:
- Question types to include: ${selectedTypes}
- Difficulty level: ${difficulty}
- Generate exactly ${numQuestions} questions
- For MCQ: Provide 4 options labeled A, B, C, D and specify the correct answer
- For True/False: Provide the statement and whether it's true or false
- For Fill in blanks: Use ___ for the blank and provide the correct answer
- For Descriptive: Provide the question and a sample answer for reference

IMPORTANT: Return ONLY valid JSON with no additional text. Use this exact structure:
{
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "The question text",
      "options": {
        "A": "Option A text",
        "B": "Option B text", 
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctAnswer": "A",
      "points": 1,
      "difficulty": "${difficulty}",
      "explanation": "Brief explanation of the answer"
    }
  ]
}

Generate diverse and challenging questions that test understanding of the content. Return ONLY the JSON object, no markdown code blocks or additional text.`

    // Call Groq API for LLM question generation
    let questions = null
    
    console.log('Calling Groq API with prompt length:', aiPrompt.length)
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an expert quiz question generator. Always respond with valid JSON only, no markdown code blocks or additional text.'
            },
            {
              role: 'user',
              content: aiPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 8192,
          top_p: 1,
          stream: false
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (response.ok) {
        const aiResponse = await response.json()
        console.log('Groq Response received:', JSON.stringify(aiResponse).substring(0, 500))

        // Parse the AI response
        if (aiResponse.choices && aiResponse.choices[0] && aiResponse.choices[0].message) {
          const responseText = aiResponse.choices[0].message.content
          console.log('Response text:', responseText.substring(0, 500))
          
          try {
            // Try to extract JSON from the response
            let parsed
            try {
              parsed = JSON.parse(responseText)
            } catch {
              // Try to find JSON object with questions
              const jsonPatterns = [
                /\{[\s\S]*?"questions"[\s\S]*?\}/g,
                /\[[\s\S]*?\]/g,
                /\{[\s\S]*?\}/g
              ]
              
              for (const pattern of jsonPatterns) {
                const matches = responseText.match(pattern)
                if (matches) {
                  for (const match of matches) {
                    try {
                      const attempt = JSON.parse(match)
                      if (attempt.questions || Array.isArray(attempt)) {
                        parsed = attempt
                        break
                      }
                    } catch {
                      continue
                    }
                  }
                  if (parsed) break
                }
              }
            }
            
            if (parsed) {
              if (Array.isArray(parsed)) {
                questions = parsed
              } else if (parsed.questions && Array.isArray(parsed.questions)) {
                questions = parsed.questions
              }
              console.log('Successfully parsed', questions?.length, 'questions from Groq AI')
            }
          } catch (parseError) {
            console.error('Parse error:', parseError)
          }
        }
      } else {
        console.log('Groq API response not ok:', response.status, response.statusText)
      }
    } catch (apiError: any) {
      console.error('Groq API error:', apiError?.message || apiError)
    }

    // Use fallback if AI failed or returned no valid questions
    if (!questions || questions.length === 0) {
      console.log('Using fallback questions - AI returned:', questions?.length || 0)
      questions = generateFallbackQuestions(questionTypes, difficulty, numQuestions)
    }

    // Ensure questions have correct format
    questions = questions.map((q: any, index: number) => ({
      id: `q${index + 1}`,
      type: q.type || questionTypes[index % questionTypes.length],
      question: q.question || q.question_text || `Question ${index + 1}`,
      options: q.options || (q.type === 'mcq' ? { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' } : undefined),
      correctAnswer: q.correctAnswer || q.correct_answer || 'A',
      points: q.points || 1,
      difficulty: q.difficulty || difficulty,
      explanation: q.explanation || ''
    }))

    return NextResponse.json({
      success: true,
      questions,
      generatedAt: new Date().toISOString(),
      source: questions.length > 0 && questions[0].question.includes('time complexity') ? 'fallback' : 'ai_generated',
      count: questions.length
    })

  } catch (error) {
    console.error('Error generating quiz questions:', error)
    
    // Return fallback questions
    const fallbackQuestions = generateFallbackQuestions(['mcq'], 'medium', 20)
    
    return NextResponse.json({
      success: true,
      questions: fallbackQuestions,
      generatedAt: new Date().toISOString(),
      source: 'fallback_error',
      note: 'Using fallback questions due to error'
    })
  }
}

function generateFallbackQuestions(questionTypes: string[], difficulty: string, numQuestions: number) {
  const questions = []
  
  const templates = {
    mcq: [
      { question: 'What is the time complexity of binary search?', options: { A: 'O(n)', B: 'O(log n)', C: 'O(n²)', D: 'O(1)' }, correctAnswer: 'B' },
      { question: 'Which data structure uses LIFO principle?', options: { A: 'Queue', B: 'Stack', C: 'Array', D: 'Tree' }, correctAnswer: 'B' },
      { question: 'What is the primary key in a database?', options: { A: 'Foreign key', B: 'Unique identifier', C: 'Index', D: 'Constraint' }, correctAnswer: 'B' },
    ],
    true_false: [
      { question: 'Python is a compiled language.', correctAnswer: 'false' },
      { question: 'HTTP stands for HyperText Transfer Protocol.', correctAnswer: 'true' },
      { question: 'RAM is non-volatile memory.', correctAnswer: 'false' },
    ],
    fill_blank: [
      { question: 'The process of finding errors in code is called ___.', correctAnswer: 'debugging' },
      { question: 'A ___ is a collection of related data fields.', correctAnswer: 'record' },
      { question: 'The ___ layer is responsible for routing in the OSI model.', correctAnswer: 'network' },
    ],
    descriptive: [
      { question: 'Explain the concept of object-oriented programming.', correctAnswer: 'OOP is a programming paradigm based on objects containing data and code.' },
      { question: 'What is the difference between TCP and UDP?', correctAnswer: 'TCP is connection-oriented and reliable, UDP is connectionless and faster but unreliable.' },
    ]
  }

  for (let i = 0; i < numQuestions; i++) {
    const type = questionTypes[i % questionTypes.length] || 'mcq'
    const typeTemplates = templates[type as keyof typeof templates] || templates.mcq
    const template = typeTemplates[i % typeTemplates.length]

    questions.push({
      id: `q${i + 1}`,
      type,
      question: template.question,
      options: type === 'mcq' ? (template as any).options : undefined,
      correctAnswer: template.correctAnswer,
      points: 1,
      difficulty,
      explanation: ''
    })
  }

  return questions
}
