'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  HelpCircle,
  Flag,
  FileText,
  Settings,
  Shield,
  UserCheck,
} from 'lucide-react';

interface SidebarNavProps {
  userRole: string;
}

const adminLinks = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'MODERATOR'],
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    name: 'Questions',
    href: '/admin/questions',
    icon: HelpCircle,
    roles: ['ADMIN', 'MODERATOR'],
  },
  {
    name: 'Category Health',
    href: '/admin/categories',
    icon: Shield,
    roles: ['ADMIN'],
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: Flag,
    roles: ['ADMIN', 'MODERATOR'],
  },
  {
    name: 'System Logs',
    href: '/admin/logs',
    icon: FileText,
    roles: ['ADMIN'],
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    roles: ['ADMIN'],
  },
];

export function SidebarNav({ userRole }: SidebarNavProps) {
  const pathname = usePathname();

  const filteredLinks = adminLinks.filter(link => 
    link.roles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-card border-r border-border p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Admin Panel
        </h2>
        <p className="text-sm text-subtle mt-1">
          {userRole === 'ADMIN' ? 'Administrator' : 'Moderator'} Access
        </p>
      </div>

      <nav className="space-y-2">
        {filteredLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-subtle hover:text-text hover:bg-accent'
              )}
            >
              <Icon className="h-4 w-4" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <p>Role: <span className="font-medium text-text">{userRole}</span></p>
          <p className="mt-1">Version: 0.12.8</p>
        </div>
      </div>
    </aside>
  );
}







