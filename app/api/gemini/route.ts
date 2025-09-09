import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const { prompt, difficulty, fileContent } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("Gemini API key not found")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    
    // Enhanced prompt with difficulty and file content
    let enhancedPrompt = prompt
    
    if (difficulty) {
      enhancedPrompt += `\n\nDifficulty Level: ${difficulty}`
      
      switch (difficulty.toLowerCase()) {
        case 'normal':
        case 'beginner':
          enhancedPrompt += "\nMake this assignment suitable for beginners with basic concepts and step-by-step guidance."
          break
        case 'intermediate':
          enhancedPrompt += "\nMake this assignment moderately challenging with some advanced concepts and problem-solving."
          break
        case 'hard':
        case 'advanced':
          enhancedPrompt += "\nMake this assignment challenging with complex concepts, critical thinking, and advanced problem-solving."
          break
      }
    }
    
    if (fileContent) {
      enhancedPrompt += `\n\nBased on the following file content, generate relevant questions and assignments:\n${fileContent}`
    }

    const result = await model.generateContent(enhancedPrompt)
    const response = await result.response
    const content = response.text() || "No response generated"

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    
    // Fallback to template-based generation if Gemini fails
    const { prompt, difficulty } = await request.json().catch(() => ({ prompt: "", difficulty: "intermediate" }))
    const fallbackContent = generateSmartContent(prompt, difficulty)
    
    return NextResponse.json({ 
      content: fallbackContent,
      fallback: true,
      message: "Generated using fallback template due to API issues"
    })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Enhanced Gemini API endpoint is working",
    status: "healthy",
    features: ["difficulty-based-generation", "file-content-processing", "fallback-templates"]
  })
}


