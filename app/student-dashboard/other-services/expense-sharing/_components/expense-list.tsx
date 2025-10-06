import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";

export function ExpenseList({ 
  expenses, 
  currentUserId,
  students 
}: { 
  expenses: any[]; 
  currentUserId: string;
  students: { id: string; full_name: string; avatar_url: string | null }[];
}) {
  const studentMap = new Map(students.map(s => [s.id, s]));

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No expenses yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => {
        const payer = studentMap.get(expense.user_id);
        const isPayer = expense.user_id === currentUserId;
        const userParticipation = expense.expense_participants?.find(
          (p: any) => p.user_id === currentUserId
        );
        const amountOwed = userParticipation?.amount_owed || 0;
        const totalParticipants = (expense.expense_participants?.length || 1);
        
        return (
          <div 
            key={expense.id} 
            className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <Avatar>
                <AvatarImage src={payer?.avatar_url || ''} alt={payer?.full_name || 'User'} />
                <AvatarFallback>
                  {payer?.full_name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{expense.description}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isPayer 
                    ? `You paid ₹${expense.amount.toFixed(2)}` 
                    : `${payer?.full_name} paid ₹${expense.amount.toFixed(2)}`}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(expense.created_at), 'MMM d, yyyy h:mm a')}
                </p>
                
                {!isPayer && amountOwed > 0 && (
                  <Badge variant="outline" className="mt-1 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                    You owe ₹{amountOwed.toFixed(2)}
                  </Badge>
                )}
                
                {isPayer && totalParticipants > 1 && (
                  <div className="mt-1 flex items-center space-x-1">
                    <span className="text-xs text-gray-500">
                      Split with {totalParticipants - 1} {totalParticipants === 2 ? 'person' : 'people'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className={`text-right ${isPayer ? 'text-green-500' : 'text-red-500'}`}>
              <span className="font-medium">
                {isPayer 
                  ? `+₹${(expense.amount - amountOwed).toFixed(2)}`
                  : `-₹${amountOwed.toFixed(2)}`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
