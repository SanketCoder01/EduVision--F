import { NextRequest, NextResponse } from "next/server";

// A real implementation would use the Google Generative AI SDK
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // This is a mocked response that mimics a real AI call.
    // In a real implementation, you would use the AI SDK here.
    console.log(`Generating assignment with prompt: ${prompt}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mocked AI response based on prompt content
    let generatedTitle = "Generated Assignment";
    let generatedDescription = "This is a placeholder description. A real AI would generate content based on the prompt.";

    if (prompt.toLowerCase().includes("data structures")) {
        generatedTitle = "Advanced Data Structures Challenge";
        generatedDescription = "Implement a self-balancing binary search tree (like an AVL or Red-Black Tree) and analyze its time complexity for insertion, deletion, and search operations.";
    } else if (prompt.toLowerCase().includes("algorithms")) {
        generatedTitle = "Algorithmic Problem Solving: Dynamic Programming";
        generatedDescription = "Solve the classic Knapsack problem using dynamic programming. Provide the algorithm, pseudo-code, and a working implementation in a language of your choice.";
    } else if (prompt.toLowerCase().includes("database")) {
        generatedTitle = "Database Design for a Social Media App";
        generatedDescription = "Design a relational database schema for a simple social media application. Include tables for users, posts, comments, and likes. Provide an ERD and the SQL scripts to create the tables.";
    }

    return NextResponse.json({
      title: generatedTitle,
      description: generatedDescription,
    });

  } catch (error) {
    console.error("Error in assignment generation:", error);
    return NextResponse.json(
      { error: "Failed to generate assignment" },
      { status: 500 }
    );
  }
}