function generateSmartContent(prompt: string, difficulty: string = "intermediate"): string {
  const lowerPrompt = prompt.toLowerCase()

  // Assignment generation templates
  if (lowerPrompt.includes("assignment") || lowerPrompt.includes("problem") || lowerPrompt.includes("exercise")) {
    if (lowerPrompt.includes("programming") || lowerPrompt.includes("coding") || lowerPrompt.includes("algorithm")) {
      const difficultyText = getDifficultyBasedContent(difficulty)
      return `Programming Assignment: Algorithm Implementation (${difficulty.toUpperCase()} Level)

Objective: Implement and analyze fundamental algorithms

${difficultyText.objectives}

Tasks:
1. Design and implement the specified algorithm
2. Analyze time and space complexity
3. Test with multiple input cases
4. Document your approach and findings
${difficultyText.additionalTasks}

Requirements:
- Clean, well-commented code
- Proper error handling
- Performance analysis
- Test cases with expected outputs
${difficultyText.additionalRequirements}

Evaluation Criteria:
- Code correctness and efficiency
- Documentation quality
- Test coverage
- Analysis depth
${difficultyText.evaluationCriteria}

Submission Guidelines:
- Submit source code files
- Include a detailed report
- Provide test results and analysis
- Follow coding standards
${difficultyText.submissionGuidelines}`
    }

    if (lowerPrompt.includes("research") || lowerPrompt.includes("paper") || lowerPrompt.includes("study")) {
      return `Research Assignment: Comprehensive Study

Objective: Conduct thorough research on the specified topic

Components:
1. Literature Review
   - Survey existing research
   - Identify key findings and gaps
   - Cite credible sources

2. Analysis and Discussion
   - Critical evaluation of findings
   - Compare different approaches
   - Present your insights

3. Conclusion and Future Work
   - Summarize key points
   - Suggest areas for further research
   - Practical implications

Requirements:
- Minimum 10 credible references
- Proper citation format
- Clear structure and flow
- Original analysis and insights

Evaluation:
- Research depth and quality
- Critical thinking
- Writing clarity
- Proper citations`
    }

    if (lowerPrompt.includes("data structure")) {
      return `Data Structures Assignment

Objective: Understand and implement fundamental data structures

Tasks:
1. Implement the following data structures:
   - Arrays and Dynamic Arrays
   - Linked Lists (Single and Double)
   - Stacks and Queues
   - Binary Trees
   - Hash Tables

2. For each data structure, provide:
   - Complete implementation
   - Time complexity analysis
   - Space complexity analysis
   - Real-world use cases

3. Comparison Analysis:
   - Compare performance characteristics
   - Discuss when to use each structure
   - Provide benchmarking results

Requirements:
- Code should be well-documented
- Include test cases for all operations
- Provide complexity analysis
- Submit working code with examples

Evaluation Criteria:
- Correctness of implementation
- Code quality and documentation
- Understanding of complexities
- Quality of analysis and comparisons`
    }

    if (lowerPrompt.includes("database")) {
      return `Database Design Assignment

Objective: Design and implement a comprehensive database system

Tasks:
1. Requirements Analysis
   - Identify entities and relationships
   - Define business rules
   - Specify functional requirements

2. Database Design
   - Create Entity-Relationship (ER) diagram
   - Design normalized tables
   - Define primary and foreign keys
   - Establish relationships and constraints

3. Implementation
   - Create database schema
   - Write SQL queries for CRUD operations
   - Implement stored procedures
   - Create views and indexes

4. Testing and Optimization
   - Test all database operations
   - Optimize query performance
   - Ensure data integrity

Requirements:
- Complete ER diagram
- Normalized database schema
- SQL scripts for table creation
- Sample data and test queries
- Documentation of design decisions

Evaluation:
- Quality of database design
- Proper normalization
- SQL query efficiency
- Documentation completeness`
    }

    if (lowerPrompt.includes("web") || lowerPrompt.includes("website")) {
      return `Web Development Assignment

Objective: Create a responsive and functional web application

Tasks:
1. Frontend Development
   - Design user-friendly interface
   - Implement responsive layout
   - Add interactive features
   - Ensure cross-browser compatibility

2. Backend Development
   - Set up server architecture
   - Implement API endpoints
   - Handle user authentication
   - Manage data persistence

3. Integration and Testing
   - Connect frontend with backend
   - Test all functionalities
   - Handle error scenarios
   - Optimize performance

Requirements:
- Modern web technologies (HTML5, CSS3, JavaScript)
- Responsive design principles
- Clean and maintainable code
- User authentication system
- Database integration

Evaluation Criteria:
- User interface design
- Code quality and organization
- Functionality completeness
- Performance and optimization
- Documentation quality`
    }
  }

  // Question generation for assignments
  if (lowerPrompt.includes("question") || lowerPrompt.includes("quiz") || lowerPrompt.includes("exam")) {
    if (lowerPrompt.includes("programming") || lowerPrompt.includes("coding")) {
      return `Programming Questions:

1. Array Manipulation
   Write a function to find the second largest element in an array without sorting.
   Input: [3, 1, 4, 1, 5, 9, 2, 6]
   Expected approach: Single pass algorithm with O(n) time complexity

2. String Processing
   Implement a function to check if a string is a palindrome, ignoring spaces and case.
   Consider edge cases like empty strings and single characters.

3. Data Structure Implementation
   Implement a stack using arrays with the following operations:
   - push(item): Add item to top
   - pop(): Remove and return top item
   - peek(): Return top item without removing
   - isEmpty(): Check if stack is empty

4. Algorithm Design
   Write an algorithm to find the shortest path between two nodes in a weighted graph.
   Explain your approach and analyze time complexity.

5. Problem Solving
   Given a sorted array with duplicates, find the first and last occurrence of a target element.
   Optimize for O(log n) time complexity using binary search.`
    }

    if (lowerPrompt.includes("theory") || lowerPrompt.includes("concept")) {
      return `Theory Questions:

1. Explain the difference between procedural and object-oriented programming paradigms. Provide examples of when each approach is most suitable.

2. Describe the concept of database normalization. Explain the first three normal forms with examples.

3. What is the difference between stack and heap memory? Discuss memory allocation and deallocation in both cases.

4. Explain the OSI model layers and their functions. How does data flow through these layers during network communication?

5. Discuss the principles of software engineering. How do these principles contribute to successful software development?

6. What are design patterns? Explain the Singleton and Observer patterns with real-world examples.

7. Describe different types of software testing. When would you use unit testing vs integration testing?

8. Explain the concept of Big O notation. Compare the time complexities of different sorting algorithms.`
    }

    if (lowerPrompt.includes("multiple choice") || lowerPrompt.includes("mcq")) {
      return `Multiple Choice Questions:

1. Which of the following is NOT a principle of Object-Oriented Programming?
   a) Encapsulation
   b) Inheritance
   c) Compilation
   d) Polymorphism

2. What is the time complexity of binary search?
   a) O(n)
   b) O(log n)
   c) O(n log n)
   d) O(n²)

3. Which data structure follows LIFO principle?
   a) Queue
   b) Stack
   c) Array
   d) Linked List

4. In database normalization, which normal form eliminates transitive dependencies?
   a) 1NF
   b) 2NF
   c) 3NF
   d) BCNF

5. Which HTTP method is used to update existing resources?
   a) GET
   b) POST
   c) PUT
   d) DELETE

6. What does SQL stand for?
   a) Structured Query Language
   b) Simple Query Language
   c) Standard Query Language
   d) Sequential Query Language

7. Which sorting algorithm has the best average-case time complexity?
   a) Bubble Sort
   b) Selection Sort
   c) Quick Sort
   d) Insertion Sort

8. What is the purpose of a foreign key in a database?
   a) To uniquely identify records
   b) To establish relationships between tables
   c) To improve query performance
   d) To enforce data types`
    }
  }

  // Faculty/Student ID generation
  if (lowerPrompt.includes("faculty id") || lowerPrompt.includes("student id") || lowerPrompt.includes("prn")) {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 999) + 1

    if (lowerPrompt.includes("faculty")) {
      return `Faculty ID: FAC${year}${random.toString().padStart(3, "0")}`
    } else if (lowerPrompt.includes("student")) {
      return `Student ID: STU${year}${random.toString().padStart(3, "0")}, PRN: ${year}USTU${random.toString().padStart(3, "0")}`
    }
  }

  // Default smart template
  return `Comprehensive Response

Thank you for your inquiry. Here's a detailed response addressing your request:

Overview:
This topic encompasses several important aspects that are relevant to your academic and professional development.

Key Components:
1. Fundamental Concepts
   - Core principles and theories
   - Historical context and evolution
   - Current state of the field

2. Practical Applications
   - Real-world implementations
   - Case studies and examples
   - Industry best practices

3. Skills and Competencies
   - Required knowledge base
   - Technical skills needed
   - Soft skills development

4. Future Perspectives
   - Emerging trends
   - Career opportunities
   - Continuous learning paths

Recommendations:
- Start with foundational knowledge
- Practice through hands-on projects
- Stay updated with latest developments
- Connect with professionals in the field`
}

