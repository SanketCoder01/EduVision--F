import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { problem, problemType, image, language = 'english' } = await request.json();

    if (!problem) {
      return NextResponse.json({ error: 'Problem is required' }, { status: 400 });
    }

    let prompt = '';
    const imageText = image ? '\n\nI have also provided an image of the math problem. Please analyze both the text and image to solve the problem.' : '';
    
    if (language === 'marathi') {
      prompt = `तुम्ही एक अनुभवी गणित शिक्षक आहात. या समस्येचे संपूर्ण उत्तर मराठीत द्या: "${problem}". 

आवश्यकता:
- पायरी दर पायरी अतिशय सोप्या भाषेत समजावून सांग
- प्रत्येक पायरीचे कारण स्पष्ट करा
- ${problemType} च्या नियमांचा वापर करा
- उदाहरणे द्या
- सामान्य चुका टाळण्याचे मार्ग सांगा${imageText}`;
    } else if (language === 'hindi') {
      prompt = `आप एक अनुभवी गणित शिक्षक हैं। इस समस्या का संपूर्ण समाधान हिंदी में दें: "${problem}"।

आवश्यकताएं:
- कदम दर कदम बहुत सरल भाषा में समझाएं
- हर कदम का कारण स्पष्ट करें
- ${problemType} के नियमों का उपयोग करें
- उदाहरण दें
- सामान्य गलतियों से बचने के तरीके बताएं${imageText}`;
    } else {
      prompt = `You are an experienced math teacher. Solve this ${problemType} problem with complete explanation: "${problem}".

Requirements:
- Explain step by step in VERY SIMPLE language
- Show WHY each step works
- Use ${problemType} rules and formulas
- Provide examples where helpful
- Highlight common mistakes to avoid
- Make it understandable for any student level

Format:
PROBLEM: [restate clearly]
STEP-BY-STEP SOLUTION:
Step 1: [action] - [why we do this]
Step 2: [action] - [why we do this]
...
FINAL ANSWER: [clear answer]
KEY CONCEPTS: [important formulas/rules used]
COMMON MISTAKES: [what students often get wrong]${imageText}`;
    }

    let response = '';

    // Use Gemini as primary AI service with image support
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log(' Solving math problem with Gemini...');
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          generationConfig: {
            temperature: 0.1,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 2000,
          }
        });
        
        let parts: any[] = [{ text: prompt }];
        
        // Add image if provided
        if (image) {
          console.log('📸 Processing math problem image...');
          const base64Data = image.split(',')[1]; // Remove data:image/jpeg;base64, prefix
          parts.push({
            inlineData: {
              mimeType: image.split(';')[0].split(':')[1], // Extract mime type
              data: base64Data
            }
          });
        }
        
        const result = await model.generateContent(parts);
        response = result.response.text();
        console.log(' Math solution generated successfully');
      } catch (error: any) {
        console.log(' Gemini failed:', error?.message || 'Unknown error');
      }
    } else {
      console.log(' No Gemini API key found');
    }

    // Fallback response
    if (!response) {
      response = `PROBLEM: ${problem}

SOLUTION STEPS:
Step 1: Identify what we need to find
Step 2: Write down what we know
Step 3: Choose the right formula or method
Step 4: Substitute the values
Step 5: Calculate step by step
Step 6: Check our answer

FINAL ANSWER: [Solution will be provided based on the specific problem]

EXPLANATION: This is a ${problemType} problem that requires systematic approach. Break it down into smaller parts and solve each part carefully.

Note: For specific numerical solutions, please provide the exact problem details.`;
    }

    return NextResponse.json({ 
      success: true, 
      solution: response,
      problem,
      problemType,
      language
    });

  } catch (error) {
    console.error('Error solving math problem:', error);
    return NextResponse.json(
      { error: 'Failed to solve math problem' },
      { status: 500 }
    );
  }
}
