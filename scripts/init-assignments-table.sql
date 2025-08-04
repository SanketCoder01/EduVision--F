-- Initialize assignments table with sample data

-- Insert sample assignments for different departments and years
INSERT INTO assignments (
    title, 
    description, 
    faculty_id, 
    department, 
    year, 
    assignment_type, 
    allowed_file_types, 
    max_marks, 
    due_date, 
    status
) VALUES 
(
    'Data Structures Implementation',
    'Implement basic data structures including Stack, Queue, and Linked List in your preferred programming language. Include proper documentation and test cases.',
    (SELECT id FROM faculty WHERE email = 'john.smith@university.edu' LIMIT 1),
    'cse',
    'second',
    'file_upload',
    ARRAY['zip', 'pdf', 'docx'],
    100,
    NOW() + INTERVAL '7 days',
    'published'
),
(
    'Machine Learning Project',
    'Create a machine learning model to solve a real-world problem. Submit your code, dataset, and a detailed report explaining your approach and results.',
    (SELECT id FROM faculty WHERE email = 'sarah.johnson@university.edu' LIMIT 1),
    'aids',
    'first',
    'file_upload',
    ARRAY['zip', 'pdf', 'ipynb'],
    150,
    NOW() + INTERVAL '14 days',
    'published'
),
(
    'Network Security Analysis',
    'Analyze a given network topology and identify potential security vulnerabilities. Provide recommendations for improving security.',
    (SELECT id FROM faculty WHERE email = 'michael.brown@university.edu' LIMIT 1),
    'cy',
    'third',
    'file_upload',
    ARRAY['pdf', 'docx'],
    80,
    NOW() + INTERVAL '10 days',
    'published'
),
(
    'Neural Network Essay',
    'Write a comprehensive essay on the evolution of neural networks and their applications in modern AI systems.',
    (SELECT id FROM faculty WHERE email = 'emily.davis@university.edu' LIMIT 1),
    'aiml',
    'first',
    'text_based',
    ARRAY[]::text[],
    50,
    NOW() + INTERVAL '5 days',
    'published'
),
(
    'Database Design Project',
    'Design and implement a database system for a library management system. Include ER diagrams, normalization, and SQL queries.',
    (SELECT id FROM faculty WHERE email = 'john.smith@university.edu' LIMIT 1),
    'cse',
    'second',
    'file_upload',
    ARRAY['sql', 'pdf', 'zip'],
    120,
    NOW() + INTERVAL '21 days',
    'published'
),
(
    'AI Ethics Discussion',
    'Discuss the ethical implications of artificial intelligence in healthcare. Consider privacy, bias, and decision-making aspects.',
    (SELECT id FROM faculty WHERE email = 'sarah.johnson@university.edu' LIMIT 1),
    'aids',
    'first',
    'text_based',
    ARRAY[]::text[],
    60,
    NOW() + INTERVAL '3 days',
    'published'
),
(
    'Cryptography Implementation',
    'Implement RSA encryption and decryption algorithms. Demonstrate with examples and explain the mathematical concepts.',
    (SELECT id FROM faculty WHERE email = 'michael.brown@university.edu' LIMIT 1),
    'cy',
    'third',
    'file_upload',
    ARRAY['py', 'java', 'cpp', 'pdf'],
    90,
    NOW() + INTERVAL '12 days',
    'published'
),
(
    'Deep Learning Research Paper',
    'Write a research paper on recent advances in deep learning architectures. Include literature review and comparative analysis.',
    (SELECT id FROM faculty WHERE email = 'emily.davis@university.edu' LIMIT 1),
    'aiml',
    'first',
    'file_upload',
    ARRAY['pdf', 'docx'],
    100,
    NOW() + INTERVAL '28 days',
    'published'
);

-- Insert sample assignment resources
INSERT INTO assignment_resources (assignment_id, name, file_type, file_url)
SELECT 
    a.id,
    'Assignment Guidelines.pdf',
    'application/pdf',
    'https://example.com/resources/guidelines.pdf'
FROM assignments a 
WHERE a.title = 'Data Structures Implementation';

INSERT INTO assignment_resources (assignment_id, name, file_type, file_url)
SELECT 
    a.id,
    'Sample Dataset.csv',
    'text/csv',
    'https://example.com/resources/sample_dataset.csv'
FROM assignments a 
WHERE a.title = 'Machine Learning Project';

INSERT INTO assignment_resources (assignment_id, name, file_type, file_url)
SELECT 
    a.id,
    'Network Topology Diagram.png',
    'image/png',
    'https://example.com/resources/network_topology.png'
FROM assignments a 
WHERE a.title = 'Network Security Analysis';

-- Insert some sample submissions
INSERT INTO assignment_submissions (
    assignment_id,
    student_id,
    content,
    status,
    grade,
    feedback,
    graded_by,
    graded_at
)
SELECT 
    a.id,
    s.id,
    'This is my submission for the neural network essay. Neural networks have evolved significantly over the past decades...',
    'graded',
    45,
    'Good work! Your understanding of neural networks is clear. Consider adding more recent research examples.',
    a.faculty_id,
    NOW() - INTERVAL '1 day'
FROM assignments a
JOIN students s ON s.department = a.department AND s.year = a.year
WHERE a.title = 'Neural Network Essay' AND s.email = 'eva.brown@student.edu';

INSERT INTO assignment_submissions (
    assignment_id,
    student_id,
    file_urls,
    file_names,
    status,
    grade,
    feedback,
    graded_by,
    graded_at
)
SELECT 
    a.id,
    s.id,
    ARRAY['https://example.com/submissions/alice_data_structures.zip'],
    ARRAY['data_structures_project.zip'],
    'graded',
    85,
    'Excellent implementation! Your code is well-structured and documented. Minor improvements needed in error handling.',
    a.faculty_id,
    NOW() - INTERVAL '2 days'
FROM assignments a
JOIN students s ON s.department = a.department AND s.year = a.year
WHERE a.title = 'Data Structures Implementation' AND s.email = 'alice.johnson@student.edu';

INSERT INTO assignment_submissions (
    assignment_id,
    student_id,
    file_urls,
    file_names,
    status
)
SELECT 
    a.id,
    s.id,
    ARRAY['https://example.com/submissions/bob_data_structures.zip'],
    ARRAY['my_data_structures.zip'],
    'submitted'
FROM assignments a
JOIN students s ON s.department = a.department AND s.year = a.year
WHERE a.title = 'Data Structures Implementation' AND s.email = 'bob.smith@student.edu';

COMMIT;
