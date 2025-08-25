import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { topic, format, language = 'english' } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    let prompt = '';
    if (language === 'marathi') {
      prompt = `तुम्ही एक अनुभवी शिक्षक आहात. "${topic}" या विषयावर मराठीत संपूर्ण ${format} तयार करा. 

आवश्यकता:
- अतिशय सोप्या भाषेत लिहा
- सर्व महत्वाचे मुद्दे समाविष्ट करा
- उदाहरणे द्या
- मुख्य संकल्पना स्पष्ट करा
- व्यावहारिक अनुप्रयोग दाखवा
- परीक्षेसाठी महत्वाचे मुद्दे हायलाइट करा`;
    } else if (language === 'hindi') {
      prompt = `आप एक अनुभवी शिक्षक हैं। "${topic}" विषय पर हिंदी में विस्तृत ${format} तैयार करें।

आवश्यकताएं:
- बहुत सरल भाषा में लिखें
- सभी महत्वपूर्ण बिंदुओं को शामिल करें
- उदाहरण दें
- मुख्य अवधारणाओं को स्पष्ट करें
- व्यावहारिक अनुप्रयोग दिखाएं
- परीक्षा के लिए महत्वपूर्ण बिंदुओं को हाइलाइट करें`;
    } else {
      prompt = `You are an experienced teacher. Create comprehensive and detailed ${format} on "${topic}" in very simple language.

Requirements:
- Use extremely simple language that any student can understand
- Include ALL important points and concepts
- Provide clear examples and analogies
- Break down complex ideas into simple steps
- Include practical applications and real-world examples
- Highlight key points for exams
- Use bullet points and clear structure
- Add memory tricks or mnemonics where helpful
- Include common mistakes to avoid
- Provide practice questions if applicable

Make it complete, thorough, and student-friendly.`;
    }

    let response = '';

    // Use Gemini as primary AI service
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log('📚 Generating comprehensive notes with Gemini...');
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 3000,
          }
        });
        const result = await model.generateContent(prompt);
        response = result.response.text();
        console.log('✅ Comprehensive notes generated successfully');
      } catch (error: any) {
        console.log('❌ Gemini failed:', error?.message || 'Unknown error');
      }
    } else {
      console.log('❌ No Gemini API key found');
    }

    // Fallback response
    if (!response) {
      response = `Study Notes: ${topic}

Overview:
This topic covers important concepts that students need to understand.

Key Points:
• Main concept 1 - explained in simple terms
• Main concept 2 - with practical examples  
• Main concept 3 - step by step breakdown
• Important formulas or rules to remember
• Common mistakes to avoid

Summary:
Understanding ${topic} requires practice and regular review. Focus on the key concepts and practice with examples.`;
    }

    return NextResponse.json({ 
      success: true, 
      content: response,
      topic,
      format,
      language
    });

  } catch (error) {
    console.error('Error generating notes:', error);
    return NextResponse.json(
      { error: 'Failed to generate notes' },
      { status: 500 }
    );
  }
}
