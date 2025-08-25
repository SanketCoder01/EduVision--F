import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { syllabus, examDate, currentDate, weakAreas, language = 'english' } = await request.json();

    if (!syllabus || !examDate) {
      return NextResponse.json(
        { error: 'Syllabus and exam date are required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    // Build language-specific prompt
    let languageInstruction = '';
    if (language === 'hindi') {
      languageInstruction = 'Please respond in Hindi (हिंदी में उत्तर दें).\n\n';
    } else if (language === 'marathi') {
      languageInstruction = 'Please respond in Marathi (मराठीत उत्तर द्या).\n\n';
    }

    const prompt = `${languageInstruction}You are an AI exam coach. Create a personalized study plan based on the following information:

Syllabus: ${syllabus}
Exam Date: ${examDate}
Current Date: ${currentDate || new Date().toISOString().split('T')[0]}
Weak Areas: ${weakAreas || 'Not specified'}

Create a detailed study plan that includes:
1. Daily study schedule with specific topics
2. Priority areas based on difficulty and importance
3. Revision schedule closer to exam date
4. Time allocation for each topic
5. Special focus on weak areas
6. Break recommendations
7. Mock test schedule

Format the response as a structured study plan with clear daily tasks and recommendations. Make it practical and achievable.`;

    console.log('🤖 Generating exam plan with Gemini...');
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log('✅ Exam plan generated successfully');

    // Parse the response into structured format
    const studyPlan = {
      examDate,
      totalDays: Math.ceil((new Date(examDate).getTime() - new Date(currentDate || new Date()).getTime()) / (1000 * 60 * 60 * 24)),
      plan: response,
      weakAreas: weakAreas ? weakAreas.split(',').map((area: string) => area.trim()) : [],
      generatedAt: new Date().toISOString(),
      nextRecommendation: extractNextRecommendation(response)
    };

    return NextResponse.json({
      success: true,
      data: studyPlan
    });

  } catch (error) {
    console.error('❌ Exam planner error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate study plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function extractNextRecommendation(plan: string): string {
  // Extract the first actionable item from the plan
  const lines = plan.split('\n').filter(line => line.trim().length > 0);
  for (const line of lines) {
    if (line.includes('today') || line.includes('tomorrow') || line.includes('Day 1') || line.includes('start')) {
      return line.trim();
    }
  }
  return 'Start with the first topic in your syllabus and focus on understanding basic concepts.';
}
