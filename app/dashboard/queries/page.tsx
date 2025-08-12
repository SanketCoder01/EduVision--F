"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getFacultyQueries, respondToQuery, updateQueryStatus, Query, QueryResponse } from "@/lib/queries";
import { useRealtimeQueries, useRealtimeQueryResponses } from "@/hooks/useRealtimeQueries";

export default function FacultyQueriesPage() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const { toast } = useToast();

  // Get faculty info from localStorage
  const faculty = JSON.parse(localStorage.getItem("faculty") || "{}");

  const [responseFormData, setResponseFormData] = useState({
    message: ""
  });

  // Load queries
  const loadQueries = async () => {
    try {
      const { data, error } = await getFacultyQueries(faculty.id);
      if (error) throw error;
      setQueries(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load queries",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Real-time query updates
  useRealtimeQueries(faculty.id, (newQuery: Query) => {
    setQueries(prev => [newQuery, ...prev.filter(q => q.id !== newQuery.id)]);
  });

  // Real-time response updates
  useRealtimeQueryResponses(selectedQuery?.id || "", (newResponse: QueryResponse) => {
    if (selectedQuery?.id === newResponse.query_id) {
      setSelectedQuery(prev => prev ? {
        ...prev,
        query_responses: [...(prev.query_responses || []), newResponse]
      } : null);
    }
  });

  useEffect(() => {
    loadQueries();
  }, [faculty.id]);

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedQuery) return;
    
    try {
      const response: QueryResponse = {
        query_id: selectedQuery.id!,
        responder_id: faculty.id,
        responder_name: faculty.name,
        responder_role: 'faculty',
        message: responseFormData.message
      };

      const { error } = await respondToQuery(response);
      if (error) throw error;

      // Update query status to answered
      await updateQueryStatus(selectedQuery.id!, 'answered');

      toast({
        title: "Success",
        description: "Response sent successfully!"
      });

      setResponseFormData({ message: "" });
      setShowResponseForm(false);
      loadQueries();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive"
      });
    }
  };

  const handleCloseQuery = async (queryId: string) => {
    try {
      const { error } = await updateQueryStatus(queryId, 'closed');
      if (error) throw error;

      toast({
        title: "Success",
        description: "Query closed successfully!"
      });

      loadQueries();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to close query",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'answered': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Loading queries...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Queries</h1>
        <p className="text-sm text-gray-600">
          Department: {faculty.department}
        </p>
      </div>

      <div className="grid gap-4">
        {queries.map((query) => (
          <Card key={query.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{query.subject}</CardTitle>
                  <p className="text-sm text-gray-600">
                    From: {query.student_name} ({query.student_email})
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={getStatusColor(query.status)}>
                    {query.status.charAt(0).toUpperCase() + query.status.slice(1)}
                  </Badge>
                  <p className="text-sm text-gray-500">
                    {new Date(query.created_at!).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{query.message}</p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setSelectedQuery(query);
                    setShowResponseForm(true);
                  }}
                  disabled={query.status === 'closed'}
                >
                  {query.status === 'answered' ? 'Add Response' : 'Respond'}
                </Button>
                {query.status !== 'closed' && (
                  <Button 
                    variant="outline"
                    onClick={() => handleCloseQuery(query.id!)}
                  >
                    Close Query
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showResponseForm && selectedQuery && (
        <Card>
          <CardHeader>
            <CardTitle>Respond to Query: {selectedQuery.subject}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Student Query</h4>
                <p className="text-gray-700">{selectedQuery.message}</p>
              </div>

              {selectedQuery.query_responses && selectedQuery.query_responses.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Previous Responses</h4>
                  <div className="space-y-2">
                    {selectedQuery.query_responses.map((response) => (
                      <div key={response.id} className="border p-3 rounded">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium">{response.responder_name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(response.created_at!).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-gray-700">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleRespond} className="space-y-4">
                <Textarea
                  placeholder="Your response..."
                  value={responseFormData.message}
                  onChange={(e) => setResponseFormData({...responseFormData, message: e.target.value})}
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit">Send Response</Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setShowResponseForm(false);
                      setSelectedQuery(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
