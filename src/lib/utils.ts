import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

// Tailwind class merging utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// Status helpers
export function getStatusColor(status: string): string {
  switch (status) {
    case 'complete':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'in_progress':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'pending':
    default:
      return 'bg-red-500/20 text-red-400 border-red-500/30';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'complete':
      return 'Complete';
    case 'in_progress':
      return 'In Progress';
    case 'pending':
    default:
      return 'Pending';
  }
}

// Generate unique IDs
export function generateId(): string {
  return crypto.randomUUID();
}

// Debounce utility
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Truncate text
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

// Format phone number
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return 'N/A';
  return phone;
}

// Calculate percentage
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}
