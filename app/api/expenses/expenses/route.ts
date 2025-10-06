import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get('groupId');
  const expenseId = searchParams.get('id');
  
  if (!groupId) {
    return NextResponse.json(
      { error: 'Group ID is required' },
      { status: 400 }
    );
  }

  const supabase = createRouteHandlerClient({ cookies });
  const user = (await supabase.auth.getUser()).data.user;

  // Check if user is a member of the group
  const { data: isMember } = await supabase
    .from('expense_group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', user?.id || '')
    .single();

  if (!isMember) {
    return NextResponse.json(
      { error: 'Not authorized to view these expenses' },
      { status: 403 }
    );
  }

  try {
    if (expenseId) {
      // Get a single expense by ID with its shares
      const { data: expense, error } = await supabase
        .from('expenses')
        .select('*, expense_shares(*)')
        .eq('id', expenseId)
        .single();

      if (error) throw error;
      return NextResponse.json(expense);
    } else {
      // Get all expenses for the group with their shares
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*, expense_shares(*)')
        .eq('group_id', groupId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return NextResponse.json(expenses);
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const user = (await supabase.auth.getUser()).data.user;
  
  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const {
      groupId,
      description,
      amount,
      currency = 'INR',
      category = 'other',
      paymentDate,
      receiptUrl,
      notes,
      shares
    } = await request.json();

    // Check if user is a member of the group
    const { data: isMember } = await supabase
      .from('expense_group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (!isMember) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      );
    }

    // Validate shares
    if (!shares || !Array.isArray(shares) || shares.length === 0) {
      return NextResponse.json(
        { error: 'At least one share is required' },
        { status: 400 }
      );
    }

    // Calculate total share amount
    const totalShares = shares.reduce((sum, share) => sum + parseFloat(share.amount || 0), 0);
    
    if (Math.abs(totalShares - parseFloat(amount)) > 0.01) {
      return NextResponse.json(
        { error: 'Total shares must equal the expense amount' },
        { status: 400 }
      );
    }

    // Get user's full name
    const { data: userData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Create the expense
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert([
        {
          group_id: groupId,
          description,
          amount: parseFloat(amount),
          currency,
          paid_by: user.id,
          paid_by_name: userData?.full_name || user.email?.split('@')[0] || 'Unknown',
          category,
          payment_date: paymentDate || new Date().toISOString(),
          receipt_url: receiptUrl,
          notes
        }
      ])
      .select()
      .single();

    if (expenseError) throw expenseError;

    // Create expense shares
    const { error: sharesError } = await supabase
      .from('expense_shares')
      .insert(
        shares.map((share: any) => ({
          expense_id: expense.id,
          user_id: share.userId,
          user_email: share.userEmail,
          user_name: share.userName,
          share_amount: parseFloat(share.amount)
        }))
      );

    if (sharesError) throw sharesError;

    // Get the full expense with shares
    const { data: fullExpense, error: fetchError } = await supabase
      .from('expenses')
      .select('*, expense_shares(*)')
      .eq('id', expense.id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(fullExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const user = (await supabase.auth.getUser()).data.user;
  
  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const {
      id,
      description,
      amount,
      currency,
      category,
      paymentDate,
      receiptUrl,
      notes,
      shares
    } = await request.json();

    // Get the expense to check ownership
    const { data: existingExpense, error: fetchError } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Only the payer can update the expense
    if (existingExpense.paid_by !== user.id) {
      return NextResponse.json(
        { error: 'Only the payer can update this expense' },
        { status: 403 }
      );
    }

    // Update the expense
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .update({
        description,
        amount: parseFloat(amount),
        currency,
        category,
        payment_date: paymentDate || existingExpense.payment_date,
        receipt_url: receiptUrl,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (expenseError) throw expenseError;

    // Update shares if provided
    if (shares && Array.isArray(shares)) {
      // Delete existing shares
      const { error: deleteError } = await supabase
        .from('expense_shares')
        .delete()
        .eq('expense_id', id);

      if (deleteError) throw deleteError;

      // Add new shares
      const { error: sharesError } = await supabase
        .from('expense_shares')
        .insert(
          shares.map((share: any) => ({
            expense_id: id,
            user_id: share.userId,
            user_email: share.userEmail,
            user_name: share.userName,
            share_amount: parseFloat(share.amount)
          }))
        );

      if (sharesError) throw sharesError;
    }

    // Get the full expense with shares
    const { data: fullExpense, error: fetchFullError } = await supabase
      .from('expenses')
      .select('*, expense_shares(*)')
      .eq('id', id)
      .single();

    if (fetchFullError) throw fetchFullError;

    return NextResponse.json(fullExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const user = (await supabase.auth.getUser()).data.user;
  const { searchParams } = new URL(request.url);
  const expenseId = searchParams.get('id');
  
  if (!user || !expenseId) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    // Get the expense to check ownership
    const { data: expense, error: fetchError } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .single();

    if (fetchError) throw fetchError;

    // Only the payer can delete the expense
    if (expense.paid_by !== user.id) {
      return NextResponse.json(
        { error: 'Only the payer can delete this expense' },
        { status: 403 }
      );
    }

    // Delete the expense (cascade will handle the shares)
    const { error: deleteError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (deleteError) throw deleteError;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
