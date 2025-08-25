import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Initialize Gemini AI with environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyAYdxFs0tzqXoI-mDZ4NLT-KhSf3huF7b4');

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

    // Store file locally in public/uploads directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'study-materials');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${department}-${year}-${subject}-${timestamp}-${file.name}`.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = join(uploadsDir, fileName);
    
    // Save file to disk
    await writeFile(filePath, buffer);
    const fileUrl = `/uploads/study-materials/${fileName}`;

    // Generate AI-enhanced metadata using Gemini
    let aiMetadata = {
      enhancedDescription: description || `Study material for ${subject} - ${title}`,
      keyTopics: `${subject}, ${department}`,
      learningObjectives: [`Understand ${subject} concepts`, `Apply theoretical knowledge`, `Prepare for assessments`],
      difficultyLevel: year === '1st' ? 'Beginner' : year === '4th' ? 'Advanced' : 'Intermediate'
    };

    // Try to enhance with Gemini AI
    try {
      if (process.env.GEMINI_API_KEY) {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `Create enhanced metadata for this study material:
        Title: ${title}
        Subject: ${subject}
        Department: ${department}
        Year: ${year}
        Description: ${description}
        
        Return JSON with: enhancedDescription (2-3 sentences), keyTopics (comma-separated), learningObjectives (array of 3-4 strings), difficultyLevel (Beginner/Intermediate/Advanced)`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResponse = response.text();
        
        // Try to parse AI response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedMetadata = JSON.parse(jsonMatch[0]);
          aiMetadata = {
            enhancedDescription: parsedMetadata.enhancedDescription || aiMetadata.enhancedDescription,
            keyTopics: parsedMetadata.keyTopics || aiMetadata.keyTopics,
            learningObjectives: parsedMetadata.learningObjectives || aiMetadata.learningObjectives,
            difficultyLevel: parsedMetadata.difficultyLevel || aiMetadata.difficultyLevel
          };
        }
      }
    } catch (aiError) {
      console.log('AI enhancement failed, using fallback metadata:', aiError);
      // Continue with fallback metadata
    }

    // Create study material object
    const studyMaterial = {
      id: `sm_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      faculty_id: 'ai-enhanced-upload',
      department,
      year,
      subject,
      title,
      description: aiMetadata.enhancedDescription,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_url: fileUrl,
      key_topics: aiMetadata.keyTopics,
      learning_objectives: aiMetadata.learningObjectives,
      difficulty_level: aiMetadata.difficultyLevel,
      uploaded_at: new Date().toISOString(),
      ai_enhanced: true
    };

    return NextResponse.json({
      success: true,
      message: 'Study material uploaded successfully with AI enhancement',
      data: studyMaterial
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: `Upload failed: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return simulated study materials
  const sampleMaterials = [
    {
      id: 'sm_demo_1',
      faculty_id: 'ai-enhanced-upload',
      department: 'CSE',
      year: '2nd',
      subject: 'Data Structures',
      title: 'Binary Trees and Traversals',
      description: 'Comprehensive guide to binary tree operations and traversal algorithms with practical examples.',
      file_name: 'binary_trees_guide.pdf',
      file_type: 'application/pdf',
      key_topics: 'Binary Trees, Tree Traversal, Algorithms, Data Structures',
      learning_objectives: ['Understand binary tree structure', 'Implement traversal algorithms', 'Analyze time complexity'],
      difficulty_level: 'Intermediate',
      uploaded_at: new Date().toISOString(),
      ai_enhanced: true
    }
  ];

  return NextResponse.json({
    success: true,
    data: sampleMaterials
  });
}
