import os
import json
import base64
from io import BytesIO
from PIL import Image
import pytesseract
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from transformers import pipeline, AutoTokenizer, AutoModelForQuestionAnswering
import torch

app = Flask(__name__)
CORS(app)

# Initialize ML models
print("Loading AI models...")

# Question Answering model for educational content
qa_pipeline = pipeline(
    "question-answering",
    model="distilbert-base-cased-distilled-squad",
    tokenizer="distilbert-base-cased-distilled-squad"
)

# Import comprehensive knowledge bases
from knowledge_dsa import DSA_QA
from knowledge_dbms import DBMS_QA
from knowledge_cn import CN_QA
from knowledge_os import OS_QA
from knowledge_math import MATH_QA

# Comprehensive knowledge base with 50 Q&A pairs (10 per subject)
COMPREHENSIVE_QA_DATABASE = {
    "dsa": DSA_QA,
    "dbms": DBMS_QA,
    "cn": CN_QA,
    "os": OS_QA,
    "math": MATH_QA
}

# Educational knowledge base for different subjects
KNOWLEDGE_BASE = {
    "dsa": {
        "context": """
        Data Structures and Algorithms (DSA) is fundamental to computer science. Arrays are linear data structures 
        storing elements in contiguous memory with O(1) access time. Trees are hierarchical structures with nodes 
        connected by edges, including binary trees, BST, AVL trees. Graphs consist of vertices and edges, supporting 
        algorithms like DFS, BFS, Dijkstra's shortest path. Sorting algorithms include bubble sort O(n²), merge sort 
        O(n log n), quick sort average O(n log n). Dynamic programming solves complex problems by breaking them into 
        simpler subproblems. Time complexity measures algorithm efficiency using Big O notation: O(1) constant, 
        O(log n) logarithmic, O(n) linear, O(n²) quadratic.
        """,
        "topics": ["arrays", "trees", "graphs", "sorting", "searching", "dynamic programming", "complexity analysis"]
    },
    "dbms": {
        "context": """
        Database Management Systems (DBMS) organize and manage data efficiently. SQL is the standard language for 
        relational databases with commands like SELECT, INSERT, UPDATE, DELETE. Normalization reduces redundancy: 
        1NF ensures atomic values, 2NF eliminates partial dependencies, 3NF removes transitive dependencies. 
        ACID properties ensure database reliability: Atomicity (all or nothing), Consistency (valid states), 
        Isolation (concurrent transactions), Durability (permanent storage). Indexing improves query performance 
        with primary, secondary, clustered, and non-clustered indexes. Transactions are sequences of operations 
        treated as single units. Joins combine data from multiple tables: INNER, LEFT, RIGHT, FULL OUTER joins.
        """,
        "topics": ["sql", "normalization", "acid properties", "indexing", "transactions", "joins", "query optimization"]
    },
    "cn": {
        "context": """
        Computer Networks enable communication between devices. The OSI model has 7 layers: Physical (bits), 
        Data Link (frames), Network (packets), Transport (segments), Session, Presentation, Application. 
        TCP provides reliable, connection-oriented communication with error detection and flow control. 
        IP handles addressing and routing with IPv4 (32-bit) and IPv6 (128-bit) addresses. HTTP is the 
        application protocol for web communication with methods GET, POST, PUT, DELETE. Routing algorithms 
        find optimal paths: distance vector (RIP), link state (OSPF), path vector (BGP). Network security 
        includes firewalls, encryption, VPNs, and intrusion detection systems.
        """,
        "topics": ["osi model", "tcp/ip", "http", "routing", "network security", "protocols", "addressing"]
    },
    "os": {
        "context": """
        Operating Systems manage computer resources and provide services to applications. Processes are programs 
        in execution with states: new, ready, running, waiting, terminated. Threads are lightweight processes 
        sharing memory space for parallelism. Memory management includes paging (fixed-size blocks), segmentation 
        (variable-size), and virtual memory extending RAM with disk storage. CPU scheduling algorithms decide 
        process execution order: FCFS, SJF, Round Robin, Priority scheduling. Deadlock occurs when processes 
        wait indefinitely, prevented by avoiding circular wait conditions. File systems organize data storage 
        with directories, files, and access permissions.
        """,
        "topics": ["processes", "threads", "memory management", "scheduling", "deadlock", "file systems", "synchronization"]
    },
    "math": {
        "context": """
        Mathematics provides the foundation for computer science and engineering. Calculus studies continuous 
        change with derivatives measuring rates of change and integrals finding areas under curves. Linear 
        algebra deals with vectors, matrices, and transformations essential for graphics and machine learning. 
        Probability theory measures uncertainty with events having probabilities between 0 and 1. Statistics 
        analyzes data using descriptive measures (mean, median, variance) and inferential methods (hypothesis 
        testing, confidence intervals). Discrete mathematics covers logic, set theory, combinatorics, and 
        graph theory fundamental to algorithm design.
        """,
        "topics": ["calculus", "linear algebra", "probability", "statistics", "discrete mathematics", "matrices", "derivatives"]
    }
}

