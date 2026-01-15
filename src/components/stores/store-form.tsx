import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Store, StoreFormData } from '@/types';

interface StoreFormProps {
  store?: Store;
  onSubmit: (data: StoreFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function StoreForm({
  store,
  onSubmit,
  onCancel,
  isLoading,
}: StoreFormProps) {
  const [formData, setFormData] = useState<StoreFormData>({
    name: store?.name || '',
    location: store?.location || '',
    address: store?.address || '',
    manager: store?.manager || '',
    phone: store?.phone || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {store ? 'Edit Store' : 'Add New Store'}
          </h2>
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
              Store Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={cn(
                'w-full px-3 py-2 rounded-lg',
                'bg-input-background border border-border',
                'text-sm placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
              placeholder="e.g., Downtown Manhattan Store"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Location *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className={cn(
                'w-full px-3 py-2 rounded-lg',
                'bg-input-background border border-border',
                'text-sm placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
              placeholder="e.g., New York, NY"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className={cn(
                'w-full px-3 py-2 rounded-lg',
                'bg-input-background border border-border',
                'text-sm placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
              placeholder="e.g., 123 Broadway, New York, NY 10001"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Manager
              </label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) =>
                  setFormData({ ...formData, manager: e.target.value })
                }
                className={cn(
                  'w-full px-3 py-2 rounded-lg',
                  'bg-input-background border border-border',
                  'text-sm placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring'
                )}
                placeholder="e.g., John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className={cn(
                  'w-full px-3 py-2 rounded-lg',
                  'bg-input-background border border-border',
                  'text-sm placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring'
                )}
                placeholder="e.g., (212) 555-0123"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
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
              disabled={isLoading}
              className={cn(
                'flex-1 px-4 py-2 rounded-lg',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? 'Saving...' : store ? 'Save Changes' : 'Add Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
