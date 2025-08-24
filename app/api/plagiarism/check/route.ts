import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, language = 'en', includeCitations = false, scrapeSources = false } = await request.json();

    if (!text || text.length < 40) {
      return NextResponse.json(
        { error: 'Text must be at least 40 characters long' },
        { status: 400 }
      );
    }

    const options = {
      method: 'POST',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '125374e0dcmsh59d081fe0522ae1p12043ejsn18fb0aff111b',
        'x-rapidapi-host': 'plagiarism-checker-and-auto-citation-generator-multi-lingual.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        language,
        includeCitations,
        scrapeSources
      })
    };

    const response = await fetch(
      'https://plagiarism-checker-and-auto-citation-generator-multi-lingual.p.rapidapi.com/plagiarism',
      options
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Plagiarism check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check plagiarism',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
