"use client"

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, LogOut, Home, BookOpen, FileText, Users, MessageSquare, Bell, Calendar, Code, Video, Heart, Armchair, Utensils } from 'lucide-react';
import { FirstTimeSetup } from '@/components/attendance/first-time-setup';
import { NotificationBell } from '@/components/notifications/notification-bell';

export default function StudentDashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user === undefined) {
      setIsLoading(true);
      return;
    }
    if (user === null) {
      router.push('/login');
      return;
    }

    setIsLoading(false);
    const isSetupComplete = localStorage.getItem('isFirstTimeSetupComplete') === 'true';
    if (!isSetupComplete) {
      setShowSetup(true);
    }
  }, [user, router]);

  const handleSetupComplete = () => {
    localStorage.setItem('isFirstTimeSetupComplete', 'true');
    setShowSetup(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navigation = [
    { icon: Home, label: 'Dashboard', href: '/student-dashboard' },
    { icon: BookOpen, label: 'Attendance', href: '/student-dashboard/attendance' },
    { icon: FileText, label: 'Assignments', href: '/student-dashboard/assignments' },
    { icon: Users, label: 'Study Groups', href: '/student-dashboard/study-groups' },
    { icon: MessageSquare, label: 'Queries', href: '/student-dashboard/queries' },
    { icon: Bell, label: 'Announcements', href: '/student-dashboard/announcements' },
    { icon: Calendar, label: 'Events', href: '/student-dashboard/events' },
    { icon: Armchair, label: 'Event Seating', href: '/student-dashboard/seating' },
    { icon: Utensils, label: 'Cafeteria & Mess', href: '/student-dashboard/cafeteria' },
    { icon: Code, label: 'Compiler', href: '/student-dashboard/compiler' },
    { icon: Video, label: 'Virtual Classroom', href: '/student-dashboard/virtual-classroom' },
    { icon: Heart, label: 'Mentorship', href: '/student-dashboard/mentorship' },
  ];

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // After loading, if there is no user, we are being redirected. Render nothing.
  if (!user) {
    return null;
  }

  if (showSetup) {
    return (
      <FirstTimeSetup
        user_id={user.id}
        user_name={user.name || 'Student'}
        user_type='student'
        onComplete={handleSetupComplete}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold">EduVision</h2>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                {navigation.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100',
                      pathname === item.href ? 'bg-gray-100' : ''
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className='h-5 w-5' />
                    {item.label}
                  </a>
                ))}
              </nav>
              <div className="p-4 border-t">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex w-64 flex-col border-r border-gray-200 bg-white">
          <div className="flex h-16 flex-shrink-0 items-center px-6">
            <h1 className="text-xl font-semibold">EduVision</h1>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
                    pathname === item.href
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className='mr-3 h-5 w-5 flex-shrink-0' aria-hidden="true" />
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
              <button onClick={handleLogout} className="group block w-full flex-shrink-0">
                <div className="flex items-center">
                  <LogOut className="h-5 w-5 text-red-600 group-hover:text-red-700" />
                  <span className="ml-3 text-sm font-medium text-red-600 group-hover:text-red-700">Logout</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center lg:hidden">
              <h1 className="text-lg font-semibold">
                {navigation.find((item) => item.href === pathname)?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex-1"></div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <button
                type="button"
                className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => router.push('/student-dashboard/profile')}
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
