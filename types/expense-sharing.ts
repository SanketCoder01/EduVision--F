export type Expense = {
  id: string;
  description: string;
  amount: number;
  user_id: string;
  group_id: string | null;
  split_type: 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES';
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  expense_participants?: ExpenseParticipant[];
};

export type ExpenseParticipant = {
  id: string;
  expense_id: string;
  user_id: string;
  amount_owed: number;
  is_settled: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
};

export type ExpenseSettlement = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
  settled_at: string | null;
  from_user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  to_user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
};

export type UserBalance = {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  net_balance: number;
  you_owe: number;
  you_are_owed: number;
};

export type Group = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: GroupMember[];
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
};
