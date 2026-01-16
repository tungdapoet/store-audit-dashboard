import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, MapPin, Plus, Trash2, X, Check, Move } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocations, useCreateLocation, useUpdateLocation, useDeleteLocation } from '@/hooks';
import { supabase, STORAGE_BUCKET, getStorageUrl } from '@/lib/supabase';
import { compressImage } from '@/lib/image-processing';
import type { Store, Location } from '@/types';
import { toast } from 'sonner';
import { LocationPopup } from './location-popup';

interface FloorPlanViewerProps {
  store: Store;
  isEditMode: boolean;
}

export function FloorPlanViewer({
  store,
  isEditMode,
}: FloorPlanViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [draggingMarkerId, setDraggingMarkerId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [newMarkerName, setNewMarkerName] = useState('');
  const [pendingMarker, setPendingMarker] = useState<{ x: number; y: number } | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  // Data fetching
  const { data: locations = [] } = useLocations(store.id);
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();

  const selectedLocation = locations.find(l => l.id === selectedLocationId);

  // Handle floor plan upload
  const handleUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);
    try {
      // Compress image
      const compressed = await compressImage(file);
      
      // Upload to Supabase Storage
      const path = `${store.id}/floor-plan.webp`;
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, compressed, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Update store with floor plan URL
      const url = getStorageUrl(path);
      const { error: updateError } = await supabase
        .from('stores')
        .update({ floor_plan_url: url, updated_at: new Date().toISOString() })
        .eq('id', store.id);

      if (updateError) throw updateError;

      toast.success('Floor plan uploaded successfully');
      // Force reload
      window.location.reload();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload floor plan');
    } finally {
      setIsUploading(false);
    }
  }, [store.id]);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  // Handle click to add marker
  const handleFloorPlanClick = useCallback((e: React.MouseEvent) => {
    if (!isEditMode || !isAddingMarker || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPendingMarker({ x, y });
    setNewMarkerName(`Location ${locations.length + 1}`);
  }, [isEditMode, isAddingMarker, locations.length]);

  // Confirm new marker
  const handleConfirmMarker = useCallback(async () => {
    if (!pendingMarker || !newMarkerName.trim()) return;

    try {
      const result = await createLocation.mutateAsync({
        storeId: store.id,
        name: newMarkerName.trim(),
        x: pendingMarker.x,
        y: pendingMarker.y,
      });
      toast.success('Location added');
      setSelectedLocationId(result.id);
    } catch (error) {
      toast.error('Failed to add location');
    } finally {
      setPendingMarker(null);
      setNewMarkerName('');
      setIsAddingMarker(false);
    }
  }, [pendingMarker, newMarkerName, store.id, createLocation]);

  // Global drag handlers
  useEffect(() => {
    if (!draggingMarkerId || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setDragPosition({ x, y });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || !e.touches[0]) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.touches[0].clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.touches[0].clientY - rect.top) / rect.height) * 100));
      setDragPosition({ x, y });
    };

    const handleMouseUp = async (e: MouseEvent) => {
      if (!containerRef.current || !draggingMarkerId) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

      try {
        await updateLocation.mutateAsync({
          id: draggingMarkerId,
          storeId: store.id,
          x,
          y,
        });
        toast.success('Location moved');
      } catch (error) {
        toast.error('Failed to move marker');
      }
      
      setDraggingMarkerId(null);
      setDragPosition(null);
    };

    const handleTouchEnd = async (e: TouchEvent) => {
      if (!containerRef.current || !draggingMarkerId || !e.changedTouches[0]) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.changedTouches[0].clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.changedTouches[0].clientY - rect.top) / rect.height) * 100));

      try {
        await updateLocation.mutateAsync({
          id: draggingMarkerId,
          storeId: store.id,
          x,
          y,
        });
        toast.success('Location moved');
      } catch (error) {
        toast.error('Failed to move marker');
      }
      
      setDraggingMarkerId(null);
      setDragPosition(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [draggingMarkerId, store.id, updateLocation]);

  // Delete marker
  const handleDeleteMarker = useCallback(async (locationId: string) => {
    if (!confirm('Delete this location? This will also delete all associated data and photos.')) {
      return;
    }

    try {
      await deleteLocation.mutateAsync({
        locationId,
        storeId: store.id,
      });
      toast.success('Location deleted');
      if (selectedLocationId === locationId) {
        setSelectedLocationId(null);
      }
    } catch (error) {
      toast.error('Failed to delete location');
    }
  }, [store.id, deleteLocation, selectedLocationId]);

  // Start dragging
  const handleDragStart = useCallback((locationId: string, e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    setDraggingMarkerId(locationId);
    
    // Set initial drag position
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setDragPosition({ x, y });
  }, [isEditMode]);

  // No floor plan uploaded
  if (!store.floor_plan_url) {
    return (
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          'flex flex-col items-center justify-center',
          'h-96 border-2 border-dashed border-border rounded-xl',
          'bg-card/50 transition-colors',
          isEditMode && 'hover:border-primary cursor-pointer'
        )}
      >
        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">No Floor Plan</p>
        <p className="text-sm text-muted-foreground mb-4">
          {isEditMode 
            ? 'Drop an image here or click to upload'
            : 'Enable edit mode to upload a floor plan'
          }
        </p>
        {isEditMode && (
          <label className={cn(
            'px-4 py-2 rounded-lg cursor-pointer',
            'bg-primary text-primary-foreground',
            'hover:bg-primary/90 transition-colors'
          )}>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              disabled={isUploading}
            />
            {isUploading ? 'Uploading...' : 'Upload Floor Plan'}
          </label>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {isEditMode && (
        <div className="flex items-center gap-2 p-2 bg-card/50 border border-border rounded-lg">
          <button
            onClick={() => setIsAddingMarker(!isAddingMarker)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
              isAddingMarker
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            <Plus className="h-4 w-4" />
            {isAddingMarker ? 'Click on map to place' : 'Add Location'}
          </button>

          {isAddingMarker && (
            <button
              onClick={() => {
                setIsAddingMarker(false);
                setPendingMarker(null);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}

          <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer ml-auto">
            <Upload className="h-4 w-4" />
            Replace Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              disabled={isUploading}
            />
          </label>
        </div>
      )}

      {/* Floor Plan with Markers and Popup */}
      <div className="flex gap-4">
        {/* Floor Plan */}
        <div
          ref={containerRef}
          className={cn(
            'relative overflow-hidden rounded-xl border border-border flex-1',
            isAddingMarker && 'cursor-crosshair',
            draggingMarkerId && 'cursor-grabbing'
          )}
          onClick={handleFloorPlanClick}
        >
          <img
            src={store.floor_plan_url}
            alt="Floor Plan"
            className="w-full h-auto"
            draggable={false}
          />

          {/* Existing Markers */}
          {locations.map((location) => {
            // If this marker is being dragged, show it at drag position
            const isDragging = location.id === draggingMarkerId;
            const displayX = isDragging && dragPosition ? dragPosition.x : location.x;
            const displayY = isDragging && dragPosition ? dragPosition.y : location.y;
            
            return (
              <Marker
                key={location.id}
                location={{ ...location, x: displayX, y: displayY }}
                isSelected={location.id === selectedLocationId}
                isEditMode={isEditMode}
                isDragging={isDragging}
                onSelect={() => setSelectedLocationId(
                  selectedLocationId === location.id ? null : location.id
                )}
                onDragStart={(e) => handleDragStart(location.id, e)}
                onDelete={() => handleDeleteMarker(location.id)}
              />
            );
          })}

          {/* Pending Marker (being added) */}
          {pendingMarker && (
            <div
              className="absolute z-20"
              style={{
                left: `${pendingMarker.x}%`,
                top: `${pendingMarker.y}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="flex flex-col items-center">
                <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg mb-2">
                  <input
                    type="text"
                    value={newMarkerName}
                    onChange={(e) => setNewMarkerName(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm w-32"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirmMarker();
                      if (e.key === 'Escape') {
                        setPendingMarker(null);
                        setIsAddingMarker(false);
                      }
                    }}
                  />
                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={handleConfirmMarker}
                      className="p-1 rounded bg-white/20 hover:bg-white/30"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setPendingMarker(null);
                        setIsAddingMarker(false);
                      }}
                      className="p-1 rounded bg-white/20 hover:bg-white/30"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <MapPin className="h-8 w-8 text-primary drop-shadow-lg" />
              </div>
            </div>
          )}
        </div>

        {/* Location Popup Panel */}
        {selectedLocation && (
          <LocationPopup
            location={selectedLocation}
            storeId={store.id}
            isEditMode={isEditMode}
            onClose={() => setSelectedLocationId(null)}
            onDelete={() => handleDeleteMarker(selectedLocation.id)}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{locations.length} locations</span>
        </div>
        {isEditMode && (
          <div className="flex items-center gap-2">
            <Move className="h-4 w-4" />
            <span>Drag markers to reposition</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Marker Component - shows abbreviated location name
interface MarkerProps {
  location: Location;
  isSelected: boolean;
  isEditMode: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent | React.TouchEvent) => void;
  onDelete: () => void;
}

function Marker({
  location,
  isSelected,
  isEditMode,
  isDragging,
  onSelect,
  onDragStart,
  onDelete,
}: MarkerProps) {
  const [showLabel, setShowLabel] = useState(false);

  // Get abbreviated name (first 3 chars or first letter of each word)
  const getAbbreviation = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length > 1) {
      // Multiple words: take first letter of each (max 3)
      return words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
    }
    // Single word: take first 3 chars
    return name.slice(0, 3).toUpperCase();
  };

  return (
    <div
      className={cn(
        'absolute z-10 group',
        isDragging && 'z-30 pointer-events-none'
      )}
      style={{
        left: `${location.x}%`,
        top: `${location.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Label */}
      <div
        className={cn(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
          'bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap',
          'border border-border shadow-lg',
          'transition-opacity duration-150',
          (showLabel || isSelected) ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {location.name}
        {isEditMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="ml-2 p-0.5 rounded hover:bg-destructive/20 text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Name-based marker */}
      <button
        onClick={(e) => {
          if (!isDragging) {
            e.stopPropagation();
            onSelect();
          }
        }}
        onMouseEnter={() => setShowLabel(true)}
        onMouseLeave={() => setShowLabel(false)}
        onMouseDown={isEditMode ? onDragStart : undefined}
        onTouchStart={isEditMode ? onDragStart : undefined}
        className={cn(
          'relative flex items-center justify-center',
          'min-w-8 h-8 px-2 rounded-full',
          'font-bold text-xs text-white',
          'shadow-[0_2px_8px_rgba(0,0,0,0.4)]',
          'border-2 border-white',
          'transition-all duration-150',
          'hover:scale-110',
          isSelected ? 'bg-primary scale-110 ring-2 ring-primary ring-offset-2' : 'bg-orange-500',
          isEditMode && !isDragging && 'cursor-grab',
          isDragging && 'cursor-grabbing scale-125 opacity-80'
        )}
      >
        {getAbbreviation(location.name)}
      </button>
    </div>
  );
}
