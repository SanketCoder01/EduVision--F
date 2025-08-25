import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { message, language = 'english' } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let systemPrompt = '';
    if (language === 'marathi') {
      systemPrompt = 'तुम्ही एक मदतगार AI शिक्षक आहात. विद्यार्थ्यांना मराठीत सोप्या भाषेत उत्तर द्या.';
    } else if (language === 'hindi') {
      systemPrompt = 'आप एक सहायक AI शिक्षक हैं। छात्रों को हिंदी में सरल भाषा में उत्तर दें।';
    } else {
      systemPrompt = 'You are a helpful AI learning assistant. Answer student questions in simple, clear language.';
    }

    let response = '';

    // Use Gemini as primary AI service
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log('🚀 Using Gemini as primary AI service');
        console.log('🔑 API Key check:', process.env.GEMINI_API_KEY ? `Present (${process.env.GEMINI_API_KEY.substring(0, 10)}...)` : 'Missing');
        
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1000,
          }
        });
        
        const prompt = `${systemPrompt}\n\nStudent question: ${message}`;
        console.log('📝 Sending prompt to Gemini...');
        
        const result = await model.generateContent(prompt);
        response = result.response.text();
        console.log('✅ Gemini response generated successfully');
        console.log('📊 Response length:', response.length, 'characters');
      } catch (error: any) {
        console.log('❌ Gemini failed:', error?.message || 'Unknown error');
        console.log('🔍 Error details:', {
          name: error?.name,
          message: error?.message,
          status: error?.status,
          statusText: error?.statusText
        });
      }
    } else {
      console.log('❌ No Gemini API key found in environment variables');
    }

    // Fallback response
    if (!response) {
      console.log('⚠️ Gemini API failed - using fallback response');
      if (language === 'marathi') {
        response = 'मला माफ करा, मी सध्या तुमच्या प्रश्नाचे उत्तर देऊ शकत नाही. कृपया पुन्हा प्रयत्न करा.';
      } else if (language === 'hindi') {
        response = 'मुझे खेद है, मैं अभी आपके प्रश्न का उत्तर नहीं दे सकता। कृपया फिर से प्रयास करें।';
      } else {
        response = 'I apologize, but I cannot answer your question right now. Please try again or rephrase your question.';
      }
    }

    return NextResponse.json({ 
      success: true, 
      response,
      language
    });

  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
