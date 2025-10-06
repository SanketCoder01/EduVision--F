'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function ExpenseForm({ 
  userId, 
  students 
}: { 
  userId: string; 
  students: { id: string; full_name: string }[] 
}) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splitEqually, setSplitEqually] = useState(true);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount || (splitEqually && selectedParticipants.length === 0)) {
      toast.error('Please fill in all fields');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);

    try {
      // Create the expense
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          description,
          amount: amountValue,
          user_id: userId,
        })
        .select('id')
        .single();

      if (expenseError) throw expenseError;

      // Add participants
      if (selectedParticipants.length > 0) {
        const participantsData = selectedParticipants.map(participantId => ({
          expense_id: expense.id,
          user_id: participantId,
          amount_owed: amountValue / (selectedParticipants.length + 1), // Including the payer
        }));

        const { error: participantsError } = await supabase
          .from('expense_participants')
          .insert(participantsData);

        if (participantsError) throw participantsError;
      }

      // Add the payer as a participant with amount 0 (they already paid)
      const { error: payerError } = await supabase
        .from('expense_participants')
        .insert({
          expense_id: expense.id,
          user_id: userId,
          amount_owed: 0,
        });

      if (payerError) throw payerError;

      toast.success('Expense added successfully!');
      setDescription('');
      setAmount('');
      setSelectedParticipants([]);
      router.refresh();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleParticipant = (participantId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantantId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="What was this expense for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (₹)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="split-equally" 
            checked={splitEqually}
            onCheckedChange={(checked) => setSplitEqually(checked as boolean)}
          />
          <Label htmlFor="split-equally">Split equally</Label>
        </div>

        {splitEqually && (
          <div className="space-y-2 mt-2">
            <Label>Split with:</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto p-2 border rounded-md">
              {students.map((student) => (
                <div key={student.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`participant-${student.id}`}
                    checked={selectedParticipants.includes(student.id)}
                    onCheckedChange={() => toggleParticipant(student.id)}
                  />
                  <Label htmlFor={`participant-${student.id}`} className="font-normal">
                    {student.full_name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add Expense'}
      </Button>
    </form>
  );
}
