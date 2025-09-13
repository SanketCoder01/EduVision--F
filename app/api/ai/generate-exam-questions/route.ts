import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { 
      language, 
      difficulty, 
      topics, 
      numQuestions, 
      examDuration,
      totalMarks 
    } = await request.json()

    // Using RapidAPI for AI question generation (similar to existing AI integrations)
    const response = await fetch('https://chatgpt-api8.p.rapidapi.com/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': '125374e0dcmsh59d081fe0522ae1p12043ejsn18fb0aff111b',
        'X-RapidAPI-Host': 'chatgpt-api8.p.rapidapi.com'
      },
      body: JSON.stringify({
        query: `Generate ${numQuestions} coding exam questions for ${language} programming language.
        
        Requirements:
        - Difficulty level: ${difficulty}
        - Topics: ${topics.join(', ')}
        - Total exam duration: ${examDuration} minutes
        - Total marks: ${totalMarks}
        - Each question should have: problem statement, input/output format, constraints, sample test cases
        - Questions should be progressively challenging
        - Include edge cases in test cases
        
        Format the response as JSON with this structure:
        {
          "questions": [
            {
              "id": "q1",
              "title": "Question Title",
              "description": "Detailed problem statement",
              "difficulty": "easy|medium|hard",
              "marks": 20,
              "timeLimit": "30 minutes",
              "inputFormat": "Input description",
              "outputFormat": "Output description",
              "constraints": "Constraints list",
              "sampleInput": "Sample input",
              "sampleOutput": "Sample output",
              "testCases": [
                {
                  "input": "test input",
                  "expectedOutput": "expected output",
                  "isHidden": false
                }
              ],
              "hints": ["Hint 1", "Hint 2"],
              "tags": ["array", "sorting"]
            }
          ]
        }`,
        web_access: false
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate questions')
    }

    const aiResponse = await response.json()
    
    // Parse the AI response and extract questions
    let questions
    try {
      // Try to parse JSON from AI response
      const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        // Fallback: generate sample questions if AI parsing fails
        questions = generateFallbackQuestions(language, difficulty, numQuestions, totalMarks)
      }
    } catch (parseError) {
      // Generate fallback questions
      questions = generateFallbackQuestions(language, difficulty, numQuestions, totalMarks)
    }

    return NextResponse.json({
      success: true,
      questions: questions.questions || questions,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error generating exam questions:', error)
    
    // Return fallback questions on error
    const fallbackQuestions = generateFallbackQuestions(
      'Python', 
      'medium', 
      3, 
      100
    )
    
    return NextResponse.json({
      success: true,
      questions: fallbackQuestions.questions,
      generatedAt: new Date().toISOString(),
      note: 'Using fallback questions due to API error'
    })
  }
}

function generateFallbackQuestions(language: string, difficulty: string, numQuestions: number, totalMarks: number) {
  const marksPerQuestion = Math.floor(totalMarks / numQuestions)
  
  const questionTemplates = {
    easy: [
      {
        title: "Even or Odd Checker",
        description: "Write a program to check if a given number is even or odd.",
        inputFormat: "A single integer n",
        outputFormat: "Print 'Even' if the number is even, 'Odd' otherwise",
        sampleInput: "4",
        sampleOutput: "Even",
        constraints: "1 ≤ n ≤ 1000"
      },
      {
        title: "Sum of Array Elements",
        description: "Calculate the sum of all elements in an array.",
        inputFormat: "First line contains n (size of array), second line contains n integers",
        outputFormat: "Print the sum of all elements",
        sampleInput: "3\n1 2 3",
        sampleOutput: "6",
        constraints: "1 ≤ n ≤ 100, 1 ≤ elements ≤ 1000"
      }
    ],
    medium: [
      {
        title: "Fibonacci Sequence",
        description: "Generate the nth Fibonacci number using dynamic programming.",
        inputFormat: "A single integer n",
        outputFormat: "Print the nth Fibonacci number",
        sampleInput: "5",
        sampleOutput: "5",
        constraints: "1 ≤ n ≤ 50"
      },
      {
        title: "Binary Search Implementation",
        description: "Implement binary search to find an element in a sorted array.",
        inputFormat: "First line: n (array size), Second line: n sorted integers, Third line: target element",
        outputFormat: "Print the index of target element (0-based) or -1 if not found",
        sampleInput: "5\n1 3 5 7 9\n5",
        sampleOutput: "2",
        constraints: "1 ≤ n ≤ 1000, elements are sorted"
      }
    ],
    hard: [
      {
        title: "Longest Common Subsequence",
        description: "Find the length of the longest common subsequence between two strings.",
        inputFormat: "Two strings on separate lines",
        outputFormat: "Print the length of LCS",
        sampleInput: "ABCDGH\nAEDFHR",
        sampleOutput: "3",
        constraints: "String length ≤ 1000"
      },
      {
        title: "Graph Traversal - DFS",
        description: "Implement Depth First Search traversal for a graph.",
        inputFormat: "First line: n (vertices), m (edges), Next m lines: edge pairs",
        outputFormat: "Print DFS traversal starting from vertex 0",
        sampleInput: "4 4\n0 1\n0 2\n1 2\n2 3",
        sampleOutput: "0 1 2 3",
        constraints: "1 ≤ n ≤ 100, 0 ≤ m ≤ n*(n-1)/2"
      }
    ]
  }

  const templates = questionTemplates[difficulty as keyof typeof questionTemplates] || questionTemplates.medium
  const questions = []

  for (let i = 0; i < numQuestions; i++) {
    const template = templates[i % templates.length]
    questions.push({
      id: `q${i + 1}`,
      title: template.title,
      description: template.description,
      difficulty,
      marks: marksPerQuestion,
      timeLimit: `${Math.floor(120 / numQuestions)} minutes`,
      inputFormat: template.inputFormat,
      outputFormat: template.outputFormat,
      constraints: template.constraints,
      sampleInput: template.sampleInput,
      sampleOutput: template.sampleOutput,
      testCases: [
        {
          input: template.sampleInput,
          expectedOutput: template.sampleOutput,
          isHidden: false
        },
        {
          input: "Additional test case",
          expectedOutput: "Expected output",
          isHidden: true
        }
      ],
      hints: [
        "Consider the problem constraints carefully",
        "Think about edge cases",
        "Optimize for time complexity"
      ],
      tags: ["programming", language.toLowerCase(), difficulty]
    })
  }

  return { questions }
}
