import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get('groupId');
  const userId = searchParams.get('userId');
  
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
      { error: 'Not authorized to view these balances' },
      { status: 403 }
    );
  }

  try {
    // Call the PostgreSQL function to calculate balances
    const { data: balances, error } = await supabase.rpc('calculate_balances', {
      group_id_param: groupId,
      user_id_param: userId || null
    });

    if (error) throw error;
    
    // If a specific user ID was provided, return just that user's balance
    if (userId) {
      return NextResponse.json(balances?.[0] || null);
    }
    
    // Otherwise, return all balances for the group
    return NextResponse.json(balances || []);
  } catch (error) {
    console.error('Error calculating balances:', error);
    return NextResponse.json(
      { error: 'Failed to calculate balances' },
      { status: 500 }
    );
  }
}
