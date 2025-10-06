import { createClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { ExpenseList } from './_components/expense-list';
import { ExpenseForm } from './_components/expense-form';
import { SettleUp } from './_components/settle-up';
import { Balances } from './_components/balances';

export const revalidate = 0;

export default async function ExpenseSharingPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Get current user's department and year for filtering
  const { data: profile } = await supabase
    .from('students')
    .select('department, year')
    .eq('id', user.id)
    .single();

  // Get all students in the same department and year
  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, avatar_url, email')
    .eq('department', profile?.department)
    .eq('year', profile?.year);

  // Get all expenses involving the current user
  const { data: expenses } = await supabase
    .from('expenses')
    .select(`
      *,
      expense_participants(*),
      user:user_id(id, full_name, avatar_url)
    `)
    .or(`user_id.eq.${user.id},expense_participants(user_id.eq.${user.id})`)
    .order('created_at', { ascending: false });

  // Calculate balances
  const balances = new Map();
  
  expenses?.forEach(expense => {
    const paidBy = expense.user_id;
    const totalAmount = expense.amount;
    const participants = expense.expense_participants || [];
    const share = totalAmount / (participants.length || 1);

    participants.forEach(participant => {
      if (participant.user_id !== paidBy) {
        // Person owes money to the payer
        const currentBalance = balances.get(participant.user_id) || new Map();
        const currentOwed = currentBalance.get(paidBy) || 0;
        currentBalance.set(paidBy, currentOwed + share);
        balances.set(participant.user_id, currentBalance);
        
        // Payer is owed money
        const payerBalance = balances.get(paidBy) || new Map();
        const currentOwedToPayer = payerBalance.get(participant.user_id) || 0;
        payerBalance.set(participant.user_id, currentOwedToPayer - share);
        balances.set(paidBy, payerBalance);
      }
    });
  });

  // Calculate net balances
  const netBalances = new Map();
  
  for (const [userId, userBalances] of balances.entries()) {
    let net = 0;
    for (const [otherUserId, amount] of userBalances.entries()) {
      net += amount;
    }
    netBalances.set(userId, net);
  }

  // Get current user's balance
  const userBalance = netBalances.get(user.id) || 0;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left sidebar */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Your Balance</h2>
            <div className={`text-2xl font-bold ${userBalance > 0 ? 'text-green-500' : userBalance < 0 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
              {userBalance > 0 
                ? `You are owed ₹${Math.abs(userBalance).toFixed(2)}`
                : userBalance < 0 
                  ? `You owe ₹${Math.abs(userBalance).toFixed(2)}`
                  : 'Settled up!'}
            </div>
          </div>

          <Balances 
            userId={user.id} 
            balances={netBalances} 
            students={students || []} 
          />

          <SettleUp 
            userId={user.id} 
            balances={netBalances} 
            students={students || []} 
          />
        </div>

        {/* Main content */}
        <div className="w-full md:w-2/3 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-6">Expense Sharing</h1>
            
            <ExpenseForm 
              userId={user.id} 
              students={students?.filter(s => s.id !== user.id) || []} 
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Recent Expenses</h2>
            <ExpenseList 
              expenses={expenses || []} 
              currentUserId={user.id} 
              students={students || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
