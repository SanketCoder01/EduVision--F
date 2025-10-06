'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, Plus, User, Users, IndianRupee, Receipt, Calendar, Tag, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type GroupMember = {
  user_id: string;
  user_name: string;
  user_email: string;
  is_admin: boolean;
};

type ExpenseShare = {
  userId: string;
  userName: string;
  userEmail: string;
  amount: string;
};

const expenseCategories = [
  { value: 'food', label: '🍔 Food & Drinks' },
  { value: 'travel', label: '✈️ Travel' },
  { value: 'utilities', label: '💡 Utilities' },
  { value: 'entertainment', label: '🎬 Entertainment' },
  { value: 'shopping', label: '🛍️ Shopping' },
  { value: 'education', label: '📚 Education' },
  { value: 'health', label: '🏥 Health' },
  { value: 'other', label: '📦 Other' },
];

export default function AddExpensePage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [group, setGroup] = useState<{
    id: string;
    name: string;
    expense_group_members: GroupMember[];
  } | null>(null);
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'other',
    paymentDate: new Date(),
    notes: '',
    receiptUrl: '',
  });
  
  const [splitEqually, setSplitEqually] = useState(true);
  const [shares, setShares] = useState<ExpenseShare[]>([]);
  const [uploading, setUploading] = useState(false);

  // Fetch group and members
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/signin');
          return;
        }

        // Get group with members
        const { data: groupData, error: groupError } = await supabase
          .from('expense_groups')
          .select('*, expense_group_members(*)')
          .eq('id', groupId)
          .single();

        if (groupError) throw groupError;
        
        setGroup(groupData);
        
        // Initialize shares with all members (including self) paying equally
        const initialShares = groupData.expense_group_members.map((member: GroupMember) => ({
          userId: member.user_id,
          userName: member.user_name,
          userEmail: member.user_email,
          amount: '0',
          isIncluded: true,
        }));
        
        setShares(initialShares);
      } catch (error) {
        console.error('Error fetching group:', error);
        toast({
          title: 'Error',
          description: 'Failed to load group data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId, router, supabase, toast]);

  // Update shares when amount changes and split equally is enabled
  useEffect(() => {
    if (splitEqually && formData.amount && !isNaN(parseFloat(formData.amount))) {
      const amount = parseFloat(formData.amount);
      const memberCount = shares.filter(s => s.amount !== '0').length || 1;
      const equalShare = (amount / memberCount).toFixed(2);
      
      setShares(prevShares => 
        prevShares.map(share => ({
          ...share,
          amount: share.amount === '0' ? '0' : equalShare,
        }))
      );
    }
  }, [formData.amount, splitEqually, shares.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShareChange = (userId: string, value: string) => {
    // If empty or valid number, update the share
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setShares(prevShares => 
        prevShares.map(share => 
          share.userId === userId 
            ? { ...share, amount: value } 
            : share
        )
      );
    }
  };

  const toggleMemberInclusion = (userId: string) => {
    setShares(prevShares => 
      prevShares.map(share => 
        share.userId === userId 
          ? { 
              ...share, 
              amount: share.amount === '0' 
                ? (parseFloat(formData.amount) / (shares.filter(s => s.userId === userId || s.amount !== '0').length || 1)).toFixed(2)
                : '0' 
            } 
          : share
      )
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      
      // In a real app, you would upload to a storage service
      // For now, we'll just simulate a successful upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // In a real app, you would use supabase.storage.upload()
      // const { data, error } = await supabase.storage
      //   .from('receipts')
      //   .upload(`public/${fileName}`, file);
      
      // if (error) throw error;
      
      // const { data: { publicUrl } } = supabase.storage
      //   .from('receipts')
      //   .getPublicUrl(data.path);
      
      // For demo purposes, we'll just use a placeholder
      const publicUrl = `https://placehold.co/600x800?text=Receipt+${fileName.substring(0, 5)}`;
      
      setFormData(prev => ({
        ...prev,
        receiptUrl: publicUrl
      }));
      
      toast({
        title: 'Receipt uploaded',
        description: 'Your receipt has been uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your receipt',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a description',
        variant: 'destructive',
      });
      return;
    }
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }
    
    const includedShares = shares.filter(share => share.amount !== '0');
    if (includedShares.length === 0) {
      toast({
        title: 'Error',
        description: 'Please include at least one person',
        variant: 'destructive',
      });
      return;
    }
    
    const totalShares = includedShares.reduce((sum, share) => 
      sum + parseFloat(share.amount), 0
    );
    
    // Allow for small floating point differences
    if (Math.abs(totalShares - amount) > 0.01) {
      toast({
        title: 'Error',
        description: `The sum of shares (${totalShares.toFixed(2)}) must equal the total amount (${amount.toFixed(2)})`,
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/signin');
        return;
      }
      
      // Create the expense
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert([
          {
            group_id: groupId,
            description: formData.description,
            amount: amount,
            paid_by: user.id,
            paid_by_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            category: formData.category,
            payment_date: formData.paymentDate.toISOString(),
            receipt_url: formData.receiptUrl,
            notes: formData.notes,
          }
        ])
        .select()
        .single();
      
      if (expenseError) throw expenseError;
      
      // Create expense shares
      const { error: sharesError } = await supabase
        .from('expense_shares')
        .insert(
          includedShares.map(share => ({
            expense_id: expense.id,
            user_id: share.userId,
            user_email: share.userEmail,
            user_name: share.userName,
            share_amount: parseFloat(share.amount)
          }))
        );
      
      if (sharesError) throw sharesError;
      
      toast({
        title: 'Expense added',
        description: 'Your expense has been recorded successfully',
      });
      
      // Redirect to the group expenses page
      router.push(`/dashboard/expenses/${groupId}`);
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to save expense. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-3xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container mx-auto p-6 max-w-3xl text-center">
        <h1 className="text-2xl font-bold mb-4">Group not found</h1>
        <p className="text-muted-foreground mb-6">The group you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => router.push('/dashboard/expenses')}>
          Back to Expenses
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-3xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="pl-0 mb-4"
          onClick={() => router.push(`/dashboard/expenses/${groupId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to {group.name}
        </Button>
        <h1 className="text-2xl font-bold mb-2">Add an expense</h1>
        <p className="text-muted-foreground">
          Record a new expense for {group.name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            name="description"
            placeholder="What was this expense for?"
            value={formData.description}
            onChange={handleInputChange}
            disabled={saving}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="pl-8"
                value={formData.amount}
                onChange={handleInputChange}
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <div className="relative">
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={saving}
              >
                {expenseCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Paid by</Label>
          <div className="flex items-center space-x-2 p-3 border rounded-md">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                You
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Paid the full amount
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Split with</Label>
              <p className="text-sm text-muted-foreground">
                Who should share this expense?
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {splitEqually ? 'Equal' : 'Custom'}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSplitEqually(!splitEqually)}
                disabled={saving}
              >
                {splitEqually ? 'Custom' : 'Equal'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {shares.map((share) => (
              <div key={share.userId} className="flex items-center space-x-3 p-2 border rounded-md">
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    id={`include-${share.userId}`}
                    checked={share.amount !== '0'}
                    onChange={() => toggleMemberInclusion(share.userId)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    disabled={saving}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label 
                    htmlFor={`include-${share.userId}`}
                    className="flex items-center space-x-3 cursor-pointer w-full"
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {share.userName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {share.userEmail}
                      </p>
                    </div>
                  </label>
                </div>
                <div className="w-24">
                  {share.amount !== '0' && (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-8 h-9"
                        value={share.amount}
                        onChange={(e) => handleShareChange(share.userId, e.target.value)}
                        disabled={saving || splitEqually}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.paymentDate && "text-muted-foreground"
                  )}
                  disabled={saving}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.paymentDate ? (
                    format(formData.paymentDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.paymentDate}
                  onSelect={(date) => 
                    date && setFormData(prev => ({ ...prev, paymentDate: date }))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt (optional)</Label>
            <div>
              <input
                type="file"
                id="receipt"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileUpload}
                disabled={saving || uploading}
              />
              <label
                htmlFor="receipt"
                className="flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium transition-colors border rounded-md cursor-pointer border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                {uploading ? (
                  'Uploading...'
                ) : formData.receiptUrl ? (
                  'Receipt uploaded'
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Upload receipt
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Add any additional details about this expense"
            rows={3}
            value={formData.notes}
            onChange={handleInputChange}
            disabled={saving}
          />
        </div>

        <div className="pt-4 border-t flex justify-end space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push(`/dashboard/expenses/${groupId}`)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Expense'}
          </Button>
        </div>
      </form>
    </div>
  );
}
