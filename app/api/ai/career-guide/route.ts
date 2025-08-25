import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { academicData, interests, skills, careerGoals, currentYear, language = 'english' } = await request.json();

    if (!academicData && !interests) {
      return NextResponse.json(
        { error: 'Academic data or interests are required' },
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

    const prompt = `${languageInstruction}You are an AI career counselor. Analyze the student's profile and provide career guidance:

Academic Performance: ${academicData || 'Not provided'}
Interests: ${interests || 'Not specified'}
Skills: ${skills || 'Not specified'}
Career Goals: ${careerGoals || 'Exploring options'}
Current Year: ${currentYear || 'Not specified'}

Please provide:
1. **Strengths Analysis**: What are their key academic and skill strengths?
2. **Career Path Suggestions**: 3-5 specific career paths that match their profile
3. **Skill Development**: What skills should they focus on developing?
4. **Certification Recommendations**: Relevant certifications for their field
5. **Internship Opportunities**: Types of internships they should pursue
6. **Industry Trends**: Current trends in their areas of interest
7. **Next Steps**: Immediate actionable steps for career development
8. **Resume Highlights**: Key achievements and skills to highlight

Be specific, practical, and encouraging. Focus on actionable career advice.`;

    console.log('🤖 Generating career guidance with Gemini...');
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log('✅ Career guidance generated successfully');

    const careerGuidance = {
      academicData,
      interests: interests ? interests.split(',').map((i: string) => i.trim()) : [],
      skills: skills ? skills.split(',').map((s: string) => s.trim()) : [],
      careerPaths: extractCareerPaths(response),
      certifications: extractCertifications(response),
      nextSteps: extractNextSteps(response),
      resumeHighlights: extractResueHighlights(response),
      fullGuidance: response,
      generatedAt: new Date().toISOString(),
      strengthsScore: calculateStrengthsScore(academicData, skills)
    };

    return NextResponse.json({
      success: true,
      data: careerGuidance
    });

  } catch (error) {
    console.error('❌ Career guide error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate career guidance',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function extractCareerPaths(guidance: string): string[] {
  const paths = [];
  const lines = guidance.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('career') || line.toLowerCase().includes('path') || line.toLowerCase().includes('job') || line.toLowerCase().includes('role')) {
      if (line.includes('•') || line.includes('-') || line.includes('1.') || line.includes('2.')) {
        paths.push(line.trim());
      }
    }
  }
  
  return paths.slice(0, 5);
}

function extractCertifications(guidance: string): string[] {
  const certifications = [];
  const lines = guidance.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('certification') || line.toLowerCase().includes('course') || line.toLowerCase().includes('certificate')) {
      certifications.push(line.trim());
    }
  }
  
  return certifications.slice(0, 5);
}

function extractNextSteps(guidance: string): string[] {
  const steps = [];
  const lines = guidance.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('step') || line.toLowerCase().includes('action') || line.toLowerCase().includes('should') || line.toLowerCase().includes('start')) {
      if (line.includes('•') || line.includes('-') || line.includes('1.') || line.includes('2.')) {
        steps.push(line.trim());
      }
    }
  }
  
  return steps.slice(0, 4);
}

function extractResumeHighlights(guidance: string): string[] {
  const highlights = [];
  const lines = guidance.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('resume') || line.toLowerCase().includes('highlight') || line.toLowerCase().includes('achievement')) {
      highlights.push(line.trim());
    }
  }
  
  return highlights.slice(0, 5);
}

function calculateStrengthsScore(academicData: string, skills: string): number {
  let score = 5; // Base score
  
  if (academicData && academicData.toLowerCase().includes('excellent')) score += 2;
  if (academicData && academicData.toLowerCase().includes('good')) score += 1;
  if (skills && skills.split(',').length > 3) score += 1;
  
  return Math.min(score, 10);
}
