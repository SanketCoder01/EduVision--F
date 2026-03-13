import { type NextRequest, NextResponse } from "next/server"

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || "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"
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

export async function POST(request: NextRequest) {
  try {
    const { prompt, difficulty, fileContent } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Enhanced prompt with difficulty and file content
    let enhancedPrompt = prompt
    
    if (difficulty) {
      enhancedPrompt += `\n\nDifficulty Level: ${difficulty}`
      
      switch (difficulty.toLowerCase()) {
        case 'normal':
        case 'beginner':
          enhancedPrompt += "\nMake this assignment suitable for beginners with basic concepts and step-by-step guidance."
          break
        case 'intermediate':
          enhancedPrompt += "\nMake this assignment moderately challenging with some advanced concepts and problem-solving."
          break
        case 'hard':
        case 'advanced':
          enhancedPrompt += "\nMake this assignment challenging with complex concepts, critical thinking, and advanced problem-solving."
          break
      }
    }
    
    if (fileContent) {
      enhancedPrompt += `\n\nBased on the following file content, generate relevant questions and assignments:\n${fileContent}`
    }

    // System prompt for clean output
    const systemPrompt = "You are an educational content creator. Generate assignments in simple plain text format.\n\nIMPORTANT RULES:\n1. Do NOT use any markdown symbols like asterisks, dashes, hash, underscores, backticks, tildes, or any special characters\n2. Do NOT use bold, italic, or any formatting\n3. Use plain numbers like 1, 2, 3 for lists (not bullets or dashes)\n4. Keep language simple and easy to understand\n5. Use clear section headings without symbols\n6. If file content is provided (PDF, DOCX, PPT), generate questions based on ALL pages and slides content\n7. For presentations, consider each slide as a topic and generate relevant questions\n8. For documents, cover all sections and key concepts\n9. Add blank lines between each section for readability\n10. Add blank lines between each question for readability\n\nOutput format should be:\n\nTitle: [Assignment Title]\n\nDescription: [Brief description]\n\nObjectives:\n\n1. [First objective]\n\n2. [Second objective]\n\nQuestions:\n\n1. [First question]\n\n2. [Second question]\n\nRequirements:\n\n1. [First requirement]\n\n2. [Second requirement]\n\nEvaluation:\n\n[How it will be graded]"

    // Call Groq API
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + GROQ_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: enhancedPrompt
          }
        ],
        temperature: 0.7,
        max_completion_tokens: 8192,
        top_p: 1,
        stream: false
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Groq API error:", response.status, errorData)
      
      // Fallback to template-based generation
      const fallbackContent = generateSmartContent(prompt, difficulty)
      return NextResponse.json({ 
        content: fallbackContent,
        fallback: true,
        message: "Generated using fallback template due to API issues"
      })
    }

    const data = await response.json()
    let content = data.choices?.[0]?.message?.content || "No response generated"

    // Clean content - remove ALL markdown and special symbols
    content = cleanContent(content)

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error calling Groq API:", error)
    
    // Fallback to template-based generation
    const { prompt, difficulty } = await request.json().catch(() => ({ prompt: "", difficulty: "intermediate" }))
    const fallbackContent = generateSmartContent(prompt, difficulty)
    
    return NextResponse.json({ 
      content: fallbackContent,
      fallback: true,
      message: "Generated using fallback template due to API issues"
    })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Groq LLM API endpoint is working",
    status: "healthy",
    model: "openai/gpt-oss-120b",
    features: ["difficulty-based-generation", "file-content-processing", "fallback-templates"]
  })
}

function cleanContent(content: string): string {
  return content
    // Remove markdown headers (# symbols)
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^#{1,6}$/gm, '')
    // Remove bold/italic markers
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, ''))
    // Remove bullet points and convert to plain numbers if at line start
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*•\s+/gm, '')
    // Remove blockquotes
    .replace(/^>\s*/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}$/gm, '')
    // Remove strikethrough
    .replace(/~~([^~]+)~~/g, '$1')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Remove multiple consecutive asterisks or dashes
    .replace(/[*_~-]{2,}/g, '')
    // Clean up excessive whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    // Remove any remaining special formatting characters at line starts
    .replace(/^[\s*_-]+/gm, '')
    .trim()
}

