"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink, 
  RefreshCw,
  FileText,
  BarChart3
} from "lucide-react"

interface PlagiarismResult {
  similarity_percentage: number
  sources_count: number
  sources: Array<{
    title: string
    url: string
    similarity: number
  }>
  is_plagiarized: boolean
  analysis: {
    total_words: number
    plagiarized_words: number
    unique_words: number
  }
  report_url?: string
  checked_at: string
}

interface PlagiarismCheckerProps {
  text: string
  title?: string
  onResult?: (result: PlagiarismResult) => void
  autoCheck?: boolean
  showDetailedReport?: boolean
}

export default function PlagiarismChecker({ 
  text, 
  title, 
  onResult, 
  autoCheck = false,
  showDetailedReport = true 
}: PlagiarismCheckerProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<PlagiarismResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkPlagiarism = async () => {
    if (!text || text.trim().length === 0) {
      setError("No text content to check")
      return
    }

    setIsChecking(true)
    setError(null)

    try {
      const response = await fetch('/api/plagiarism/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          title: title || 'Untitled Document'
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to check plagiarism: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        onResult?.(data.data)
      } else {
        throw new Error(data.error || 'Plagiarism check failed')
      }
    } catch (err) {
      console.error('Plagiarism check error:', err)
      setError(err instanceof Error ? err.message : 'Failed to check plagiarism')
    } finally {
      setIsChecking(false)
    }
  }

  const getSeverityColor = (percentage: number) => {
    if (percentage >= 25) return "text-red-600 bg-red-50 border-red-200"
    if (percentage >= 15) return "text-orange-600 bg-orange-50 border-orange-200"
    if (percentage >= 5) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-green-600 bg-green-50 border-green-200"
  }

  const getSeverityIcon = (percentage: number) => {
    if (percentage >= 25) return <AlertTriangle className="h-5 w-5 text-red-600" />
    if (percentage >= 15) return <Shield className="h-5 w-5 text-orange-600" />
    return <CheckCircle className="h-5 w-5 text-green-600" />
  }

  const getSeverityText = (percentage: number) => {
    if (percentage >= 25) return "High Similarity - Requires Review"
    if (percentage >= 15) return "Moderate Similarity - Caution Advised"
    if (percentage >= 5) return "Low Similarity - Acceptable Range"
    return "Original Content - No Issues Detected"
  }

  // Auto-check if enabled and text is provided
  React.useEffect(() => {
    if (autoCheck && text && text.trim().length > 0 && !result && !isChecking) {
      checkPlagiarism()
    }
  }, [autoCheck, text])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Plagiarism Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result && !isChecking && (
          <div className="text-center py-4">
            <Button 
              onClick={checkPlagiarism} 
              disabled={!text || text.trim().length === 0}
              className="w-full"
            >
              <Shield className="mr-2 h-4 w-4" />
              Check for Plagiarism
            </Button>
            {(!text || text.trim().length === 0) && (
              <p className="text-sm text-gray-500 mt-2">
                No content available to check
              </p>
            )}
          </div>
        )}

        {isChecking && (
          <div className="text-center py-6">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-sm text-gray-600">Analyzing content for plagiarism...</p>
            <p className="text-xs text-gray-500 mt-1">This may take a few moments</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-4">
            {/* Main Result */}
            <Card className={`border-2 ${getSeverityColor(result.similarity_percentage)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(result.similarity_percentage)}
                    <span className="font-semibold">
                      {result.similarity_percentage}% Similarity Detected
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkPlagiarism}
                    disabled={isChecking}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Recheck
                  </Button>
                </div>
                
                <Progress 
                  value={result.similarity_percentage} 
                  className="mb-2"
                />
                
                <p className="text-sm font-medium">
                  {getSeverityText(result.similarity_percentage)}
                </p>
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            {showDetailedReport && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Statistics */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Analysis Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Words:</span>
                      <span className="font-medium">{result.analysis.total_words}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Unique Words:</span>
                      <span className="font-medium text-green-600">{result.analysis.unique_words}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Flagged Words:</span>
                      <span className="font-medium text-red-600">{result.analysis.plagiarized_words}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sources Found:</span>
                      <span className="font-medium">{result.sources_count}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Sources */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Similar Sources ({result.sources_count})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.sources.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {result.sources.slice(0, 3).map((source, index) => (
                          <div key={index} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{source.title}</p>
                              <p className="text-gray-500 truncate">{source.url}</p>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {source.similarity}%
                            </Badge>
                          </div>
                        ))}
                        {result.sources.length > 3 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{result.sources.length - 3} more sources
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No similar sources found
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Report Link */}
            {result.report_url && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Detailed Report Available</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={result.report_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Report
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timestamp */}
            <p className="text-xs text-gray-500 text-center">
              Checked on {new Date(result.checked_at).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
