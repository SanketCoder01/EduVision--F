import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get('groupId');
  
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
      { error: 'Not authorized to view these settlements' },
      { status: 403 }
    );
  }

  try {
    // Get all settlements for the group
    const { data: settlements, error } = await supabase
      .from('expense_settlements')
      .select('*')
      .eq('group_id', groupId)
      .order('settled_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(settlements);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch settlements' },
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
      toUserId,
      amount,
      currency = 'INR',
      paymentMethod = 'cash',
      notes
    } = await request.json();

    // Validate amount
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Check if user is a member of the group
    const { data: isPayerMember } = await supabase
      .from('expense_group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (!isPayerMember) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    // Check if payee is a member of the group
    const { data: isPayeeMember } = await supabase
      .from('expense_group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', toUserId)
      .single();

    if (!isPayeeMember) {
      return NextResponse.json(
        { error: 'Recipient is not a member of this group' },
        { status: 403 }
      );
    }

    // Check if payer has sufficient balance
    const { data: balances } = await supabase.rpc('calculate_balances', {
      group_id_param: groupId,
      user_id_param: user.id
    });

    const userBalance = balances?.[0]?.balance || 0;
    
    if (userBalance < parseFloat(amount)) {
      return NextResponse.json(
        { error: 'Insufficient balance for this settlement' },
        { status: 400 }
      );
    }

    // Create the settlement
    const { data: settlement, error } = await supabase
      .from('expense_settlements')
      .insert([
        {
          group_id: groupId,
          from_user_id: user.id,
          to_user_id: toUserId,
          amount: parseFloat(amount),
          currency,
          payment_method: paymentMethod,
          notes
        }
      ])
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(settlement);
  } catch (error) {
    console.error('Error creating settlement:', error);
    return NextResponse.json(
      { error: 'Failed to create settlement' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const user = (await supabase.auth.getUser()).data.user;
  const { searchParams } = new URL(request.url);
  const settlementId = searchParams.get('id');
  
  if (!user || !settlementId) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    // Get the settlement to check ownership
    const { data: settlement, error: fetchError } = await supabase
      .from('expense_settlements')
      .select('*')
      .eq('id', settlementId)
      .single();

    if (fetchError) throw fetchError;

    // Only the payer can delete the settlement
    if (settlement.from_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the payer can delete this settlement' },
        { status: 403 }
      );
    }

    // Delete the settlement
    const { error: deleteError } = await supabase
      .from('expense_settlements')
      .delete()
      .eq('id', settlementId);

    if (deleteError) throw deleteError;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting settlement:', error);
    return NextResponse.json(
      { error: 'Failed to delete settlement' },
      { status: 500 }
    );
  }
}
