"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, FileText, RefreshCw, Download } from 'lucide-react';

interface PlagiarismResult {
  percentPlagiarism: number;
  sources: Array<{
    url: string;
    title: string;
    similarity: number;
  }>;
  citations?: Array<{
    text: string;
    source: string;
  }>;
}

interface EnhancedPlagiarismReportProps {
  text: string;
  onReportGenerated?: (result: PlagiarismResult) => void;
  autoCheck?: boolean;
}

export default function EnhancedPlagiarismReport({ 
  text, 
  onReportGenerated, 
  autoCheck = false 
}: EnhancedPlagiarismReportProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkPlagiarism = async () => {
    if (!text || text.length < 40) {
      setError('Text must be at least 40 characters long for plagiarism checking');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/plagiarism/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language: 'en',
          includeCitations: true,
          scrapeSources: true
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        onReportGenerated?.(data.data);
      } else {
        setError(data.error || 'Failed to check plagiarism');
      }
    } catch (err) {
      setError('Network error occurred while checking plagiarism');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoCheck && text && text.length >= 40) {
      checkPlagiarism();
    }
  }, [autoCheck, text]);

  const getPlagiarismColor = (percentage: number) => {
    if (percentage < 10) return 'text-green-600';
    if (percentage < 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPlagiarismBadgeColor = (percentage: number) => {
    if (percentage < 10) return 'bg-green-100 text-green-800';
    if (percentage < 25) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const downloadReport = () => {
    if (!result) return;

    const reportData = {
      plagiarismPercentage: result.percentPlagiarism,
      sources: result.sources,
      citations: result.citations,
      checkedAt: new Date().toISOString(),
      textLength: text.length
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plagiarism-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Plagiarism Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result && !loading && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                Click below to check for plagiarism in your submission
              </p>
              <Button onClick={checkPlagiarism} disabled={!text || text.length < 40}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Check Plagiarism
              </Button>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 mx-auto animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Analyzing text for plagiarism...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="text-center">
                <div className={`text-4xl font-bold ${getPlagiarismColor(result.percentPlagiarism)}`}>
                  {result.percentPlagiarism}%
                </div>
                <Badge className={getPlagiarismBadgeColor(result.percentPlagiarism)}>
                  {result.percentPlagiarism < 10 ? 'Low Risk' : 
                   result.percentPlagiarism < 25 ? 'Medium Risk' : 'High Risk'}
                </Badge>
                <p className="text-sm text-gray-600 mt-2">Similarity detected</p>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Plagiarism Level</span>
                  <span>{result.percentPlagiarism}%</span>
                </div>
                <Progress 
                  value={result.percentPlagiarism} 
                  className="h-3"
                />
              </div>

              {/* Sources */}
              {result.sources && result.sources.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Similar Sources Found ({result.sources.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {result.sources.map((source, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-sm truncate flex-1">
                            {source.title || source.url}
                          </p>
                          <Badge variant="outline" className="ml-2">
                            {source.similarity}%
                          </Badge>
                        </div>
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline truncate block"
                        >
                          {source.url}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Citations */}
              {result.citations && result.citations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Suggested Citations ({result.citations.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {result.citations.map((citation, index) => (
                      <div key={index} className="p-2 border rounded bg-blue-50 text-sm">
                        <p className="font-medium">{citation.text}</p>
                        <p className="text-gray-600 text-xs">{citation.source}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={checkPlagiarism} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recheck
                </Button>
                <Button onClick={downloadReport} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
