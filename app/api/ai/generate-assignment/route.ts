import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { prompt, subject, difficulty, assignmentType } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    // Use OpenAI GPT for assignment generation
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert educational content creator. Generate comprehensive assignments that are educational, engaging, and well-structured."
        },
        {
          role: "user",
          content: `Create a comprehensive assignment based on the following requirements:

Subject: ${subject || 'General'}
Difficulty: ${difficulty || 'medium'}
Type: ${assignmentType || 'mixed'}

User Request: ${prompt}

Please generate a detailed assignment with the following structure:
1. Assignment Title
2. Detailed Description (objectives and context)
3. Main Question/Problem Statement
4. Step-by-step Instructions
5. Rules and Guidelines
6. Evaluation Criteria

Make the assignment educational, engaging, and appropriate for the specified difficulty level. Include specific requirements, constraints, and expected deliverables.`
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const aiResponse = response.choices[0]?.message?.content || '';
    
    if (!aiResponse || aiResponse.length < 50) {
      // If AI response is too short, use fallback
      const fallbackData = generateFallbackAssignment(prompt, subject, difficulty);
      return NextResponse.json({
        success: true,
        data: fallbackData
      });
    }
    
    // Extract structured data from AI response
    const assignmentData = parseAssignmentResponse(aiResponse, prompt, subject, difficulty);

    return NextResponse.json({
      success: true,
      data: assignmentData
    });

  } catch (error) {
    console.error('Assignment generation error:', error);
    
    // More detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      openaiApiKey: process.env.OPENAI_API_KEY ? 'Present' : 'Missing',
      timestamp: new Date().toISOString()
    };
    
    console.error('Detailed error info:', errorDetails);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate assignment',
        details: errorDetails.message,
        debug: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  }
}

function parseAssignmentResponse(aiResponse: string, originalPrompt: string, subject?: string, difficulty?: string) {
  // Extract title from AI response or generate one
  const titleMatch = aiResponse.match(/(?:Title|Assignment Title)[:\-]\s*(.+?)(?:\n|$)/i);
  const title = titleMatch ? titleMatch[1].trim() : generateTitleFromPrompt(originalPrompt);

  // Extract description
  const descriptionMatch = aiResponse.match(/(?:Description|Detailed Description)[:\-]\s*([\s\S]*?)(?:\n(?:\d+\.|[A-Z][a-z]+ [A-Z])|$)/i);
  const description = descriptionMatch ? descriptionMatch[1].trim() : `Assignment on ${subject || 'the specified topic'} with ${difficulty || 'medium'} difficulty level.`;

  // Extract main question
  const questionMatch = aiResponse.match(/(?:Question|Problem Statement|Main Question)[:\-]\s*([\s\S]*?)(?:\n(?:\d+\.|[A-Z][a-z]+ [A-Z])|$)/i);
  const question = questionMatch ? questionMatch[1].trim() : extractMainContent(aiResponse);

  // Extract instructions
  const instructionsMatch = aiResponse.match(/(?:Instructions|Step-by-step Instructions)[:\-]\s*([\s\S]*?)(?:\n(?:\d+\.|[A-Z][a-z]+ [A-Z])|$)/i);
  const instructions = instructionsMatch ? instructionsMatch[1].trim() : 'Follow the assignment requirements and submit your work by the due date.';

  // Extract rules
  const rulesMatch = aiResponse.match(/(?:Rules|Guidelines|Rules and Guidelines)[:\-]\s*([\s\S]*?)(?:\n(?:\d+\.|[A-Z][a-z]+ [A-Z])|$)/i);
  const rules = rulesMatch ? rulesMatch[1].trim() : 'Ensure original work and proper citations where applicable.';

  return {
    title,
    description,
    question,
    instructions,
    rules,
    generatedAt: new Date().toISOString(),
    source: 'RapidAPI ChatGPT',
    originalPrompt
  };
}

function generateTitleFromPrompt(prompt: string): string {
  // Extract key terms from prompt to generate title
  const words = prompt.split(' ').filter(word => word.length > 3);
  const keyWords = words.slice(0, 4).join(' ');
  return `Assignment: ${keyWords}`;
}

function generateFallbackAssignment(prompt: string, subject?: string, difficulty?: string) {
  const title = `Assignment: ${prompt.split(' ').slice(0, 6).join(' ')}`;
  const description = `This assignment focuses on ${prompt.toLowerCase()}. Students will demonstrate their understanding of key concepts in ${subject || 'the subject area'} through comprehensive analysis and practical application.`;
  
  let instructions = "1. Read the requirements carefully\n2. Plan your approach before starting\n3. Show your work and reasoning\n4. Submit by the due date";
  
  if (prompt.toLowerCase().includes('program') || prompt.toLowerCase().includes('code')) {
    instructions = "1. Write clean, well-documented code\n2. Test your solution thoroughly\n3. Submit source code and documentation\n4. Follow coding best practices";
  } else if (prompt.toLowerCase().includes('essay') || prompt.toLowerCase().includes('write')) {
    instructions = "1. Structure your response clearly with introduction, body, and conclusion\n2. Support arguments with evidence\n3. Cite sources properly\n4. Proofread before submission";
  }

  return {
    title,
    description,
    question: prompt,
    instructions,
    rules: "Ensure originality and proper citations. Follow academic integrity guidelines.",
    generatedAt: new Date().toISOString(),
    source: 'Fallback Generator',
    originalPrompt: prompt
  };
}

function extractMainContent(response: string): string {
  // If structured parsing fails, return the main content
  const lines = response.split('\n').filter(line => line.trim().length > 0);
  const contentLines = lines.filter(line => 
    !line.match(/^(Title|Description|Instructions|Rules|Guidelines):/i) &&
    line.length > 20
  );
  
  return contentLines.slice(0, 3).join('\n\n') || response.substring(0, 500);
}
