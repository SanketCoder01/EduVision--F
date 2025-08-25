import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { description, programmingLanguage, language = 'english' } = await request.json();

    if (!description || !programmingLanguage) {
      return NextResponse.json({ error: 'Description and programming language are required' }, { status: 400 });
    }

    let prompt = '';
    if (language === 'marathi') {
      prompt = `तुम्ही एक प्रोग्रामिंग शिक्षक आहात. ${programmingLanguage} मध्ये "${description}" साठी कोड लिहा. कोडमध्ये टिप्पण्या मराठीत द्या आणि सोप्या भाषेत समजावून सांगा.`;
    } else if (language === 'hindi') {
      prompt = `आप एक प्रोग्रामिंग शिक्षक हैं। ${programmingLanguage} में "${description}" के लिए कोड लिखें। कोड में हिंदी में टिप्पणियां दें और सरल भाषा में समझाएं।`;
    } else {
      prompt = `You are a programming teacher. Write clean, well-commented ${programmingLanguage} code for: "${description}".

Format your response as:
CODE:
\`\`\`${programmingLanguage.toLowerCase()}
[your code here with comments]
\`\`\`

EXPLANATION:
[Simple explanation of how the code works]

KEY CONCEPTS:
[Important programming concepts used]

Make the code beginner-friendly with clear comments and simple logic.`;
    }

    let response = '';

    // Use Gemini as primary AI service
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log('💻 Generating code with Gemini...');
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 2500,
          }
        });
        const result = await model.generateContent(prompt);
        response = result.response.text();
        console.log('✅ Code generated successfully');
      } catch (error: any) {
        console.log('❌ Gemini failed:', error?.message || 'Unknown error');
      }
    } else {
      console.log('❌ No Gemini API key found');
    }

    // Fallback response
    if (!response) {
      const fallbackCode = programmingLanguage.toLowerCase() === 'python' 
        ? `# ${description}\n# This is a basic template\n\ndef main():\n    print("Hello, World!")\n    # Add your code here\n    pass\n\nif __name__ == "__main__":\n    main()`
        : programmingLanguage.toLowerCase() === 'java'
        ? `// ${description}\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n        // Add your code here\n    }\n}`
        : `// ${description}\n// Basic template\nconsole.log("Hello, World!");\n// Add your code here`;

      response = `CODE:
\`\`\`${programmingLanguage.toLowerCase()}
${fallbackCode}
\`\`\`

EXPLANATION:
This is a basic template for ${description} in ${programmingLanguage}. You can build upon this structure to implement your specific requirements.

KEY CONCEPTS:
• Basic syntax and structure
• Main function/method
• Comments for documentation
• Print/output statements`;
    }

    return NextResponse.json({ 
      success: true, 
      code: response,
      description,
      programmingLanguage,
      language
    });

  } catch (error) {
    console.error('Error generating code:', error);
    return NextResponse.json(
      { error: 'Failed to generate code' },
      { status: 500 }
    );
  }
}
