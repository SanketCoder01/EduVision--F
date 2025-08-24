"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Lightbulb, TrendingUp, BookOpen, RefreshCw } from 'lucide-react';

interface AISuggestionsProps {
  studentName: string;
  assignmentTitle: string;
  grade: number;
  feedback: string;
  subject: string;
  weakAreas?: string[];
  strongAreas?: string[];
  submissionId: string;
}

export default function AISuggestions({
  studentName,
  assignmentTitle,
  grade,
  feedback,
  subject,
  weakAreas = [],
  strongAreas = [],
  submissionId
}: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateSuggestions = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ai/generate-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName,
          assignmentTitle,
          grade,
          feedback,
          subject,
          weakAreas,
          strongAreas
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuggestions(result.suggestions);
        setHasGenerated(true);
      } else {
        setError(result.error || 'Failed to generate suggestions');
      }
    } catch (err) {
      setError('Failed to connect to AI service');
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeColor = () => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeMessage = () => {
    if (grade >= 90) return 'Excellent Performance! 🌟';
    if (grade >= 80) return 'Great Work! 👏';
    if (grade >= 70) return 'Good Effort! 👍';
    return 'Keep Improving! 💪';
  };

  return (
    <Card className="mt-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500 rounded-full">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl text-purple-800">
              AI Learning Assistant
            </CardTitle>
            <p className="text-sm text-purple-600 mt-1">
              Personalized suggestions based on your performance
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Performance Summary */}
        <div className="bg-white/70 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-800">Performance Summary</h4>
            <span className={`font-bold text-lg ${getGradeColor()}`}>
              {grade}%
            </span>
          </div>
          <p className={`font-medium ${getGradeColor()}`}>
            {getGradeMessage()}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          {strongAreas.length > 0 && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Strengths</span>
              </div>
              <div className="text-sm text-green-700">
                {strongAreas.slice(0, 2).map((area, index) => (
                  <span key={index} className="inline-block bg-green-100 px-2 py-1 rounded mr-1 mb-1">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {weakAreas.length > 0 && (
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-800">Focus Areas</span>
              </div>
              <div className="text-sm text-orange-700">
                {weakAreas.slice(0, 2).map((area, index) => (
                  <span key={index} className="inline-block bg-orange-100 px-2 py-1 rounded mr-1 mb-1">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Suggestions */}
        {!hasGenerated ? (
          <div className="text-center py-6">
            <Lightbulb className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">
              Get personalized learning suggestions powered by AI
            </p>
            <Button
              onClick={generateSuggestions}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 mx-auto"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Suggestions...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Generate AI Suggestions
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="bg-white/70 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-purple-800 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Personalized Suggestions
              </h4>
              <Button
                onClick={generateSuggestions}
                disabled={isLoading}
                className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700">
              {suggestions.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="mb-2 leading-relaxed">
                    {paragraph.trim()}
                  </p>
                )
              ))}
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
