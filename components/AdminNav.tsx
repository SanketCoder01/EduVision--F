"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Users, Settings, Home } from 'lucide-react'

export default function AdminNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: Home
    },
    {
      href: '/admin/registration-approvals',
      label: 'Registration Approvals',
      icon: Users
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: Settings
    }
  ]

  return (
    <nav className="flex space-x-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}
