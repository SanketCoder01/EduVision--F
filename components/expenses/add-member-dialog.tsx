'use client';

import { useState, useEffect } from 'react';
import { UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type User = {
  id: string;
  email: string;
  full_name?: string;
};

type AddMemberDialogProps = {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemberAdded: () => void;
  currentMembers: string[]; // Array of user IDs already in the group
};

export function AddMemberDialog({
  groupId,
  open,
  onOpenChange,
  onMemberAdded,
  currentMembers
}: AddMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  // Reset form when dialog is opened/closed
  useEffect(() => {
    if (!open) {
      setEmail('');
      setSearchResults([]);
      setSelectedUsers([]);
    }
  }, [open]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setIsSearching(true);
      
      // Search for users by email
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .ilike('email', `%${email.trim()}%`)
        .not('id', 'in', `(${currentMembers.join(',') || '\'\''})`) // Exclude current members
        .limit(5);
      
      if (error) throw error;
      
      setSearchResults(users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to search for users',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      return isSelected 
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user];
    });
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      setIsAdding(true);
      
      // Add each selected user to the group
      const { error } = await fetch('/api/expenses/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          members: selectedUsers.map(user => ({
            userId: user.id,
            userEmail: user.email,
            userName: user.full_name || user.email.split('@')[0],
            isAdmin: false
          }))
        }),
      });
      
      if (error) throw error;
      
      toast({
        title: 'Members added',
        description: `${selectedUsers.length} ${selectedUsers.length === 1 ? 'member has' : 'members have'} been added to the group`,
      });
      
      onMemberAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding members:', error);
      toast({
        title: 'Error',
        description: 'Failed to add members to the group',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Members</DialogTitle>
          <DialogDescription>
            Add new members to this expense group by searching for their email addresses.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <form onSubmit={handleSearch} className="space-y-2">
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="Search by email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSearching || isAdding}
              />
              <Button 
                type="submit" 
                disabled={!email.trim() || isSearching || isAdding}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </form>
          
          {searchResults.length > 0 && (
            <div className="border rounded-md p-2 space-y-2 max-h-40 overflow-y-auto">
              <p className="text-sm text-muted-foreground px-2 pt-1">Search results:</p>
              {searchResults.map(user => (
                <div 
                  key={user.id}
                  className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-muted ${
                    selectedUsers.some(u => u.id === user.id) ? 'bg-muted' : ''
                  }`}
                  onClick={() => toggleUserSelection(user)}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.some(u => u.id === user.id)}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium">{user.full_name || user.email.split('@')[0]}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected members:</p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div 
                    key={user.id}
                    className="inline-flex items-center bg-muted rounded-full px-3 py-1 text-sm"
                  >
                    <span>{user.full_name || user.email.split('@')[0]}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSelectedUser(user.id);
                      }}
                      className="ml-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleAddMembers}
            disabled={selectedUsers.length === 0 || isAdding}
          >
            {isAdding ? 'Adding...' : `Add ${selectedUsers.length} ${selectedUsers.length === 1 ? 'member' : 'members'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
