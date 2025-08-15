'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getNotifications, markAsRead } from '@/app/actions/notification-actions';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
  type: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data } = await getNotifications();
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-1 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="p-2 font-semibold border-b">Notifications</div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No new notifications.</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`p-2 border-b ${!n.is_read ? 'bg-blue-50' : ''}`}>
                <Link href={n.link || '#'} passHref>
                  <a onClick={() => !n.is_read && handleMarkAsRead(n.id)}>
                    <p className="font-bold">{n.title}</p>
                    <p className="text-sm">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{timeAgo(n.created_at)}</p>
                  </a>
                </Link>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
