import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { doubt, subject, difficulty, studentLevel, language = 'english' } = await request.json();

    if (!doubt) {
      return NextResponse.json(
        { error: 'Doubt question is required' },
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

    const prompt = `${languageInstruction}You are a helpful study buddy AI. A student has asked the following doubt:

Doubt: ${doubt}
Subject: ${subject || 'General'}
Difficulty Level: ${difficulty || 'Medium'}
Student Level: ${studentLevel || 'Undergraduate'}

Please provide:
1. A clear, step-by-step explanation in simple language
2. Examples if applicable
3. Related concepts they should know
4. Practice suggestions
5. If this is a very advanced topic, suggest they ask a peer or teacher

Make your explanation friendly and encouraging. Use simple language suitable for students.`;

    console.log('🤖 Solving doubt with Gemini...');
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log('✅ Doubt solved successfully');

    // Determine if this needs peer/teacher help
    const isComplex = doubt.length > 200 || 
                     doubt.toLowerCase().includes('advanced') || 
                     doubt.toLowerCase().includes('research') ||
                     doubt.toLowerCase().includes('thesis');

    const doubtSolution = {
      question: doubt,
      solution: response,
      complexity: isComplex ? 'high' : 'medium',
      needsPeerHelp: isComplex,
      suggestedPeers: isComplex ? generatePeerSuggestions(subject) : [],
      relatedTopics: extractRelatedTopics(response),
      solvedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: doubtSolution
    });

  } catch (error) {
    console.error('❌ Doubt solver error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to solve doubt',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generatePeerSuggestions(subject: string): string[] {
  // Mock peer suggestions - in real app, this would query a database
  const peerSuggestions = [
    `Senior student specializing in ${subject}`,
    `Study group leader for ${subject}`,
    `Teaching assistant for ${subject}`,
    `Faculty member - ${subject} department`
  ];
  return peerSuggestions;
}

function extractRelatedTopics(solution: string): string[] {
  // Simple extraction of related topics mentioned in the solution
  const topics = [];
  const lines = solution.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('related') || line.toLowerCase().includes('also study') || line.toLowerCase().includes('concept')) {
      topics.push(line.trim());
    }
  }
  return topics.slice(0, 3); // Return max 3 related topics
}
