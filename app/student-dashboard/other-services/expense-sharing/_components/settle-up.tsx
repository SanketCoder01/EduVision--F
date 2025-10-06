'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function SettleUp({ 
  userId, 
  balances, 
  students 
}: { 
  userId: string; 
  balances: Map<string, number>; 
  students: { id: string; full_name: string }[] 
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Filter users who owe money to the current user
  const usersWhoOwe = Array.from(balances.entries())
    .filter(([id, balance]) => balance < 0 && id !== userId)
    .map(([id, balance]) => ({
      id,
      name: students.find(s => s.id === id)?.full_name || 'Unknown',
      amount: Math.abs(balance)
    }));

  const handleSettleUp = async () => {
    if (!selectedUser || !amount) {
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
      // Create a settlement record
      const { error } = await supabase
        .from('expense_settlements')
        .insert({
          from_user_id: selectedUser,
          to_user_id: userId,
          amount: amountValue,
          status: 'completed',
        });

      if (error) throw error;

      toast.success('Settlement recorded successfully!');
      setOpen(false);
      setAmount('');
      setSelectedUser('');
      router.refresh();
    } catch (error) {
      console.error('Error recording settlement:', error);
      toast.error('Failed to record settlement. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (usersWhoOwe.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Settle Up
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settle Up</DialogTitle>
          <DialogDescription>
            Record a payment to settle up with someone who owes you money.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">Who paid you?</Label>
            <select
              id="user"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select a person</option>
              {usersWhoOwe.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} (owes ₹{user.amount.toFixed(2)})
                </option>
              ))}
            </select>
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
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSettleUp}
            disabled={isLoading || !selectedUser || !amount}
          >
            {isLoading ? 'Processing...' : 'Record Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
