import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { SIDEBAR_WIDTH } from '@/lib/constants';

interface MainContentProps {
  children: ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  return (
    <main
      className={cn('min-h-screen bg-background', className)}
      style={{ marginLeft: SIDEBAR_WIDTH }}
    >
      {children}
    </main>
  );
}

interface ContentAreaProps {
  children: ReactNode;
  className?: string;
}

export function ContentArea({ children, className }: ContentAreaProps) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
}
