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

  try {
    // Get all members of the group
    const { data: members, error } = await supabase
      .from('expense_group_members')
      .select('*')
      .eq('group_id', groupId);

    if (error) throw error;
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch group members' },
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
    const { groupId, email, isAdmin = false } = await request.json();

    // Check if the requesting user is an admin of the group
    const { data: isUserAdmin } = await supabase
      .from('expense_group_members')
      .select('is_admin')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (!isUserAdmin?.is_admin) {
      return NextResponse.json(
        { error: 'Not authorized to add members' },
        { status: 403 }
      );
    }

    // Get the user being added
    const { data: userToAdd } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('email', email)
      .single();

    if (!userToAdd) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('expense_group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userToAdd.id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this group' },
        { status: 400 }
      );
    }

    // Add the user to the group
    const { data: member, error: memberError } = await supabase
      .from('expense_group_members')
      .insert([
        {
          group_id: groupId,
          user_id: userToAdd.id,
          user_email: userToAdd.email,
          user_name: userToAdd.full_name || userToAdd.email.split('@')[0],
          is_admin: isAdmin
        }
      ])
      .select()
      .single();

    if (memberError) throw memberError;
    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add group member' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const user = (await supabase.auth.getUser()).data.user;
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get('groupId');
  const memberId = searchParams.get('memberId');
  
  if (!user || !groupId || !memberId) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    // Check if the requesting user is an admin of the group
    const { data: isUserAdmin } = await supabase
      .from('expense_group_members')
      .select('is_admin')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    const isSelfRemoval = user.id === memberId;
    
    // Only allow if user is admin or removing themselves
    if (!isUserAdmin?.is_admin && !isSelfRemoval) {
      return NextResponse.json(
        { error: 'Not authorized to remove members' },
        { status: 403 }
      );
    }

    // Don't allow last admin to be removed
    if (isUserAdmin?.is_admin && isSelfRemoval) {
      const { data: adminCount } = await supabase
        .from('expense_group_members')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .eq('is_admin', true);

      if (adminCount === 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last admin of the group' },
          { status: 400 }
        );
      }
    }

    // Remove the member
    const { error: removeError } = await supabase
      .from('expense_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', memberId);

    if (removeError) throw removeError;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove group member' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const user = (await supabase.auth.getUser()).data.user;
  
  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const { groupId, memberId, isAdmin } = await request.json();

    // Check if the requesting user is an admin of the group
    const { data: isUserAdmin } = await supabase
      .from('expense_group_members')
      .select('is_admin')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (!isUserAdmin?.is_admin) {
      return NextResponse.json(
        { error: 'Not authorized to update member roles' },
        { status: 403 }
      );
    }

    // Don't allow demoting the last admin
    if (isAdmin === false) {
      const { data: adminCount } = await supabase
        .from('expense_group_members')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .eq('is_admin', true);

      if (adminCount === 1) {
        const { data: isTargetAdmin } = await supabase
          .from('expense_group_members')
          .select('is_admin')
          .eq('group_id', groupId)
          .eq('user_id', memberId)
          .single();

        if (isTargetAdmin?.is_admin) {
          return NextResponse.json(
            { error: 'Cannot demote the last admin of the group' },
            { status: 400 }
          );
        }
      }
    }

    // Update the member's admin status
    const { data: member, error } = await supabase
      .from('expense_group_members')
      .update({ is_admin: isAdmin })
      .eq('group_id', groupId)
      .eq('user_id', memberId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update group member' },
      { status: 500 }
    );
  }
}
