'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, Plus, Users, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

export default function NewGroupPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    department: 'CSE', // Default department, can be made dynamic
    targetYears: ['first', 'second', 'third', 'fourth'] as string[]
  });
  
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleYear = (year: string) => {
    setFormData(prev => {
      const newYears = prev.targetYears.includes(year)
        ? prev.targetYears.filter(y => y !== year)
        : [...prev.targetYears, year];
      
      return {
        ...prev,
        targetYears: newYears
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Group name is required',
        variant: 'destructive',
      });
      return;
    }

    if (formData.targetYears.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one target year',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      // Create the group
      const { data: group, error } = await supabase
        .from('expense_groups')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            created_by: user.id,
            is_public: formData.isPublic,
            department: formData.department,
            target_years: formData.targetYears
          }
        ])
        .select()
        .single();

      if (error) throw error;

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

      toast({
        title: 'Group created',
        description: `"${formData.name}" has been created successfully.`,
      });

      // Redirect to the group page
      router.push(`/dashboard/expenses/${group.id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: 'Error',
        description: 'Failed to create group. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-3xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="pl-0 mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold mb-2">Create New Group</h1>
        <p className="text-muted-foreground">
          Set up a new expense sharing group for your friends, roommates, or colleagues.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Group Name *</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g., Roommates, Trip to Goa, Office Lunch"
            value={formData.name}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="What's this group for?"
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Visibility</h3>
              <p className="text-sm text-muted-foreground">
                {formData.isPublic 
                  ? 'Anyone can find and join this group' 
                  : 'Only people with the link can join this group'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {formData.isPublic ? (
                <Globe className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isPublic: checked }))
                }
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Target Years</h3>
          <p className="text-sm text-muted-foreground">
            Select which years can see and join this group
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['first', 'second', 'third', 'fourth'].map((year) => (
              <div key={year} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`year-${year}`}
                  checked={formData.targetYears.includes(year)}
                  onChange={() => handleToggleYear(year)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  disabled={loading}
                />
                <label 
                  htmlFor={`year-${year}`}
                  className="text-sm font-medium leading-none capitalize"
                >
                  {year} Year
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
            {loading ? (
              'Creating...'
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
