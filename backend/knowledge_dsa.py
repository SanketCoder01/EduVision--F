# Data Structures & Algorithms Knowledge Base - 10 Q&A pairs

DSA_QA = [
    {
        "question": "What is time complexity and how do you calculate it?",
        "answer": "Time complexity measures how the runtime of an algorithm grows with input size. It's expressed using Big O notation:\n\n• O(1) - Constant time: Array access\n• O(log n) - Logarithmic: Binary search\n• O(n) - Linear: Simple loop\n• O(n log n) - Linearithmic: Merge sort\n• O(n²) - Quadratic: Nested loops\n\nTo calculate: Count the most frequently executed operation and express as a function of input size n."
    },
    {
        "question": "Explain the difference between arrays and linked lists",
        "answer": "**Arrays:**\n• Fixed size, contiguous memory\n• O(1) random access by index\n• O(n) insertion/deletion (except at end)\n• Better cache performance\n\n**Linked Lists:**\n• Dynamic size, scattered memory\n• O(n) sequential access only\n• O(1) insertion/deletion if you have the node\n• Extra memory for pointers\n\n**Use arrays** when you need fast random access. **Use linked lists** when you frequently insert/delete elements."
    },
    {
        "question": "How does binary search work and what's its complexity?",
        "answer": "Binary search works on **sorted arrays** by repeatedly dividing the search space in half:\n\n```\n1. Compare target with middle element\n2. If equal, found!\n3. If target < middle, search left half\n4. If target > middle, search right half\n5. Repeat until found or space exhausted\n```\n\n**Time Complexity:** O(log n)\n**Space Complexity:** O(1) iterative, O(log n) recursive\n\n**Key requirement:** Array must be sorted first!"
    },
    {
        "question": "What are the different types of trees in data structures?",
        "answer": "**Common Tree Types:**\n\n1. **Binary Tree:** Each node has ≤ 2 children\n2. **Binary Search Tree (BST):** Left < Root < Right property\n3. **AVL Tree:** Self-balancing BST, height difference ≤ 1\n4. **Red-Black Tree:** Self-balancing with color properties\n5. **Heap:** Complete binary tree, max/min property\n6. **B-Tree:** Multi-way tree for databases\n7. **Trie:** Prefix tree for strings\n\n**Applications:** BST for searching, Heap for priority queues, Trie for autocomplete."
    },
    {
        "question": "Explain dynamic programming with an example",
        "answer": "Dynamic Programming solves complex problems by breaking them into simpler subproblems and storing results to avoid recomputation.\n\n**Example - Fibonacci:**\n```\n// Naive recursion: O(2^n)\nfib(n) = fib(n-1) + fib(n-2)\n\n// DP approach: O(n)\nfib[0] = 0, fib[1] = 1\nfor i = 2 to n:\n    fib[i] = fib[i-1] + fib[i-2]\n```\n\n**Key Principles:**\n1. Optimal substructure\n2. Overlapping subproblems\n3. Memoization (top-down) or Tabulation (bottom-up)"
    },
    {
        "question": "What is the difference between DFS and BFS?",
        "answer": "**Depth-First Search (DFS):**\n• Uses Stack (or recursion)\n• Goes deep before exploring siblings\n• Space: O(h) where h = height\n• Good for: Path finding, topological sort\n\n**Breadth-First Search (BFS):**\n• Uses Queue\n• Explores all neighbors before going deeper\n• Space: O(w) where w = maximum width\n• Good for: Shortest path, level-order traversal\n\n**Memory:** DFS uses less memory for deep trees, BFS uses less for wide trees."
    },
    {
        "question": "How do hash tables work and what are collision resolution techniques?",
        "answer": "**Hash Tables** use hash functions to map keys to array indices for O(1) average access.\n\n**Hash Function:** key → hash(key) % table_size\n\n**Collision Resolution:**\n1. **Chaining:** Store multiple values in linked lists\n2. **Open Addressing:**\n   - Linear Probing: Check next slot\n   - Quadratic Probing: Check i² slots away\n   - Double Hashing: Use second hash function\n\n**Load Factor:** items/table_size. Keep < 0.75 for good performance."
    },
    {
        "question": "What are the different sorting algorithms and their complexities?",
        "answer": "**Sorting Algorithm Comparison:**\n\n| Algorithm | Best | Average | Worst | Space | Stable |\n|-----------|------|---------|-------|-------|---------|\n| Bubble | O(n) | O(n²) | O(n²) | O(1) | Yes |\n| Selection | O(n²) | O(n²) | O(n²) | O(1) | No |\n| Insertion | O(n) | O(n²) | O(n²) | O(1) | Yes |\n| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |\n| Quick | O(n log n) | O(n log n) | O(n²) | O(log n) | No |\n| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) | No |\n\n**Use Merge Sort** for guaranteed O(n log n), **Quick Sort** for average case performance."
    },
    {
        "question": "Explain graph representation methods",
        "answer": "**Graph Representation Methods:**\n\n**1. Adjacency Matrix:**\n```\n  A B C\nA 0 1 1\nB 1 0 0  \nC 1 0 0\n```\n• Space: O(V²)\n• Edge lookup: O(1)\n• Good for dense graphs\n\n**2. Adjacency List:**\n```\nA: [B, C]\nB: [A]\nC: [A]\n```\n• Space: O(V + E)\n• Edge lookup: O(degree)\n• Good for sparse graphs\n\n**3. Edge List:** Array of (u, v, weight) tuples\n• Space: O(E)\n• Good for algorithms like Kruskal's"
    },
    {
        "question": "What is the difference between stack and queue?",
        "answer": "**Stack (LIFO - Last In, First Out):**\n• Operations: push(), pop(), top(), isEmpty()\n• Applications: Function calls, expression evaluation, undo operations\n• Implementation: Array or linked list\n\n**Queue (FIFO - First In, First Out):**\n• Operations: enqueue(), dequeue(), front(), isEmpty()\n• Applications: BFS, task scheduling, printer queues\n• Implementation: Array (circular) or linked list\n\n**Memory:** Both can be O(n) space, O(1) operations when implemented correctly."
    }
]
