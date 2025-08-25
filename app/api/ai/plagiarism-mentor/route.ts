import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { code, language, assignmentType, checkType = 'full', studentLanguage = 'english' } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
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
    if (studentLanguage === 'hindi') {
      languageInstruction = 'Please respond in Hindi (हिंदी में उत्तर दें).\n\n';
    } else if (studentLanguage === 'marathi') {
      languageInstruction = 'Please respond in Marathi (मराठीत उत्तर द्या).\n\n';
    }

    const prompt = `${languageInstruction}You are an AI code mentor that helps students with originality and code improvement. Analyze this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Assignment Type: ${assignmentType || 'General'}
Check Type: ${checkType}

Please provide:
1. **Originality Assessment**: Does this look like original student work or copied code?
2. **Code Quality**: Rate the code quality (1-10) and explain why
3. **Efficiency Analysis**: Can this code be improved for better performance?
4. **Best Practices**: What coding best practices are missing?
5. **Improvement Suggestions**: Specific suggestions to make the code better
6. **Learning Opportunities**: What concepts should the student study more?
7. **Rewrite Suggestions**: If needed, suggest how to rewrite parts for better originality

Be encouraging but honest. Help the student learn and improve while maintaining academic integrity.`;

    console.log('🤖 Analyzing code with Gemini...');
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log('✅ Code analysis completed successfully');

    // Parse the response to extract key metrics
    const analysis = {
      code,
      language,
      originalityScore: extractOriginalityScore(response),
      qualityScore: extractQualityScore(response),
      suggestions: extractSuggestions(response),
      improvements: extractImprovements(response),
      fullAnalysis: response,
      analyzedAt: new Date().toISOString(),
      riskLevel: determineRiskLevel(response)
    };

    return NextResponse.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('❌ Plagiarism mentor error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze code',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function extractOriginalityScore(analysis: string): number {
  // Look for originality indicators in the response
  const originalityKeywords = ['original', 'unique', 'copied', 'plagiarized'];
  let score = 7; // Default moderate score
  
  if (analysis.toLowerCase().includes('highly original') || analysis.toLowerCase().includes('very original')) {
    score = 9;
  } else if (analysis.toLowerCase().includes('copied') || analysis.toLowerCase().includes('plagiarized')) {
    score = 3;
  } else if (analysis.toLowerCase().includes('somewhat original')) {
    score = 6;
  }
  
  return score;
}

function extractQualityScore(analysis: string): number {
  // Extract quality score from the analysis
  const qualityMatch = analysis.match(/quality.*?(\d+)/i);
  if (qualityMatch) {
    return parseInt(qualityMatch[1]);
  }
  return 6; // Default score
}

function extractSuggestions(analysis: string): string[] {
  const suggestions = [];
  const lines = analysis.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('suggest') || line.toLowerCase().includes('recommend') || line.includes('•') || line.includes('-')) {
      suggestions.push(line.trim());
    }
  }
  
  return suggestions.slice(0, 5); // Return max 5 suggestions
}

function extractImprovements(analysis: string): string[] {
  const improvements = [];
  const lines = analysis.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('improve') || line.toLowerCase().includes('better') || line.toLowerCase().includes('optimize')) {
      improvements.push(line.trim());
    }
  }
  
  return improvements.slice(0, 3); // Return max 3 improvements
}

function determineRiskLevel(analysis: string): 'low' | 'medium' | 'high' {
  const lowerAnalysis = analysis.toLowerCase();
  
  if (lowerAnalysis.includes('copied') || lowerAnalysis.includes('plagiarized') || lowerAnalysis.includes('not original')) {
    return 'high';
  } else if (lowerAnalysis.includes('somewhat') || lowerAnalysis.includes('moderate')) {
    return 'medium';
  }
  
  return 'low';
}
