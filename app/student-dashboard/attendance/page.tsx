'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Clock, Calendar, Check, X, ChevronDown, Camera, MapPin, Loader2 } from 'lucide-react';

// Mock data
const SUBJECTS = [
  { id: 'cs101', name: 'Data Structures', code: 'CS101', type: 'theory', total: 30, attended: 22 },
  { id: 'cs102', name: 'Algorithms', code: 'CS102', type: 'theory', total: 30, attended: 25 },
  { id: 'cs103', name: 'Database Systems', code: 'CS103', type: 'theory', total: 30, attended: 28 },
  { id: 'csl101', name: 'DS Lab', code: 'CSL101', type: 'lab', total: 15, attended: 12 },
  { id: 'csl102', name: 'DBMS Lab', code: 'CSL102', type: 'lab', total: 15, attended: 10 },
];

const TIME_SLOTS = [
  '10:00 - 10:50',
  '10:50 - 11:50',
  '12:30 - 13:30',
  '13:30 - 14:30',
  '14:50 - 15:50',
  '15:50 - 16:50',
];

export default function AttendancePage() {

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm p-4 border-b border-gray-100 z-10">
        <h1 className="text-xl font-bold">My Attendance</h1>
      </div>

      {/* Subjects List */}
      <div className="p-4 space-y-3">
        {SUBJECTS.map((subject, i) => {
          const percentage = Math.round((subject.attended / subject.total) * 100);
          
          return (
            <Link href={`/student-dashboard/attendance/${subject.id}`} key={subject.id} className="block">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:ring-2 hover:ring-blue-500 transition-all"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{subject.name}</div>
                    <div className="text-sm text-gray-500">{subject.code}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{percentage}%</div>
                    <div className="text-xs text-gray-500">
                      {subject.attended}/{subject.total} classes
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      
    </div>
  );
}
