"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface SidebarNavItem {
  title: string
  href: string
  icon: LucideIcon
  description?: string
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  return (
    <div className={cn("pb-12", className)} {...props}>
      {children}
    </div>
  )
}

interface SidebarNavItemProps {
  title: string
  href: string
  icon: LucideIcon
  description?: string
}

export function SidebarNavItem({ title, href, icon: Icon, description }: SidebarNavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link href={href}>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn("w-full justify-start mb-1", isActive && "bg-muted font-medium")}
      >
        <Icon className="mr-2 h-4 w-4" />
        {title}
      </Button>
    </Link>
  )
}
