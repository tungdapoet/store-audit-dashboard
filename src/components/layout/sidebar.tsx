import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { SIDEBAR_WIDTH } from '@/lib/constants';

interface SidebarProps {
  children: ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border',
        'flex flex-col overflow-hidden',
        className
      )}
      style={{ width: SIDEBAR_WIDTH }}
    >
      {children}
    </aside>
  );
}

interface SidebarHeaderProps {
  children: ReactNode;
  className?: string;
}

export function SidebarHeader({ children, className }: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        'flex-shrink-0 p-4 border-b border-sidebar-border',
        className
      )}
    >
      {children}
    </div>
  );
}

interface SidebarContentProps {
  children: ReactNode;
  className?: string;
}

export function SidebarContent({ children, className }: SidebarContentProps) {
  return (
    <div className={cn('flex-1 overflow-y-auto p-2', className)}>
      {children}
    </div>
  );
}

interface SidebarFooterProps {
  children: ReactNode;
  className?: string;
}

export function SidebarFooter({ children, className }: SidebarFooterProps) {
  return (
    <div
      className={cn(
        'flex-shrink-0 p-4 border-t border-sidebar-border',
        className
      )}
    >
      {children}
    </div>
  );
}