def find_best_qa_match(question, subject):
    """Find the best matching Q&A pair from comprehensive database"""
    qa_pairs = COMPREHENSIVE_QA_DATABASE.get(subject, [])
    
    question_lower = question.lower()
    best_match = None
    best_score = 0
    
    for qa in qa_pairs:
        qa_question_lower = qa['question'].lower()
        
        # Simple keyword matching score
        question_words = set(question_lower.split())
        qa_words = set(qa_question_lower.split())
        
        # Calculate similarity score
        common_words = question_words.intersection(qa_words)
        if len(qa_words) > 0:
            score = len(common_words) / len(qa_words)
            
            # Boost score for exact phrase matches
            if any(phrase in question_lower for phrase in qa_question_lower.split() if len(phrase) > 3):
                score += 0.3
                
            if score > best_score:
                best_score = score
                best_match = qa
    
    return best_match, best_score

@app.route('/api/ml/answer', methods=['POST'])
def get_answer():
    try:
        data = request.json
        question = data.get('question', '')
        subject = data.get('subject', 'dsa')
        
        if not question:
            return jsonify({'error': 'Question is required'}), 400
        
        # First try to find exact match in comprehensive Q&A database
        best_qa, match_score = find_best_qa_match(question, subject)
        
        if best_qa and match_score > 0.3:  # Good match found
            answer = best_qa['answer']
            confidence = min(0.95, 0.7 + match_score)
        else:
            # Fall back to ML model with context
            subject_data = KNOWLEDGE_BASE.get(subject, KNOWLEDGE_BASE['dsa'])
            context = subject_data['context']
            
            # Use QA model to get answer
            result = qa_pipeline(question=question, context=context)
            answer = result['answer']
            confidence = result['score']
        
        # Enhance answer with educational formatting
        enhanced_answer = enhance_educational_answer(answer, question, subject)
        
        return jsonify({
            'answer': enhanced_answer,
            'confidence': confidence,
            'subject': subject,
            'related_topics': KNOWLEDGE_BASE[subject]['topics'][:3],
            'source': 'comprehensive_db' if best_qa and match_score > 0.3 else 'ml_model'
        })
        
    except Exception as e:
        print(f"Error in answer generation: {e}")
        return jsonify({'error': 'Failed to generate answer'}), 500

@app.route('/api/ml/ocr', methods=['POST'])
def process_ocr():
    try:
        data = request.json
        image_data = data.get('image', '')
        subject = data.get('subject', 'dsa')
        
        if not image_data:
            return jsonify({'error': 'Image data is required'}), 400
        
        # Decode base64 image
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        
        # Perform OCR
        extracted_text = pytesseract.image_to_string(image, config='--psm 6')
        
        # Clean and process extracted text
        cleaned_text = clean_ocr_text(extracted_text)
        
        # Generate contextual response based on extracted text
        if cleaned_text.strip():
            # Use the extracted text as a question for the QA system
            subject_data = KNOWLEDGE_BASE.get(subject, KNOWLEDGE_BASE['dsa'])
            context = subject_data['context']
            
            try:
                result = qa_pipeline(question=cleaned_text, context=context)
                enhanced_answer = enhance_educational_answer(result['answer'], cleaned_text, subject)
            except:
                enhanced_answer = f"I can see this is a {subject} problem. Let me help you solve it step by step based on what I extracted from the image."
        else:
            enhanced_answer = "I can see the image but couldn't extract clear text. Could you try uploading a clearer image or type your question?"
        
        return jsonify({
            'success': True,
            'extracted_text': cleaned_text,
            'answer': enhanced_answer,
            'confidence': 0.85 if cleaned_text.strip() else 0.3,
            'subject': subject
        })
        
    except Exception as e:
        print(f"Error in OCR processing: {e}")
        return jsonify({'error': 'Failed to process image'}), 500

