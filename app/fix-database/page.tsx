'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Code } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FixDatabasePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [sqlQuery, setSqlQuery] = useState('');
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [sqlLoading, setSqlLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('students');

  const fixDatabase = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/fix-tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'An error occurred while fixing the database');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const executeSql = async () => {
    if (!sqlQuery.trim()) {
      setSqlError('SQL query is required');
      return;
    }

    setSqlLoading(true);
    setSqlError(null);
    setSqlResult(null);

    try {
      const response = await fetch('/api/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql: sqlQuery }),
      });

      const data = await response.json();

      if (response.ok) {
        setSqlResult(data);
      } else {
        setSqlError(data.error || 'An error occurred while executing SQL');
      }
    } catch (err) {
      setSqlError('An unexpected error occurred');
      console.error(err);
    } finally {
      setSqlLoading(false);
    }
  };

  const createStudentsTableSQL = `-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  department VARCHAR(50) NOT NULL,
  year VARCHAR(20) NOT NULL,
  date_of_birth DATE,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  prn VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

  const createFacultyTableSQL = `-- Create faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  department VARCHAR(50) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  qualification VARCHAR(255),
  experience_years INTEGER DEFAULT 0,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

  const alterStudentsTableSQL = `-- Add missing columns to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS prn VARCHAR(50) UNIQUE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_name VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(20);
ALTER TABLE students ADD COLUMN IF NOT EXISTS date_of_birth DATE;`;

  const alterFacultyTableSQL = `-- Add missing columns to faculty table
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS qualification VARCHAR(255);
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0;
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50) UNIQUE;`;

  const templates = {
    students: createStudentsTableSQL,
    faculty: createFacultyTableSQL,
    'alter-students': alterStudentsTableSQL,
    'alter-faculty': alterFacultyTableSQL
  };

  const handleUseTemplate = () => {
    setSqlQuery(templates[selectedTemplate as keyof typeof templates]);
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Database Table Fixer</CardTitle>
          <CardDescription>
            Fix missing columns in the database tables or execute custom SQL queries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="auto-fix">
            <TabsList className="mb-4">
              <TabsTrigger value="auto-fix">Auto Fix</TabsTrigger>
              <TabsTrigger value="manual-sql">Manual SQL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="auto-fix">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {result && (
                <div className="space-y-4">
                  <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
                    {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    <AlertTitle>{result.success ? 'Success' : 'Error'}</AlertTitle>
                    <AlertDescription>{result.message}</AlertDescription>
                  </Alert>

                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-medium mb-2">Results:</h3>
                    <pre className="text-xs overflow-auto max-h-60">
                      {JSON.stringify(result.results, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {!result && !error && (
                <p className="text-muted-foreground mb-4">
                  Click the button below to fix the database tables. This will create or update the students and faculty
                  tables with all required columns including address and prn.
                </p>
              )}
              
              <Button onClick={fixDatabase} disabled={loading} className="mt-4">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Fixing Database...' : 'Fix Database Tables'}
              </Button>
            </TabsContent>
            
            <TabsContent value="manual-sql">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Execute Custom SQL</h3>
                  <div className="flex items-center space-x-2">
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="students">Create Students Table</SelectItem>
                        <SelectItem value="faculty">Create Faculty Table</SelectItem>
                        <SelectItem value="alter-students">Add Missing Student Columns</SelectItem>
                        <SelectItem value="alter-faculty">Add Missing Faculty Columns</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={handleUseTemplate}>
                      <Code className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </div>
                </div>
                
                <Textarea 
                  value={sqlQuery} 
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="Enter SQL query here..."
                  className="font-mono text-sm h-40"
                />
                
                {sqlError && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{sqlError}</AlertDescription>
                  </Alert>
                )}

                {sqlResult && (
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-medium mb-2">Results:</h3>
                    <pre className="text-xs overflow-auto max-h-60">
                      {JSON.stringify(sqlResult, null, 2)}
                    </pre>
                  </div>
                )}
                
                <Button onClick={executeSql} disabled={sqlLoading}>
                  {sqlLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {sqlLoading ? 'Executing...' : 'Execute SQL'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-xs text-muted-foreground">
            Note: This utility is for fixing database issues. Use with caution.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}