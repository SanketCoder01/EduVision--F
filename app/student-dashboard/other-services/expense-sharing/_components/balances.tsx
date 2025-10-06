import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Balances({
  userId,
  balances,
  students,
}: {
  userId: string;
  balances: Map<string, number>;
  students: { id: string; full_name: string; avatar_url: string | null }[];
}) {
  const studentMap = new Map(students.map(s => [s.id, s]));
  const userBalances = Array.from(balances.entries())
    .filter(([id, balance]) => Math.abs(balance) > 0.01 && id !== userId)
    .sort((a, b) => b[1] - a[1]);

  if (userBalances.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No balances to show. Add an expense to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balances</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {userBalances.map(([id, balance]) => {
          const student = studentMap.get(id);
          if (!student) return null;
          
          const isOwed = balance > 0;
          const name = student.full_name || 'Unknown';
          const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
          
          return (
            <div key={id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={student.avatar_url || ''} alt={name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isOwed ? 'owes you' : 'you owe'}
                  </p>
                </div>
              </div>
              <div className={`font-medium ${isOwed ? 'text-green-500' : 'text-red-500'}`}>
                {isOwed ? '₹' : '-₹'}{Math.abs(balance).toFixed(2)}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
