import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { prompt, subject, difficulty, questionCount, questionType } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    // Use OpenAI GPT for question generation
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert educational assessment creator. Generate high-quality questions that test understanding and critical thinking. Always respond with valid JSON format."
        },
        {
          role: "user",
          content: `Generate ${questionCount || 5} ${difficulty || 'medium'} level ${questionType || 'mixed'} questions for the subject "${subject || 'General'}" based on this prompt:

"${prompt}"

Create questions that are relevant to the prompt content and appropriate for the specified difficulty level.

Format the response as a JSON object with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "What is the main concept discussed in the prompt?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "A",
      "marks": 5
    },
    {
      "id": 2,
      "type": "short_answer",
      "question": "Explain the key points mentioned in the prompt.",
      "expectedLength": "2-3 sentences",
      "marks": 10
    },
    {
      "id": 3,
      "type": "essay",
      "question": "Analyze and discuss the topic in detail.",
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "marks": 15
    }
  ],
  "totalMarks": 30,
  "estimatedTime": "45 minutes"
}

Question types to include: ${questionType === 'mixed' ? 'multiple choice, short answer, and essay questions' : questionType}
Make sure questions test understanding of the concepts mentioned in the prompt.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const aiResponse = response.choices[0]?.message?.content || '';
    
    if (!aiResponse || aiResponse.length < 50) {
      const fallbackData = generateFallbackQuestions(prompt, subject, difficulty, questionCount, questionType);
      return NextResponse.json({
        success: true,
        data: fallbackData
      });
    }
    
    // Try to parse JSON from the response
    let questionsData;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        questionsData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.log('JSON parsing failed, using fallback');
      questionsData = generateFallbackQuestions(prompt, subject, difficulty, questionCount, questionType);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...questionsData,
        metadata: {
          subject: subject || 'General',
          difficulty: difficulty || 'medium',
          questionCount: questionCount || 5,
          generatedAt: new Date().toISOString(),
          source: 'RapidAPI ChatGPT',
          originalPrompt: prompt
        }
      }
    });

  } catch (error) {
    console.error('Question generation error:', error);
    
    // Fallback generation on any error
    const fallbackData = generateFallbackQuestions(
      'General topic',
      'General',
      'medium',
      5,
      'mixed'
    );
    
    return NextResponse.json({
      success: true,
      data: fallbackData
    });
  }
}

function generateFallbackQuestions(prompt: string, subject?: string, difficulty?: string, questionCount?: number, questionType?: string) {
  const count = questionCount || 5;
  const questions = [];
  
  // Generate different types of questions based on prompt
  for (let i = 1; i <= count; i++) {
    let questionTypeToUse = questionType;
    
    if (questionType === 'mixed') {
      const types = ['multiple_choice', 'short_answer', 'essay', 'true_false'];
      questionTypeToUse = types[(i - 1) % types.length];
    }
    
    let question;
    
    switch (questionTypeToUse) {
      case 'multiple_choice':
        question = {
          id: i,
          type: 'multiple_choice',
          question: `What is the main concept related to "${prompt.substring(0, 50)}..."?`,
          options: [
            `Primary concept from the prompt`,
            `Secondary aspect mentioned`,
            `Related but incorrect option`,
            `Unrelated option`
          ],
          correctAnswer: 'A',
          marks: 5
        };
        break;
        
      case 'short_answer':
        question = {
          id: i,
          type: 'short_answer',
          question: `Briefly explain the key points mentioned in: "${prompt.substring(0, 50)}..."`,
          expectedLength: '2-3 sentences',
          marks: 8
        };
        break;
        
      case 'essay':
        question = {
          id: i,
          type: 'essay',
          question: `Analyze and discuss in detail the topic: "${prompt.substring(0, 50)}..."`,
          keyPoints: [
            'Main concept analysis',
            'Supporting arguments',
            'Practical applications',
            'Conclusion and implications'
          ],
          marks: 15
        };
        break;
        
      case 'true_false':
        question = {
          id: i,
          type: 'true_false',
          question: `The prompt discusses concepts related to ${subject || 'the given topic'}.`,
          correctAnswer: 'True',
          marks: 3
        };
        break;
        
      default:
        question = {
          id: i,
          type: 'short_answer',
          question: `Explain your understanding of: "${prompt.substring(0, 50)}..."`,
          expectedLength: '3-4 sentences',
          marks: 10
        };
    }
    
    questions.push(question);
  }
  
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  const estimatedTime = Math.ceil(totalMarks * 1.5) + ' minutes';
  
  return {
    questions,
    totalMarks,
    estimatedTime,
    metadata: {
      subject: subject || 'General',
      difficulty: difficulty || 'medium',
      questionCount: count,
      generatedAt: new Date().toISOString(),
      source: 'Fallback Generator',
      originalPrompt: prompt
    }
  };
}
