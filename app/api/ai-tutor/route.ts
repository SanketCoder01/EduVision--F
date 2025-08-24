import { NextRequest, NextResponse } from 'next/server';

// Mock AI responses for different subjects
const subjectKnowledge = {
  dsa: {
    keywords: ['array', 'tree', 'graph', 'sort', 'search', 'algorithm', 'complexity', 'recursion', 'dynamic programming'],
    responses: {
      'array': 'Arrays are linear data structures that store elements in contiguous memory locations. Each element can be accessed using an index. Time complexity for access is O(1), but insertion/deletion can be O(n) in worst case.',
      'tree': 'Trees are hierarchical data structures with nodes connected by edges. Each node has a parent (except root) and can have multiple children. Common types include Binary Trees, BST, AVL, and Heap.',
      'graph': 'Graphs consist of vertices (nodes) and edges connecting them. They can be directed or undirected, weighted or unweighted. Common algorithms include DFS, BFS, Dijkstra, and Floyd-Warshall.',
      'sort': 'Sorting arranges elements in a specific order. Common algorithms: Bubble Sort O(n²), Quick Sort O(n log n) average, Merge Sort O(n log n) always, Heap Sort O(n log n).',
      'complexity': 'Time complexity measures how runtime grows with input size. Space complexity measures memory usage. Big O notation describes upper bounds: O(1), O(log n), O(n), O(n log n), O(n²).'
    }
  },
  dbms: {
    keywords: ['sql', 'normalization', 'acid', 'transaction', 'index', 'join', 'query', 'database'],
    responses: {
      'sql': 'SQL (Structured Query Language) is used to manage relational databases. Basic commands: SELECT (retrieve), INSERT (add), UPDATE (modify), DELETE (remove). Supports joins, subqueries, and aggregate functions.',
      'normalization': 'Database normalization reduces redundancy and dependency. 1NF: Atomic values, 2NF: No partial dependencies, 3NF: No transitive dependencies, BCNF: Every determinant is a candidate key.',
      'acid': 'ACID properties ensure database reliability: Atomicity (all or nothing), Consistency (valid state), Isolation (concurrent transactions), Durability (permanent changes).',
      'transaction': 'A transaction is a sequence of operations treated as a single unit. It must satisfy ACID properties. States: Active, Partially Committed, Committed, Failed, Aborted.',
      'index': 'Indexes improve query performance by creating shortcuts to data. Types: Primary (unique), Secondary, Clustered, Non-clustered. Trade-off: faster reads vs slower writes.'
    }
  },
  cn: {
    keywords: ['osi', 'tcp', 'ip', 'http', 'dns', 'routing', 'protocol', 'network'],
    responses: {
      'osi': 'OSI Model has 7 layers: Physical (bits), Data Link (frames), Network (packets), Transport (segments), Session, Presentation, Application. Each layer has specific functions.',
      'tcp': 'TCP (Transmission Control Protocol) provides reliable, ordered data delivery. Features: Connection-oriented, error detection/correction, flow control, congestion control.',
      'ip': 'IP (Internet Protocol) handles addressing and routing. IPv4 uses 32-bit addresses, IPv6 uses 128-bit. Provides best-effort delivery without guarantees.',
      'http': 'HTTP (HyperText Transfer Protocol) is application layer protocol for web communication. Methods: GET, POST, PUT, DELETE. Status codes: 200 (OK), 404 (Not Found), 500 (Server Error).',
      'routing': 'Routing determines paths for data packets. Algorithms: Distance Vector (RIP), Link State (OSPF), Path Vector (BGP). Metrics: hop count, bandwidth, delay.'
    }
  },
  os: {
    keywords: ['process', 'thread', 'memory', 'scheduling', 'deadlock', 'file system', 'synchronization'],
    responses: {
      'process': 'A process is a program in execution with its own memory space. States: New, Ready, Running, Waiting, Terminated. Process Control Block (PCB) stores process information.',
      'thread': 'Threads are lightweight processes sharing memory space. Benefits: parallelism, responsiveness, resource sharing. Types: User-level, Kernel-level, Hybrid.',
      'memory': 'Memory management handles RAM allocation. Techniques: Paging (fixed-size blocks), Segmentation (variable-size), Virtual Memory (disk as extension of RAM).',
      'scheduling': 'CPU scheduling decides which process runs next. Algorithms: FCFS, SJF, Round Robin, Priority, Multilevel Queue. Goals: fairness, efficiency, responsiveness.',
      'deadlock': 'Deadlock occurs when processes wait for each other indefinitely. Conditions: Mutual exclusion, Hold and wait, No preemption, Circular wait. Prevention/avoidance strategies exist.'
    }
  },
  math: {
    keywords: ['calculus', 'algebra', 'probability', 'statistics', 'matrix', 'derivative', 'integral'],
    responses: {
      'calculus': 'Calculus studies continuous change. Differential calculus (derivatives) finds rates of change. Integral calculus finds areas under curves. Applications in optimization, physics, engineering.',
      'algebra': 'Linear algebra deals with vectors, matrices, and linear transformations. Key concepts: vector spaces, eigenvalues, eigenvectors, determinants, matrix operations.',
      'probability': 'Probability measures likelihood of events. Range: 0 to 1. Rules: Addition (OR), Multiplication (AND), Conditional probability. Distributions: Normal, Binomial, Poisson.',
      'statistics': 'Statistics analyzes data to make inferences. Descriptive: mean, median, mode, variance. Inferential: hypothesis testing, confidence intervals, regression analysis.',
      'matrix': 'Matrices are rectangular arrays of numbers. Operations: addition, multiplication, transpose, inverse. Applications: solving linear systems, transformations, data representation.'
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    const { message, subject, image } = await request.json();

    // Handle image OCR (mock implementation)
    if (image) {
      return NextResponse.json({
        response: `I can see the image you've uploaded! Based on the visual content, this appears to be a ${subject} problem. Let me analyze it step by step:

1. First, I'll identify the key elements in the image
2. Then I'll break down the problem systematically  
3. Finally, I'll provide a detailed solution with explanations

For mathematical problems, I can recognize equations, graphs, and diagrams. For programming problems, I can read code snippets and identify algorithms. Would you like me to solve this specific problem?`,
        confidence: 0.95
      });
    }

    // Get subject knowledge
    const knowledge = subjectKnowledge[subject as keyof typeof subjectKnowledge];
    if (!knowledge) {
      return NextResponse.json({
        response: "I'm sorry, I don't have information about that subject yet. Please try one of the available subjects: DSA, DBMS, Computer Networks, Operating Systems, or Mathematics.",
        confidence: 0.1
      });
    }

    // Find relevant response based on keywords
    const lowerMessage = message.toLowerCase();
    let bestMatch = '';
    let bestResponse = '';

    for (const keyword of knowledge.keywords) {
      if (lowerMessage.includes(keyword)) {
        if (knowledge.responses[keyword]) {
          bestMatch = keyword;
          bestResponse = knowledge.responses[keyword];
          break;
        }
      }
    }

    // If no specific match, provide general help
    if (!bestResponse) {
      bestResponse = `I'd be happy to help you with ${subject}! I can explain concepts, solve problems, and answer questions about ${knowledge.keywords.join(', ')}. Could you be more specific about what you'd like to learn?`;
    }

    // Add some context and make it more conversational
    const enhancedResponse = `${bestResponse}

Would you like me to:
- Explain this concept with an example?
- Show you how to solve a related problem?
- Provide practice questions?
- Clarify any specific part?

Feel free to ask follow-up questions!`;

    return NextResponse.json({
      response: enhancedResponse,
      confidence: bestMatch ? 0.9 : 0.6,
      relatedTopics: knowledge.keywords.filter(k => k !== bestMatch).slice(0, 3)
    });

  } catch (error) {
    console.error('AI Tutor API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
