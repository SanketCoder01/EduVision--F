"use client"

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface SubjectCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  textColor: string;
  onClickAction: (id: string) => void;
  index: number;
}

export function SubjectCard({ 
  id, 
  name, 
  description, 
  icon: Icon, 
  color, 
  bgColor, 
  textColor, 
  onClickAction, 
  index 
}: SubjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="h-full cursor-pointer group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${color}`} />
        <CardHeader className={`${bgColor} transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-300">
              <Icon className={`h-6 w-6 ${textColor}`} />
            </div>
            <div>
              <CardTitle className={`text-lg ${textColor} group-hover:text-opacity-80 transition-colors`}>
                {name}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 bg-white">
          <CardDescription className="text-gray-600 mb-6 leading-relaxed">
            {description}
          </CardDescription>
          <Button 
            onClick={() => onClickAction(id)}
            className={`w-full bg-gradient-to-r ${color} hover:opacity-90 transition-all duration-300 group-hover:shadow-lg`}
          >
            Start Learning
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
