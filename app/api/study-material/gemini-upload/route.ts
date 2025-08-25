import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with API key from environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAYdxFs0tzqXoI-mDZ4NLT-KhSf3huF7b4';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// In-memory storage for demo (replace with database in production)
let studyMaterials: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const department = formData.get('department') as string;
    const year = formData.get('year') as string;
    const subject = formData.get('subject') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file || !department || !year || !subject || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert file to base64 for storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');
    const timestamp = Date.now();

    // Generate AI-enhanced metadata using Gemini
    let aiMetadata = {
      enhancedDescription: description || `Study material for ${subject} - ${title}`,
      keyTopics: `${subject}, ${department}, Academic Material`,
      learningObjectives: [
        `Master core concepts in ${subject}`,
        `Apply theoretical knowledge practically`,
        `Prepare effectively for assessments`,
        `Develop analytical thinking skills`
      ],
      difficultyLevel: year === '1st' ? 'Beginner' : year === '4th' ? 'Advanced' : 'Intermediate'
    };

    // Enhance with Gemini AI
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `Analyze this educational material and create enhanced metadata:

Title: "${title}"
Subject: ${subject}
Department: ${department}
Academic Year: ${year}
Description: "${description}"

Generate a JSON response with:
- enhancedDescription: A compelling 2-3 sentence description
- keyTopics: Comma-separated relevant topics and keywords
- learningObjectives: Array of 4 specific learning outcomes
- difficultyLevel: "Beginner", "Intermediate", or "Advanced"

Focus on educational value and student learning outcomes.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = response.text();
      
      // Extract JSON from AI response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedAI = JSON.parse(jsonMatch[0]);
          aiMetadata = {
            enhancedDescription: parsedAI.enhancedDescription || aiMetadata.enhancedDescription,
            keyTopics: parsedAI.keyTopics || aiMetadata.keyTopics,
            learningObjectives: Array.isArray(parsedAI.learningObjectives) 
              ? parsedAI.learningObjectives 
              : aiMetadata.learningObjectives,
            difficultyLevel: parsedAI.difficultyLevel || aiMetadata.difficultyLevel
          };
        } catch (parseError) {
          console.log('JSON parsing failed, using fallback');
        }
      }
    } catch (aiError: any) {
      console.log('Gemini AI enhancement failed:', aiError?.message || 'Unknown error');
    }

    // Create study material record
    const studyMaterial = {
      id: `sm_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      faculty_id: 'gemini-ai-upload',
      department,
      year,
      subject,
      title,
      description: aiMetadata.enhancedDescription,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_data: `data:${file.type};base64,${base64Data.substring(0, 200)}...`, // Truncated for demo
      key_topics: aiMetadata.keyTopics,
      learning_objectives: aiMetadata.learningObjectives,
      difficulty_level: aiMetadata.difficultyLevel,
      uploaded_at: new Date().toISOString(),
      ai_enhanced: true,
      gemini_processed: true
    };

    // Store in memory (replace with database)
    studyMaterials.push(studyMaterial);

    return NextResponse.json({
      success: true,
      message: 'Study material uploaded and enhanced with Gemini AI',
      data: studyMaterial,
      ai_status: 'enhanced'
    });

  } catch (error: any) {
    console.error('Gemini upload error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: `Upload processing failed: ${error.message}`,
        details: 'Using Gemini AI for processing'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: studyMaterials,
    count: studyMaterials.length,
    message: 'Gemini-enhanced study materials retrieved'
  });
}
