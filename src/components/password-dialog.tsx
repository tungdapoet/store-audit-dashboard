import { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordDialogProps {
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

export function PasswordDialog({ onSubmit, onCancel }: PasswordDialogProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Unlock Edit Mode</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Password
            </label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                'w-full px-3 py-2 rounded-lg',
                'bg-input-background border border-border',
                'text-sm placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
              placeholder="Enter password to edit"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className={cn(
                'flex-1 px-4 py-2 rounded-lg',
                'bg-secondary text-secondary-foreground',
                'hover:bg-secondary/80 transition-colors'
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={cn(
                'flex-1 px-4 py-2 rounded-lg',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90 transition-colors'
              )}
            >
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
