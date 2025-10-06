'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Plus, Users, CreditCard, Activity, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

type ExpenseGroup = {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  expense_group_members?: Array<{
    id: string;
    user_id: string;
    user_name: string;
    is_admin: boolean;
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

export default function ExpensesPage() {
  const [groups, setGroups] = useState<ExpenseGroup[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ExpenseGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('groups');
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchBalances(selectedGroup.id);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      const { data: groups, error } = await supabase
        .from('expense_group_members')
        .select('expense_groups(*)')
        .eq('user_id', user.id);

      if (error) throw error;

      setGroups(groups?.map((g: any) => g.expense_groups) || []);
      
      // If there are groups, select the first one by default
      if (groups?.length > 0 && !selectedGroup) {
        setSelectedGroup(groups[0].expense_groups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: 'Error',
        description: 'Failed to load expense groups',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBalances = async (groupId: string) => {
    try {
      const { data: balances, error } = await supabase
        .rpc('calculate_balances', { group_id_param: groupId });

      if (error) throw error;
      
      setBalances(balances || []);
    } catch (error) {
      console.error('Error fetching balances:', error);
      toast({
        title: 'Error',
        description: 'Failed to load balances',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Expense Sharing</h1>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {selectedGroup ? selectedGroup.name : 'Expense Sharing'}
          </h1>
          <Button asChild>
            <Link href="/dashboard/expenses/new-group">
              <Plus className="mr-2 h-4 w-4" /> New Group
            </Link>
          </Button>
        </div>

        {selectedGroup && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <button 
              onClick={() => setSelectedGroup(null)}
              className="flex items-center text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to groups
            </button>
            <span>•</span>
            <span>{selectedGroup.description || 'No description'}</span>
            <span>•</span>
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {selectedGroup.expense_group_members?.length || 0} members
            </span>
          </div>
        )}
      </div>

      {!selectedGroup ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.length > 0 ? (
              groups.map((group) => (
                <Card 
                  key={group.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setSelectedGroup(group)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {group.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      {group.expense_group_members?.length || 0} members
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary">
                      View <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No expense groups</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by creating a new expense group.
                </p>
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/dashboard/expenses/new-group">
                      <Plus className="mr-2 h-4 w-4" /> New Group
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Tabs 
          defaultValue="balances" 
          className="space-y-4"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList>
            <TabsTrigger value="balances">Balances</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="balances" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {balances.map((balance) => (
                <Card key={balance.user_id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{balance.user_name}</CardTitle>
                    <CardDescription>{balance.user_email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      <span className={getBalanceColor(balance.balance)}>
                        {formatCurrency(Math.abs(balance.balance))}
                      </span>
                      <div className="text-sm font-normal text-muted-foreground">
                        {balance.balance > 0 ? 'owes you' : 'you owe'}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      {balance.balance > 0 ? 'Request Payment' : 'Settle Up'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="expenses">
            <div className="rounded-md border">
              <div className="p-4 text-center text-muted-foreground">
                No expenses yet. Add your first expense to get started.
              </div>
            </div>
            <div className="mt-4">
              <Button asChild>
                <Link href={`/dashboard/expenses/${selectedGroup.id}/add-expense`}>
                  <Plus className="mr-2 h-4 w-4" /> Add Expense
                </Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="rounded-md border p-4 text-center text-muted-foreground">
              No recent activity.
            </div>
          </TabsContent>

          <TabsContent value="members">
            <div className="space-y-2">
              {selectedGroup.expense_group_members?.map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
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
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Member
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