def clean_ocr_text(text):
    """Clean and format OCR extracted text"""
    # Remove extra whitespace and clean up common OCR errors
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    cleaned = '\n'.join(lines)
    
    # Basic cleanup of common OCR mistakes
    replacements = {
        '|': 'I',
        '0': 'O',  # Context-dependent
        '5': 'S',  # Context-dependent
        '1': 'l',  # Context-dependent
    }
    
    # Apply replacements cautiously
    for old, new in replacements.items():
        if old in cleaned and len(cleaned) < 100:  # Only for short texts
            cleaned = cleaned.replace(old, new)
    
    return cleaned

def enhance_educational_answer(answer, question, subject):
    """Enhance the AI answer with educational formatting and context"""
    
    # Add subject-specific enhancements
    if subject == 'dsa':
        if any(word in question.lower() for word in ['complexity', 'time', 'space']):
            answer += "\n\n💡 **Quick Tip**: Remember that time complexity describes how runtime grows with input size, while space complexity measures memory usage."
        elif any(word in question.lower() for word in ['sort', 'sorting']):
            answer += "\n\n📊 **Common Sorting Complexities**:\n- Bubble Sort: O(n²)\n- Merge Sort: O(n log n)\n- Quick Sort: O(n log n) average"
    
    elif subject == 'dbms':
        if any(word in question.lower() for word in ['normal', 'normalization']):
            answer += "\n\n🎯 **Normalization Steps**:\n1. 1NF: Eliminate repeating groups\n2. 2NF: Remove partial dependencies\n3. 3NF: Remove transitive dependencies"
        elif 'sql' in question.lower():
            answer += "\n\n💻 **SQL Tip**: Always use proper indexing for better query performance!"
    
    elif subject == 'cn':
        if 'osi' in question.lower():
            answer += "\n\n🌐 **OSI Layers Memory Trick**: Please Do Not Throw Sausage Pizza Away\n(Physical, Data Link, Network, Transport, Session, Presentation, Application)"
        elif any(word in question.lower() for word in ['tcp', 'udp']):
            answer += "\n\n⚡ **Quick Comparison**: TCP is reliable but slower, UDP is fast but unreliable"
    
    elif subject == 'os':
        if any(word in question.lower() for word in ['process', 'thread']):
            answer += "\n\n🔄 **Key Difference**: Processes have separate memory spaces, threads share memory within a process"
        elif 'deadlock' in question.lower():
            answer += "\n\n🚫 **Deadlock Prevention**: Avoid circular wait by ordering resources consistently"
    
    elif subject == 'math':
        if any(word in question.lower() for word in ['derivative', 'integral']):
            answer += "\n\n📐 **Remember**: Derivative finds slope, integral finds area under curve"
        elif 'matrix' in question.lower():
            answer += "\n\n🔢 **Matrix Operations**: Remember that matrix multiplication is not commutative (AB ≠ BA)"
    
    # Add general educational formatting
    answer = f"**Answer**: {answer}\n\n"
    answer += "❓ **Need more help?** Feel free to ask follow-up questions or request examples!"
    
    return answer

if __name__ == '__main__':
    print("Starting ML Service for AI Tutor...")
    print("Available endpoints:")
    print("- POST /api/ml/answer - Get AI answers for questions")
    print("- POST /api/ml/ocr - Process images with OCR")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
