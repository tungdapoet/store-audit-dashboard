import { useState } from 'react';
import { MapPin, Phone, User, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import {
  Header,
  HeaderTitle,
  HeaderActions,
  ContentArea,
} from '@/components/layout';
import type { Store, TabType } from '@/types';

interface StoreDetailProps {
  store: Store;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onEditStore: () => void;
  onDeleteStore: () => void;
  children: React.ReactNode;
}

export function StoreDetail({
  store,
  activeTab,
  onTabChange,
  isEditMode,
  onToggleEditMode,
  onEditStore,
  onDeleteStore,
  children,
}: StoreDetailProps) {
  const [showMenu, setShowMenu] = useState(false);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'floor-plan', label: 'Floor Plan' },
    { id: 'locations', label: 'Locations' },
    { id: 'summary', label: 'Summary' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <Header>
        <HeaderTitle>
          <div>
            <h1 className="text-xl font-semibold">{store.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {store.location}
            </p>
          </div>
        </HeaderTitle>

        <HeaderActions>
          {/* Edit Mode Toggle */}
          <button
            onClick={onToggleEditMode}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              isEditMode
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            <Edit2 className="h-4 w-4 inline-block mr-1.5" />
            {isEditMode ? 'Editing' : 'Edit'}
          </button>

          {/* More Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-popover border border-border rounded-lg shadow-lg py-1">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEditStore();
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors"
                  >
                    <Edit2 className="h-4 w-4 inline-block mr-2" />
                    Edit Store Info
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDeleteStore();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-accent transition-colors"
                  >
                    <Trash2 className="h-4 w-4 inline-block mr-2" />
                    Delete Store
                  </button>
                </div>
              </>
            )}
          </div>
        </HeaderActions>
      </Header>

      {/* Store Info Bar */}
      <div className="border-b border-border px-6 py-3 bg-card/50">
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{store.address}</span>
          </div>
          {store.manager && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{store.manager}</span>
            </div>
          )}
          {store.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{store.phone}</span>
            </div>
          )}
          {store.last_edited_by && (
            <div className="ml-auto text-xs">
              Last edited by {store.last_edited_by}{' '}
              {formatRelativeTime(store.updated_at)}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border px-6">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'px-4 py-3 text-sm font-medium transition-colors relative',
                activeTab === tab.id
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <ContentArea className="flex-1 overflow-y-auto">
        {children}
      </ContentArea>
    </div>
  );
}
