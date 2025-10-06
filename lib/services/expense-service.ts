import { createClient } from '@/lib/supabase/server';
import { Expense, ExpenseParticipant, ExpenseSettlement, Group, GroupMember, UserBalance } from '@/types/expense-sharing';

export class ExpenseService {
  private supabase = createClient();

  // Expenses
  async getExpenses(userId: string): Promise<Expense[]> {
    const { data, error } = await this.supabase
      .from('expenses')
      .select(`
        *,
        user:user_id(id, full_name, avatar_url),
        expense_participants(
          *,
          user:user_id(id, full_name, avatar_url)
        )
      `)
      .or(`user_id.eq.${userId},expense_participants.user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }

    return data || [];
  }

  async createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense> {
    const { data, error } = await this.supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      throw error;
    }

    return data;
  }

  // Participants
  async addParticipant(participant: Omit<ExpenseParticipant, 'id' | 'created_at' | 'updated_at'>): Promise<ExpenseParticipant> {
    const { data, error } = await this.supabase
      .from('expense_participants')
      .insert(participant)
      .select()
      .single();

    if (error) {
      console.error('Error adding participant:', error);
      throw error;
    }

    return data;
  }

  // Settlements
  async createSettlement(settlement: Omit<ExpenseSettlement, 'id' | 'created_at' | 'updated_at'>): Promise<ExpenseSettlement> {
    const { data, error } = await this.supabase
      .from('expense_settlements')
      .insert(settlement)
      .select()
      .single();

    if (error) {
      console.error('Error creating settlement:', error);
      throw error;
    }

    return data;
  }

  // Groups
  async getGroups(userId: string): Promise<Group[]> {
    const { data, error } = await this.supabase
      .from('group_members')
      .select('group:group_id(*, members:group_members(*, user:user_id(*)))')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }

    return data?.map(item => item.group) || [];
  }

  // Balances
  async getUserBalances(userId: string): Promise<UserBalance[]> {
    const { data, error } = await this.supabase
      .rpc('get_user_balances', { user_id_param: userId });

    if (error) {
      console.error('Error fetching user balances:', error);
      throw error;
    }

    return data || [];
  }

  // Get users in the same department and year
  async getClassmates(userId: string): Promise<{ id: string; full_name: string; avatar_url: string | null }[]> {
    // First get the current user's department and year
    const { data: profile, error: profileError } = await this.supabase
      .from('students')
      .select('department, year')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError);
      return [];
    }

    // Then get all students in the same department and year
    const { data: students, error: studentsError } = await this.supabase
      .from('students')
      .select('id, full_name, avatar_url')
      .eq('department', profile.department)
      .eq('year', profile.year)
      .neq('id', userId);

    if (studentsError) {
      console.error('Error fetching classmates:', studentsError);
      return [];
    }

    return students || [];
  }
}