function generateBasicContent(prompt: string): string {
  return `Content Response

Thank you for your request. Here's a structured response to address your needs:

Main Points:
- Comprehensive coverage of the topic
- Practical insights and applications
- Step-by-step guidance where applicable
- Additional resources for further learning

Key Takeaways:
- Understanding core concepts
- Practical implementation strategies
- Best practices and recommendations
- Common challenges and solutions

Next Steps:
- Review the provided information
- Apply concepts in practical scenarios
- Seek additional resources if needed
- Connect with peers and mentors

This content is designed to provide you with valuable insights and actionable information.

Basic content generation template used.`
}

function cleanContent(content: string): string {
  if (!content) return ""

  // Remove hash symbols and clean formatting
  let cleaned = content
    .replace(/#{1,6}\s*/g, "") // Remove markdown headers
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1") // Remove bold/italic markdown
    .replace(/`([^`]+)`/g, "$1") // Remove inline code formatting
    .replace(/^\s*[-*+]\s+/gm, "• ") // Convert markdown lists to bullet points
    .replace(/^\s*\d+\.\s+/gm, "") // Remove numbered list formatting
    .trim()

  // Ensure proper line spacing
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n")

  // Remove any remaining hash symbols at the start of lines
  cleaned = cleaned.replace(/^#+\s*/gm, "")

  return cleaned
}

function getDifficultyBasedContent(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case 'normal':
    case 'beginner':
      return {
        objectives: "Focus on understanding basic programming concepts and simple algorithm implementation.",
        additionalTasks: "5. Follow provided pseudocode or templates\n6. Use basic data structures (arrays, simple loops)",
        additionalRequirements: "- Use simple, readable code structure\n- Include comments explaining each step\n- Provide basic test cases",
        evaluationCriteria: "- Code functionality (60%)\n- Code readability (25%)\n- Basic documentation (15%)",
        submissionGuidelines: "- Use provided code templates\n- Include screenshots of working code\n- Submit within 3-5 days"
      }
    case 'intermediate':
      return {
        objectives: "Demonstrate solid understanding of algorithms and data structures with moderate complexity.",
        additionalTasks: "5. Implement error handling and edge cases\n6. Compare with alternative approaches\n7. Optimize for better performance",
        additionalRequirements: "- Implement multiple solution approaches\n- Include comprehensive test suite\n- Provide complexity analysis",
        evaluationCriteria: "- Algorithm correctness (40%)\n- Code quality and optimization (30%)\n- Analysis and documentation (30%)",
        submissionGuidelines: "- Include multiple implementation versions\n- Provide performance benchmarks\n- Submit within 1-2 weeks"
      }
    case 'hard':
    case 'advanced':
      return {
        objectives: "Master advanced algorithmic concepts and demonstrate expertise in complex problem-solving.",
        additionalTasks: "5. Implement advanced optimizations\n6. Handle complex edge cases and constraints\n7. Provide mathematical proof of correctness\n8. Compare with state-of-the-art solutions",
        additionalRequirements: "- Implement from scratch without templates\n- Include formal complexity proofs\n- Provide extensive benchmarking\n- Research and cite relevant literature",
        evaluationCriteria: "- Algorithmic innovation (35%)\n- Mathematical rigor (25%)\n- Performance optimization (25%)\n- Research quality (15%)",
        submissionGuidelines: "- Submit research paper format\n- Include experimental results\n- Provide source code with documentation\n- Submit within 2-3 weeks"
      }
    default:
      return {
        objectives: "Demonstrate understanding of programming concepts.",
        additionalTasks: "",
        additionalRequirements: "",
        evaluationCriteria: "",
        submissionGuidelines: ""
      }
  }
}
