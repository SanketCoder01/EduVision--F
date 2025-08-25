import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { studyData, currentMood, studyHours, lastBreak, concerns, language = 'english' } = await request.json();

    if (!studyData && !currentMood) {
      return NextResponse.json(
        { error: 'Study data or current mood is required' },
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

    const prompt = `${languageInstruction}You are an AI well-being and focus coach for students. Analyze the student's current state:

Study Data: ${studyData || 'Not provided'}
Current Mood: ${currentMood || 'Not specified'}
Study Hours Today: ${studyHours || 'Not specified'}
Last Break: ${lastBreak || 'Not specified'}
Concerns: ${concerns || 'None mentioned'}

Please provide:
1. **Burnout Assessment**: Are there signs of study burnout or stress?
2. **Focus Analysis**: How is their current focus and productivity?
3. **Break Recommendations**: When and what type of breaks they should take
4. **Study Schedule Adjustments**: Any changes needed to their study routine
5. **Wellness Tips**: Specific tips for mental and physical well-being
6. **Motivation Boost**: Encouraging words and motivation
7. **Red Flags**: Any concerning patterns that need immediate attention

Be supportive, caring, and provide practical advice. Focus on both academic success and mental health.`;

    console.log('🤖 Analyzing well-being with Gemini...');
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log('✅ Well-being analysis completed successfully');

    const wellbeingAssessment = {
      currentMood,
      studyHours,
      burnoutRisk: assessBurnoutRisk(studyHours, lastBreak, concerns),
      recommendations: extractRecommendations(response),
      breakSuggestions: extractBreakSuggestions(response),
      motivationalMessage: extractMotivation(response),
      fullAssessment: response,
      assessedAt: new Date().toISOString(),
      nextCheckIn: calculateNextCheckIn()
    };

    return NextResponse.json({
      success: true,
      data: wellbeingAssessment
    });

  } catch (error) {
    console.error('❌ Well-being coach error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to assess well-being',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function assessBurnoutRisk(studyHours: string, lastBreak: string, concerns: string): 'low' | 'medium' | 'high' {
  let risk = 'low';
  
  const hours = parseInt(studyHours) || 0;
  if (hours > 8) risk = 'medium';
  if (hours > 12) risk = 'high';
  
  if (concerns && (concerns.includes('stress') || concerns.includes('tired') || concerns.includes('overwhelmed'))) {
    risk = risk === 'low' ? 'medium' : 'high';
  }
  
  return risk;
}

function extractRecommendations(assessment: string): string[] {
  const recommendations = [];
  const lines = assessment.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('recommend') || line.toLowerCase().includes('suggest') || line.includes('•') || line.includes('-')) {
      recommendations.push(line.trim());
    }
  }
  
  return recommendations.slice(0, 5);
}

function extractBreakSuggestions(assessment: string): string[] {
  const breakSuggestions = [];
  const lines = assessment.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('break') || line.toLowerCase().includes('rest') || line.toLowerCase().includes('relax')) {
      breakSuggestions.push(line.trim());
    }
  }
  
  return breakSuggestions.slice(0, 3);
}

function extractMotivation(assessment: string): string {
  const lines = assessment.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('motivation') || line.toLowerCase().includes('encourage') || line.toLowerCase().includes('you can')) {
      return line.trim();
    }
  }
  
  return 'You are doing great! Keep up the good work and remember to take care of yourself.';
}

function calculateNextCheckIn(): string {
  const nextCheckIn = new Date();
  nextCheckIn.setHours(nextCheckIn.getHours() + 4); // Check in every 4 hours
  return nextCheckIn.toISOString();
}