function generateSmartContent(prompt: string, difficulty: string = "intermediate"): string {
  const lowerPrompt = prompt.toLowerCase()

  // Assignment generation templates
  if (lowerPrompt.includes("assignment") || lowerPrompt.includes("problem") || lowerPrompt.includes("exercise")) {
    if (lowerPrompt.includes("programming") || lowerPrompt.includes("coding") || lowerPrompt.includes("algorithm")) {
      const difficultyText = getDifficultyBasedContent(difficulty)
      return `Programming Assignment: Algorithm Implementation (${difficulty.toUpperCase()} Level)

Objective: Implement and analyze fundamental algorithms

${difficultyText.objectives}

Tasks:
1. Design and implement the specified algorithm
2. Analyze time and space complexity
3. Test with multiple input cases
4. Document your approach and findings
${difficultyText.additionalTasks}

Requirements:
1. Clean, well-commented code
2. Proper error handling
3. Performance analysis
4. Test cases with expected outputs
${difficultyText.additionalRequirements}

Evaluation Criteria:
1. Code correctness (40%)
2. Code quality and documentation (20%)
3. Testing thoroughness (20%)
4. Analysis and documentation (20%)

Submission Guidelines:
1. Submit source code files
2. Include a README with instructions
3. Provide test cases and results
4. Document any assumptions made`
    }
    
    if (lowerPrompt.includes("database") || lowerPrompt.includes("sql") || lowerPrompt.includes("data")) {
      const difficultyText = getDifficultyBasedContent(difficulty)
      return `Database Assignment: Data Modeling and Query Design (${difficulty.toUpperCase()} Level)

Objective: Design and implement database solutions

${difficultyText.objectives}

Tasks:
1. Analyze requirements and design database schema
2. Create normalized tables with proper constraints
3. Write SQL queries for various operations
4. Implement stored procedures if required
${difficultyText.additionalTasks}

Requirements:
1. ER diagram with relationships
2. Normalized table structures (3NF)
3. SQL scripts for table creation
4. Sample queries with expected outputs
${difficultyText.additionalRequirements}

Evaluation Criteria:
1. Schema design (30%)
2. Query correctness (30%)
3. Normalization (20%)
4. Documentation (20%)

Submission Guidelines:
1. Submit all SQL scripts
2. Include ER diagram
3. Provide sample data
4. Document design decisions`
    }
    
    if (lowerPrompt.includes("web") || lowerPrompt.includes("frontend") || lowerPrompt.includes("ui")) {
      const difficultyText = getDifficultyBasedContent(difficulty)
      return `Web Development Assignment: Frontend Application (${difficulty.toUpperCase()} Level)

Objective: Build a responsive web application

${difficultyText.objectives}

Tasks:
1. Design responsive UI/UX
2. Implement core functionality
3. Handle user interactions
4. Ensure cross-browser compatibility
${difficultyText.additionalTasks}

Requirements:
1. Responsive design
2. Clean, semantic HTML
3. Modern CSS styling
4. Interactive JavaScript features
${difficultyText.additionalRequirements}

Evaluation Criteria:
1. Design quality (25%)
2. Functionality (35%)
3. Code quality (20%)
4. Responsiveness (20%)

Submission Guidelines:
1. Submit all source files
2. Include screenshots
3. Provide deployment instructions
4. Document features implemented`
    }
  }

  // Default assignment template
  const difficultyText = getDifficultyBasedContent(difficulty)
  return `Assignment: ${prompt.substring(0, 50)}... (${difficulty.toUpperCase()} Level)

Objective: Complete the assigned task demonstrating understanding of core concepts

${difficultyText.objectives}

Tasks:
1. Analyze the problem requirements
2. Design your approach
3. Implement the solution
4. Test and validate your work
${difficultyText.additionalTasks}

Requirements:
1. Clear understanding of concepts
2. Well-documented work
3. Proper testing
4. Professional presentation
${difficultyText.additionalRequirements}

Evaluation Criteria:
1. Understanding (30%)
2. Implementation (30%)
3. Documentation (20%)
4. Testing (20%)

Submission Guidelines:
1. Submit all required files
2. Include documentation
3. Provide test results
4. Follow naming conventions`
}

function getDifficultyBasedContent(difficulty: string) {
  switch (difficulty?.toLowerCase()) {
    case 'normal':
    case 'beginner':
      return {
        objectives: "Goals: Understand basic concepts and apply them in simple scenarios",
        additionalTasks: "5. Review and verify your work\n6. Seek clarification if needed",
        additionalRequirements: "5. Clear explanations\n6. Step-by-step approach\n7. Basic documentation"
      }
    case 'hard':
    case 'advanced':
      return {
        objectives: "Goals: Master advanced concepts and apply them in complex, real-world scenarios",
        additionalTasks: "5. Optimize your solution\n6. Consider edge cases and error handling\n7. Provide performance analysis",
        additionalRequirements: "5. Advanced techniques\n6. Optimization considerations\n7. Comprehensive testing\n8. Critical analysis"
      }
    default:
      return {
        objectives: "Goals: Apply intermediate concepts with some complexity",
        additionalTasks: "5. Test with various inputs\n6. Document your approach",
        additionalRequirements: "5. Good practices\n6. Proper documentation\n7. Reasonable testing"
      }
  }
}
