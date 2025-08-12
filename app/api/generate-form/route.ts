import { NextRequest, NextResponse } from 'next/server';
import { generateFormFromPrompt } from '@/lib/ai-form-generator';
import { saveGeneratedForm } from '@/lib/application-forms';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate form from AI prompt
    const generatedForm = await generateFormFromPrompt(prompt);

    // Save to database
    const { error: saveError } = await saveGeneratedForm(generatedForm);
    if (saveError) {
      console.error('Error saving form:', saveError);
      return NextResponse.json(
        { error: 'Failed to save generated form' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      form: generatedForm
    });

  } catch (error) {
    console.error('Error generating form:', error);
    return NextResponse.json(
      { error: 'Failed to generate form' },
      { status: 500 }
    );
  }
} 