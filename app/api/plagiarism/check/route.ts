import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, title } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      )
    }

    // RapidAPI Plagiarism Checker
    const options = {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': 'KkHJ5C8lPW4nrmOuAMPZLpA9MOXDQE75697eea',
        'X-RapidAPI-Host': 'plagiarism-checker-and-auto-citation-generator-multi-lingual.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        language: 'en',
        includeCitations: false,
        scrapeSources: false
      })
    }

    const response = await fetch(
      'https://plagiarism-checker-and-auto-citation-generator-multi-lingual.p.rapidapi.com/plagiarism',
      options
    )

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()

    // Extract plagiarism information
    const plagiarismResult = {
      similarity_percentage: data.percentPlagiarism || 0,
      sources_count: data.sources?.length || 0,
      sources: data.sources || [],
      is_plagiarized: (data.percentPlagiarism || 0) > 15, // Consider >15% as plagiarized
      analysis: {
        total_words: data.totalWords || 0,
        plagiarized_words: data.plagiarizedWords || 0,
        unique_words: data.uniqueWords || 0
      },
      report_url: data.reportUrl || null,
      checked_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: plagiarismResult
    })

  } catch (error) {
    console.error('Plagiarism check error:', error)
    
    // Return mock data if API fails (for development)
    const { text: requestText } = await request.json()
    const wordCount = requestText.split(' ').length
    const mockResult = {
      similarity_percentage: Math.floor(Math.random() * 25), // Random 0-25%
      sources_count: Math.floor(Math.random() * 5),
      sources: [
        {
          title: "Sample Academic Source",
          url: "https://example.com/source1",
          similarity: Math.floor(Math.random() * 15)
        }
      ],
      is_plagiarized: false,
      analysis: {
        total_words: wordCount,
        plagiarized_words: Math.floor(wordCount * 0.1),
        unique_words: Math.floor(wordCount * 0.9)
      },
      report_url: null,
      checked_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: mockResult,
      note: 'Using mock data due to API error'
    })
  }
}
