import { useState } from 'react';
import { toast } from 'sonner';
import { Store as StoreIcon } from 'lucide-react';
import { Providers } from '@/app/providers';
import { Sidebar } from '@/components/layout';
import { StoreList, StoreDetail, StoreForm } from '@/components/stores';
import { FloorPlanViewer } from '@/components/floor-plan';
import { LocationList, LocationDetail } from '@/components/locations';
import { PasswordDialog } from '@/components/password-dialog';
import {
  useStores,
  useStore,
  useCreateStore,
  useUpdateStore,
  useDeleteStore,
  useEditMode,
  useLocations,
} from '@/hooks';
import type { TabType, StoreFormData, Store } from '@/types';

function AppContent() {
  // State
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('floor-plan');
  const [showAddStore, setShowAddStore] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  // Edit mode
  const {
    isEditMode,
    isUnlocked,
    unlock,
    toggleEditMode,
  } = useEditMode();

  // Data fetching
  const { data: stores = [], isLoading: storesLoading } = useStores();
  const { data: selectedStore } = useStore(selectedStoreId);
  const { data: locations = [] } = useLocations(selectedStoreId);

  // Find selected location
  const selectedLocation = locations.find((l) => l.id === selectedLocationId);

  // Mutations
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  const deleteStore = useDeleteStore();

  // Handlers
  const handleSelectStore = (storeId: string) => {
    setSelectedStoreId(storeId);
    setActiveTab('floor-plan');
    setSelectedLocationId(null);
  };

  const handleAddStore = () => {
    if (!isUnlocked) {
      setShowPasswordDialog(true);
      return;
    }
    setShowAddStore(true);
  };

  const handleCreateStore = async (data: StoreFormData) => {
    try {
      const newStore = await createStore.mutateAsync(data);
      setShowAddStore(false);
      setSelectedStoreId(newStore.id);
      toast.success('Store created successfully');
    } catch (error) {
      toast.error('Failed to create store');
    }
  };

  const handleEditStore = () => {
    if (!isUnlocked) {
      setShowPasswordDialog(true);
      return;
    }
    if (selectedStore) {
      setEditingStore(selectedStore);
    }
  };

  const handleUpdateStore = async (data: StoreFormData) => {
    if (!editingStore) return;
    try {
      await updateStore.mutateAsync({
        id: editingStore.id,
        ...data,
      });
      setEditingStore(null);
      toast.success('Store updated successfully');
    } catch (error) {
      toast.error('Failed to update store');
    }
  };

  const handleDeleteStore = async () => {
    if (!selectedStore) return;
    if (!isUnlocked) {
      setShowPasswordDialog(true);
      return;
    }
    
    if (confirm(`Are you sure you want to delete "${selectedStore.name}"?`)) {
      try {
        await deleteStore.mutateAsync(selectedStore.id);
        setSelectedStoreId(null);
        toast.success('Store deleted successfully');
      } catch (error) {
        toast.error('Failed to delete store');
      }
    }
  };

  const handleToggleEditMode = () => {
    if (!isUnlocked) {
      setShowPasswordDialog(true);
      return;
    }
    toggleEditMode();
  };

  const handlePasswordSubmit = (password: string) => {
    if (unlock(password)) {
      setShowPasswordDialog(false);
      toast.success('Edit mode unlocked');
    } else {
      toast.error('Incorrect password');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar>
        <StoreList
          stores={stores}
          selectedStoreId={selectedStoreId}
          onSelectStore={handleSelectStore}
          onAddStore={handleAddStore}
          isLoading={storesLoading}
        />
      </Sidebar>

      {/* Main Content */}
      <main
        className="flex-1 overflow-hidden"
        style={{ marginLeft: 280 }}
      >
        {selectedStore ? (
          <StoreDetail
            store={selectedStore}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isEditMode={isEditMode}
            onToggleEditMode={handleToggleEditMode}
            onEditStore={handleEditStore}
            onDeleteStore={handleDeleteStore}
          >
            {/* Tab Content */}
            <div className="h-full">
              {activeTab === 'floor-plan' && (
                <FloorPlanViewer
                  store={selectedStore}
                  isEditMode={isEditMode}
                />
              )}
              {activeTab === 'locations' && selectedStore && (
                selectedLocation ? (
                  <LocationDetail
                    location={selectedLocation}
                    storeId={selectedStore.id}
                    isEditMode={isEditMode}
                    onBack={() => setSelectedLocationId(null)}
                  />
                ) : (
                  <LocationList
                    store={selectedStore}
                    selectedLocationId={selectedLocationId}
                    onSelectLocation={setSelectedLocationId}
                    isEditMode={isEditMode}
                  />
                )
              )}
              {activeTab === 'summary' && (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">
                    Summary View (Coming in Phase 7)
                  </p>
                </div>
              )}
            </div>
          </StoreDetail>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <StoreIcon className="h-16 w-16 mb-4 opacity-30" />
            <h2 className="text-xl font-medium mb-2">No Store Selected</h2>
            <p className="text-sm">Select a store from the sidebar to view details</p>
          </div>
        )}
      </main>

      {/* Dialogs */}
      {showAddStore && (
        <StoreForm
          onSubmit={handleCreateStore}
          onCancel={() => setShowAddStore(false)}
          isLoading={createStore.isPending}
        />
      )}

      {editingStore && (
        <StoreForm
          store={editingStore}
          onSubmit={handleUpdateStore}
          onCancel={() => setEditingStore(null)}
          isLoading={updateStore.isPending}
        />
      )}

      {showPasswordDialog && (
        <PasswordDialog
          onSubmit={handlePasswordSubmit}
          onCancel={() => setShowPasswordDialog(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <Providers>
      <AppContent />
    </Providers>
  );
}
