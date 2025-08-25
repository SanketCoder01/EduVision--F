'use client';

import { useState, useEffect } from 'react';
import { ChatLayout } from '@/components/chat-layout';

export default function QueriesPage() {
  const [mockData, setMockData] = useState({
    user: { id: 'demo-student', email: 'demo@student.com' },
    conversations: [],
    faculty: [
      { 
        id: '1', 
        name: 'Dr. Smith', 
        department: 'Computer Science', 
        email: 'smith@university.edu',
        designation: 'Professor',
        profile_image_url: null
      },
      { 
        id: '2', 
        name: 'Prof. Johnson', 
        department: 'Computer Science', 
        email: 'johnson@university.edu',
        designation: 'Associate Professor',
        profile_image_url: null
      }
    ]
  });

  return (
    <div className="h-full">
      <div className="mb-4 px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Queries</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Chat with faculty members for academic support</p>
      </div>
      <div className="px-2 sm:px-4 lg:px-8">
        <ChatLayout
          user={mockData.user}
          initialConversations={mockData.conversations}
          facultyDirectory={mockData.faculty}
        />
      </div>
    </div>
  );
}
