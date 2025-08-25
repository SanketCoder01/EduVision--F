import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  let prompt = '';
  let subject = '';
  let difficulty = '';
  
  try {
    const requestData = await request.json();
    prompt = requestData.prompt;
    subject = requestData.subject;
    difficulty = requestData.difficulty;
    const { assignmentType, language = 'english' } = requestData;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (language === 'marathi') {
      systemPrompt = 'तुम्ही एक अनुभवी शैक्षणिक सामग्री निर्माता आहात. शैक्षणिक, आकर्षक आणि सुव्यवस्थित असाइनमेंट तयार करा.';
      userPrompt = `खालील आवश्यकतांवर आधारित संपूर्ण असाइनमेंट तयार करा:

विषय: ${subject || 'सामान्य'}
कठिणाई: ${difficulty || 'मध्यम'}
प्रकार: ${assignmentType || 'मिश्र'}

वापरकर्त्याची विनंती: ${prompt}

कृपया खालील संरचनेसह तपशीलवार असाइनमेंट तयार करा:
1. असाइनमेंट शीर्षक
2. तपशीलवार वर्णन (उद्दिष्टे आणि संदर्भ)
3. मुख्य प्रश्न/समस्या विधान
4. पायरी दर पायरी सूचना
5. नियम आणि मार्गदर्शक तत्त्वे
6. मूल्यमापन निकष

असाइनमेंट शैक्षणिक, आकर्षक आणि निर्दिष्ट कठिणाई स्तरासाठी योग्य बनवा.`;
    } else if (language === 'hindi') {
      systemPrompt = 'आप एक अनुभवी शैक्षणिक सामग्री निर्माता हैं। शैक्षणिक, आकर्षक और सुव्यवस्थित असाइनमेंट बनाएं।';
      userPrompt = `निम्नलिखित आवश्यकताओं के आधार पर व्यापक असाइनमेंट बनाएं:

विषय: ${subject || 'सामान्य'}
कठिनाई: ${difficulty || 'मध्यम'}
प्रकार: ${assignmentType || 'मिश्रित'}

उपयोगकर्ता अनुरोध: ${prompt}

कृपया निम्नलिखित संरचना के साथ विस्तृत असाइनमेंट तैयार करें:
1. असाइनमेंट शीर्षक
2. विस्तृत विवरण (उद्देश्य और संदर्भ)
3. मुख्य प्रश्न/समस्या कथन
4. चरणबद्ध निर्देश
5. नियम और दिशानिर्देश
6. मूल्यांकन मानदंड

असाइनमेंट को शैक्षणिक, आकर्षक और निर्दिष्ट कठिनाई स्तर के लिए उपयुक्त बनाएं।`;
    } else {
      systemPrompt = 'You are an expert educational content creator. Generate comprehensive assignments that are educational, engaging, and well-structured.';
      userPrompt = `Create a comprehensive assignment based on the following requirements:

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

Make the assignment educational, engaging, and appropriate for the specified difficulty level. Include specific requirements, constraints, and expected deliverables.`;
    }

    // Use Gemini for assignment generation
    console.log('📝 Generating assignment with Gemini...');
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2000,
      }
    });

    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    const aiResponse = result.response.text();
    console.log('✅ Assignment generated successfully');
    
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
    console.error('❌ Assignment generation error:', error);
    
    // More detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      geminiApiKey: process.env.GEMINI_API_KEY ? 'Present' : 'Missing',
      timestamp: new Date().toISOString()
    };
    
    console.error('🔍 Detailed error info:', errorDetails);
    
    // Fallback assignment generation
    const fallbackData = generateFallbackAssignment(prompt, subject, difficulty);
    
    return NextResponse.json({
      success: true,
      data: fallbackData,
      source: 'fallback'
    });
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
    source: 'Gemini AI',
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
