import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get('id');
  const supabase = createRouteHandlerClient({ cookies });

  try {
    if (groupId) {
      // Get a single group by ID
      const { data: group, error } = await supabase
        .from('expense_groups')
        .select('*, expense_group_members(*)')
        .eq('id', groupId)
        .single();

      if (error) throw error;
      return NextResponse.json(group);
    } else {
      // Get all groups for the current user
      const { data: groups, error } = await supabase
        .from('expense_group_members')
        .select('expense_groups(*)')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      return NextResponse.json(groups?.map(g => g.expense_groups) || []);
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch expense groups' },
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
      name,
      description,
      isPublic = false,
      department,
      targetYears = []
    } = await request.json();

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from('expense_groups')
      .insert([
        {
          name,
          description,
          created_by: user.id,
          is_public: isPublic,
          department,
          target_years: targetYears
        }
      ])
      .select()
      .single();

    if (groupError) throw groupError;

    // Add the creator as an admin member
    const { error: memberError } = await supabase
      .from('expense_group_members')
      .insert([
        {
          group_id: group.id,
          user_id: user.id,
          user_email: user.email,
          user_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          is_admin: true
        }
      ]);

    if (memberError) throw memberError;

    return NextResponse.json(group);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create expense group' },
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
    const { id, ...updates } = await request.json();

    // Check if user is admin of the group
    const { data: isAdmin } = await supabase
      .from('expense_group_members')
      .select('is_admin')
      .eq('group_id', id)
      .eq('user_id', user.id)
      .single();

    if (!isAdmin?.is_admin) {
      return NextResponse.json(
        { error: 'Not authorized to update this group' },
        { status: 403 }
      );
    }

    const { data: group, error } = await supabase
      .from('expense_groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(group);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update expense group' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const user = (await supabase.auth.getUser()).data.user;
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get('id');
  
  if (!user || !groupId) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    // Check if user is the creator of the group
    const { data: group, error: groupError } = await supabase
      .from('expense_groups')
      .select('created_by')
      .eq('id', groupId)
      .single();

    if (groupError) throw groupError;
    
    if (group.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Only the group creator can delete the group' },
        { status: 403 }
      );
    }

    // Delete the group (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('expense_groups')
      .delete()
      .eq('id', groupId);

    if (deleteError) throw deleteError;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete expense group' },
      { status: 500 }
    );
  }
}
