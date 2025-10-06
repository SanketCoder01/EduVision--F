'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Plus, ArrowLeft, Users, CreditCard, Activity, ArrowRight, Filter, MoreVertical, Pencil, Trash2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { format } from 'date-fns';

type Expense = {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  payment_date: string;
  paid_by: string;
  paid_by_name: string;
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
  expense_shares: Array<{
    id: string;
    user_id: string;
    user_name: string;
    share_amount: number;
    is_settled: boolean;
  }>;
};

type Balance = {
  user_id: string;
  user_email: string;
  user_name: string;
  total_paid: number;
  total_owed: number;
  balance: number;
};

type Group = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  expense_group_members: Array<{
    id: string;
    user_id: string;
    user_name: string;
    is_admin: boolean;
  }>;
};

const categoryIcons: Record<string, string> = {
  food: '🍔',
  travel: '✈️',
  utilities: '💡',
  entertainment: '🎬',
  shopping: '🛍️',
  education: '📚',
  health: '🏥',
  other: '📦',
};

export default function GroupExpensesPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [activeTab, setActiveTab] = useState('expenses');
  const [userBalances, setUserBalances] = useState<Record<string, number>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch group data
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/signin');
          return;
        }
        
        setCurrentUserId(user.id);

        // Get group with members
        const { data: groupData, error: groupError } = await supabase
          .from('expense_groups')
          .select('*, expense_group_members(*)')
          .eq('id', groupId)
          .single();

        if (groupError) throw groupError;
        
        // Check if user is a member of the group
        const isMember = groupData.expense_group_members.some(
          (member: any) => member.user_id === user.id
        );
        
        if (!isMember) {
          toast({
            title: 'Access Denied',
            description: 'You are not a member of this group',
            variant: 'destructive',
          });
          router.push('/dashboard/expenses');
          return;
        }
        
        setGroup(groupData);

        // Get expenses with shares
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('*, expense_shares(*)')
          .eq('group_id', groupId)
          .order('payment_date', { ascending: false });

        if (expensesError) throw expensesError;
        
        setExpenses(expensesData || []);

        // Calculate balances
        const { data: balancesData, error: balancesError } = await supabase
          .rpc('calculate_balances', { group_id_param: groupId });

        if (balancesError) throw balancesError;
        
        setBalances(balancesData || []);
        
        // Calculate user balances for quick reference
        if (balancesData) {
          const userBalancesMap: Record<string, number> = {};
          balancesData.forEach((balance: Balance) => {
            userBalancesMap[balance.user_id] = balance.balance;
          });
          setUserBalances(userBalancesMap);
        }
      } catch (error) {
        console.error('Error fetching group data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load group data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId, router, supabase, toast]);

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      // Refresh the expenses list
      setExpenses(expenses.filter(expense => expense.id !== expenseId));
      
      toast({
        title: 'Expense deleted',
        description: 'The expense has been removed',
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete expense',
        variant: 'destructive',
      });
    }
  };

  const handleSettleUp = async (toUserId: string, amount: number) => {
    if (!currentUserId) return;
    
    try {
      const { error } = await supabase
        .from('expense_settlements')
        .insert([
          {
            group_id: groupId,
            from_user_id: currentUserId,
            to_user_id: toUserId,
            amount: Math.abs(amount),
            currency: 'INR',
            payment_method: 'cash',
            notes: 'Settled up',
          }
        ]);

      if (error) throw error;
      
      // Refresh balances
      const { data: balancesData, error: balancesError } = await supabase
        .rpc('calculate_balances', { group_id_param: groupId });

      if (balancesError) throw balancesError;
      
      setBalances(balancesData || []);
      
      toast({
        title: 'Settlement recorded',
        description: 'Your payment has been recorded',
      });
    } catch (error) {
      console.error('Error recording settlement:', error);
      toast({
        title: 'Error',
        description: 'Failed to record settlement',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Group not found</h1>
        <p className="text-muted-foreground mb-6">The group you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => router.push('/dashboard/expenses')}>
          Back to Expenses
        </Button>
      </div>
    );
  }

  const userBalance = userBalances[currentUserId || ''] || 0;
  const youOwe = userBalance < 0 ? Math.abs(userBalance) : 0;
  const owedToYou = userBalance > 0 ? userBalance : 0;
  const isGroupAdmin = group.expense_group_members.some(
    member => member.user_id === currentUserId && member.is_admin
  );

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="pl-0 mb-1"
              onClick={() => router.push('/dashboard/expenses')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> All Groups
            </Button>
            <h1 className="text-2xl font-bold">{group.name}</h1>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" /> Share
            </Button>
            <Button asChild>
              <Link href={`/dashboard/expenses/${groupId}/add-expense`}>
                <Plus className="h-4 w-4 mr-2" /> Add Expense
              </Link>
            </Button>
          </div>
        </div>
        
        {group.description && (
          <p className="text-muted-foreground">{group.description}</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  expenses.reduce((sum, expense) => sum + expense.amount, 0),
                  expenses[0]?.currency || 'INR'
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">You Owe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(youOwe)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Owed to You</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(owedToYou)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs 
        defaultValue="expenses" 
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="balances">Balances</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>
          
          {activeTab === 'expenses' && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="expenses" className="space-y-4">
          {expenses.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No expenses yet</h3>
              <p className="text-muted-foreground mb-6">
                Get started by adding your first expense
              </p>
              <Button asChild>
                <Link href={`/dashboard/expenses/${groupId}/add-expense`}>
                  <Plus className="h-4 w-4 mr-2" /> Add Expense
                </Link>
              </Button>
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Description</TableHead>
                    <TableHead>Paid by</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-primary/10">
                            <span className="text-lg">
                              {categoryIcons[expense.category] || '💰'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{expense.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {expense.expense_shares.length} {expense.expense_shares.length === 1 ? 'person' : 'people'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback>
                              {expense.paid_by_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {expense.paid_by_name}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(expense.amount, expense.currency)}
                      </TableCell>
                      <TableCell>
                        {formatDate(expense.payment_date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">More</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Activity className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {expense.paid_by === currentUserId && (
                              <>
                                <DropdownMenuItem>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteExpense(expense.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Balances</CardTitle>
              <CardDescription>
                Who owes what to whom
              </CardDescription>
            </CardHeader>
            <CardContent>
              {balances.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No balances to show
                </div>
              ) : (
                <div className="space-y-4">
                  {balances.map((balance) => (
                    <div 
                      key={balance.user_id}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {balance.user_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{balance.user_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {balance.user_email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={cn(
                          "font-medium",
                          getBalanceColor(balance.balance)
                        )}>
                          {balance.balance > 0 
                            ? `Owes you ${formatCurrency(balance.balance)}`
                            : balance.balance < 0
                              ? `You owe ${formatCurrency(Math.abs(balance.balance))}`
                              : 'Settled up'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Paid {formatCurrency(balance.total_paid)} • 
                          Owed {formatCurrency(balance.total_owed)}
                        </p>
                      </div>
                      
                      {currentUserId !== balance.user_id && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (balance.balance < 0) {
                              handleSettleUp(balance.user_id, balance.balance);
                            }
                          }}
                          disabled={balance.balance >= 0}
                        >
                          {balance.balance < 0 ? 'Settle Up' : 'Paid'}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>
                Recent activity in this group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>No recent activity</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Members</CardTitle>
                  <CardDescription>
                    {group.expense_group_members.length} {group.expense_group_members.length === 1 ? 'member' : 'members'}
                  </CardDescription>
                </div>
                {isGroupAdmin && (
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Add Member
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.expense_group_members.map((member) => (
                  <div 
                    key={member.user_id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {member.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.user_name}
                          {member.is_admin && (
                            <Badge variant="secondary" className="ml-2">Admin</Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.user_id}
                        </p>
                      </div>
                    </div>
                    
                    {isGroupAdmin && member.user_id !== currentUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">More</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>
              
              {isGroupAdmin && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-4">Danger Zone</h3>
                  <div className="flex justify-between items-center p-4 border border-red-200 bg-red-50 rounded-md">
                    <div>
                      <h4 className="font-medium">Delete this group</h4>
                      <p className="text-sm text-muted-foreground">
                        Once you delete a group, there is no going back. Please be certain.
                      </p>
                    </div>
                    <Button variant="destructive">
                      Delete Group
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
