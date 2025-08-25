import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { concept, subject, visualType, language = 'english' } = await request.json();

    if (!concept) {
      return NextResponse.json(
        { error: 'Concept is required' },
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

    const prompt = `${languageInstruction}You are an AI that converts text concepts into visual descriptions. Create a detailed visual representation for:

Concept: ${concept}
Subject: ${subject || 'General'}
Visual Type: ${visualType || 'flowchart'}

Please provide:
1. A detailed description of how to visualize this concept
2. Step-by-step breakdown for creating the visual
3. Key elements that should be highlighted
4. Connections between different parts
5. Color coding suggestions
6. Layout recommendations

For ${visualType || 'flowchart'}, describe:
- Main components/nodes
- Relationships/connections
- Flow direction
- Visual hierarchy
- Labels and annotations

Make it detailed enough that someone could create the visual from your description.`;

    console.log('🤖 Creating concept visualization with Gemini...');
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log('✅ Concept visualization created successfully');

    const visualization = {
      concept,
      subject,
      visualType: visualType || 'flowchart',
      description: response,
      elements: extractVisualElements(response),
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: visualization
    });

  } catch (error) {
    console.error('❌ Concept visualizer error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create visualization',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function extractVisualElements(description: string): any[] {
  // Extract key visual elements from the description
  const elements = [];
  const lines = description.split('\n');
  
  for (const line of lines) {
    if (line.includes('node') || line.includes('box') || line.includes('circle') || line.includes('component')) {
      elements.push({
        type: 'node',
        description: line.trim()
      });
    } else if (line.includes('arrow') || line.includes('connection') || line.includes('link')) {
      elements.push({
        type: 'connection',
        description: line.trim()
      });
    } else if (line.includes('color') || line.includes('highlight')) {
      elements.push({
        type: 'styling',
        description: line.trim()
      });
    }
  }
  
  return elements.slice(0, 10); // Return max 10 elements
}
