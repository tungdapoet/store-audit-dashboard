import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { HEADER_HEIGHT } from '@/lib/constants';

interface HeaderProps {
  children: ReactNode;
  className?: string;
}

export function Header({ children, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-10 bg-background/80 backdrop-blur-sm',
        'border-b border-border px-6',
        'flex items-center justify-between',
        className
      )}
      style={{ height: HEADER_HEIGHT }}
    >
      {children}
    </header>
  );
}

interface HeaderTitleProps {
  children: ReactNode;
  className?: string;
}

export function HeaderTitle({ children, className }: HeaderTitleProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {children}
    </div>
  );
}

interface HeaderActionsProps {
  children: ReactNode;
  className?: string;
}

export function HeaderActions({ children, className }: HeaderActionsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {children}
    </div>
  );
}
