import { useState } from 'react';
import { Search, Plus, Store as StoreIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Store } from '@/types';

interface StoreListProps {
  stores: Store[];
  selectedStoreId: string | null;
  onSelectStore: (storeId: string) => void;
  onAddStore?: () => void;
  isLoading?: boolean;
}

export function StoreList({
  stores,
  selectedStoreId,
  onSelectStore,
  onAddStore,
  isLoading,
}: StoreListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-9 pr-4 py-2 rounded-lg',
              'bg-input-background border border-border',
              'text-sm placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring'
            )}
          />
        </div>
      </div>

      {/* Store List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <StoreIcon className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No stores found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredStores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                isSelected={store.id === selectedStoreId}
                onClick={() => onSelectStore(store.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Store Button */}
      {onAddStore && (
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={onAddStore}
            className={cn(
              'w-full flex items-center justify-center gap-2',
              'px-4 py-2 rounded-lg',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90 transition-colors'
            )}
          >
            <Plus className="h-4 w-4" />
            Add Store
          </button>
        </div>
      )}
    </div>
  );
}

interface StoreCardProps {
  store: Store;
  isSelected: boolean;
  onClick: () => void;
}

function StoreCard({ store, isSelected, onClick }: StoreCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg transition-colors',
        'border border-border hover:border-primary/30 hover:bg-sidebar-accent',
        isSelected && 'bg-sidebar-accent border-primary'
      )}
    >
      <div>
        <h3 className="font-medium text-sm truncate">{store.name}</h3>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {store.location}
        </p>
      </div>
    </button>
  );
}
