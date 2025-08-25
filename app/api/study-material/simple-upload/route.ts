import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

    // Create study material object without AI
    const studyMaterial = {
      id: `sm_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      faculty_id: 'simple-upload',
      department,
      year,
      subject,
      title,
      description: description || `Study material for ${subject} - ${title}`,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_url: fileUrl,
      uploaded_at: new Date().toISOString(),
      ai_enhanced: false
    };

    return NextResponse.json({
      success: true,
      message: 'Study material uploaded successfully',
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
  return NextResponse.json({
    success: true,
    message: 'Simple upload endpoint ready'
  });
}
