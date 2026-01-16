import { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Save,
  MapPin,
  Camera,
  Upload,
  ChevronDown,
  Pencil,
  Check,
  Trash2,
  ZoomIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStorageUrl } from '@/lib/supabase';
import { useLocationData, useUpsertLocationData, useUpdateLocation } from '@/hooks';
import { usePhotosByType, useUploadPhoto, useDeletePhoto } from '@/hooks/use-photos';
import { MEASUREMENT_TYPES, DEFAULT_MIRROR_DOOR, DEFAULT_COLUMN, DEFAULT_WALL } from '@/lib/constants';
import type { Location, MeasurementType, Measurement, Photo } from '@/types';
import { toast } from 'sonner';

interface LocationPopupProps {
  location: Location;
  storeId: string;
  isEditMode: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export function LocationPopup({
  location,
  storeId,
  isEditMode,
  onClose,
  onDelete,
}: LocationPopupProps) {
  const { data: locationData, isLoading } = useLocationData(location.id);
  const upsertLocationData = useUpsertLocationData();
  const updateLocation = useUpdateLocation();

  // Form state
  const [locationName, setLocationName] = useState(location.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [measurementType, setMeasurementType] = useState<MeasurementType>(
    locationData?.measurement_type || 'column'
  );
  const [measurements, setMeasurements] = useState<Measurement>(
    locationData?.measurements || DEFAULT_COLUMN
  );
  const [lastAuditDate, setLastAuditDate] = useState(
    locationData?.last_audit_date || ''
  );
  const [lastInstallDate, setLastInstallDate] = useState(
    locationData?.last_install_date || ''
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Update form when data loads
  useEffect(() => {
    setLocationName(location.name);
  }, [location.name]);

  useEffect(() => {
    if (locationData) {
      setMeasurementType(locationData.measurement_type);
      setMeasurements(locationData.measurements);
      setLastAuditDate(locationData.last_audit_date || '');
      setLastInstallDate(locationData.last_install_date || '');
      setHasChanges(false);
    }
  }, [locationData]);

  // Handle name save
  const handleSaveName = async () => {
    if (!locationName.trim() || locationName === location.name) {
      setIsEditingName(false);
      setLocationName(location.name);
      return;
    }

    try {
      await updateLocation.mutateAsync({
        id: location.id,
        storeId,
        name: locationName.trim(),
      });
      toast.success('Location name updated');
      setIsEditingName(false);
    } catch (error) {
      toast.error('Failed to update name');
      setLocationName(location.name);
    }
  };

  // Handle measurement type change
  const handleTypeChange = (type: MeasurementType) => {
    setMeasurementType(type);
    if (type === 'mirror_door') {
      setMeasurements(DEFAULT_MIRROR_DOOR);
    } else if (type === 'column') {
      setMeasurements(DEFAULT_COLUMN);
    } else {
      setMeasurements(DEFAULT_WALL);
    }
    setHasChanges(true);
    setIsDropdownOpen(false);
  };

  // Handle save
  const handleSave = async () => {
    try {
      await upsertLocationData.mutateAsync({
        locationId: location.id,
        measurement_type: measurementType,
        measurements,
        last_audit_date: lastAuditDate || undefined,
        last_install_date: lastInstallDate || undefined,
      });
      setHasChanges(false);
      toast.success('Location data saved');
    } catch (error) {
      toast.error('Failed to save location data');
    }
  };

  const currentTypeLabel = MEASUREMENT_TYPES.find(t => t.value === measurementType)?.label || 'Select Type';

  return (
    <div className="w-96 bg-card border border-border rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
          {isEditingName && isEditMode ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="flex-1 px-2 py-1 text-lg font-semibold bg-input-background border border-border rounded"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') {
                    setIsEditingName(false);
                    setLocationName(location.name);
                  }
                }}
              />
              <button
                onClick={handleSaveName}
                className="p-1 hover:bg-secondary rounded"
              >
                <Check className="h-4 w-4 text-primary" />
              </button>
              <button
                onClick={() => {
                  setIsEditingName(false);
                  setLocationName(location.name);
                }}
                className="p-1 hover:bg-secondary rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h2 className="text-lg font-semibold truncate">{location.name}</h2>
              {isEditMode && (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1 hover:bg-secondary rounded flex-shrink-0"
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {isEditMode && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"
              title="Delete location"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-8 w-full bg-muted/50 rounded animate-pulse" />
            <div className="h-24 bg-muted/50 rounded animate-pulse" />
          </div>
        ) : (
          <>
            {/* Section 1: Location Type */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Location Type</h3>
              
              {/* Dropdown */}
              <div className="relative">
                <button
                  onClick={() => isEditMode && setIsDropdownOpen(!isDropdownOpen)}
                  disabled={!isEditMode}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg',
                    'bg-input-background border border-border',
                    'text-sm text-left',
                    isEditMode && 'hover:border-primary cursor-pointer',
                    !isEditMode && 'opacity-60 cursor-default'
                  )}
                >
                  <span>{currentTypeLabel}</span>
                  <ChevronDown className={cn('h-4 w-4 transition-transform', isDropdownOpen && 'rotate-180')} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute z-20 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
                    {MEASUREMENT_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => handleTypeChange(type.value as MeasurementType)}
                        className={cn(
                          'w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors',
                          measurementType === type.value && 'bg-accent text-accent-foreground'
                        )}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Conditional Fields based on Type */}
              {measurementType === 'column' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Front/Back Size
                    </label>
                    <input
                      type="text"
                      value={(measurements as { frontBack: string; sides: string }).frontBack || ''}
                      onChange={(e) => {
                        setMeasurements({
                          type: 'column',
                          frontBack: e.target.value,
                          sides: (measurements as { frontBack: string; sides: string }).sides || '',
                        });
                        setHasChanges(true);
                      }}
                      disabled={!isEditMode}
                      placeholder="e.g. 100mm"
                      className={cn(
                        'w-full px-3 py-2 rounded-lg text-sm',
                        'bg-input-background border border-border',
                        'placeholder:text-muted-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-ring',
                        !isEditMode && 'opacity-60'
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Sides Size
                    </label>
                    <input
                      type="text"
                      value={(measurements as { frontBack: string; sides: string }).sides || ''}
                      onChange={(e) => {
                        setMeasurements({
                          type: 'column',
                          frontBack: (measurements as { frontBack: string; sides: string }).frontBack || '',
                          sides: e.target.value,
                        });
                        setHasChanges(true);
                      }}
                      disabled={!isEditMode}
                      placeholder="e.g. 80mm"
                      className={cn(
                        'w-full px-3 py-2 rounded-lg text-sm',
                        'bg-input-background border border-border',
                        'placeholder:text-muted-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-ring',
                        !isEditMode && 'opacity-60'
                      )}
                    />
                  </div>
                </div>
              )}

              {measurementType === 'mirror_door' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Top Size
                    </label>
                    <input
                      type="text"
                      value={(measurements as { top: string; bottom: string }).top || ''}
                      onChange={(e) => {
                        setMeasurements({
                          type: 'mirror_door',
                          top: e.target.value,
                          bottom: (measurements as { top: string; bottom: string }).bottom || '',
                        });
                        setHasChanges(true);
                      }}
                      disabled={!isEditMode}
                      placeholder="e.g. 50mm"
                      className={cn(
                        'w-full px-3 py-2 rounded-lg text-sm',
                        'bg-input-background border border-border',
                        'placeholder:text-muted-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-ring',
                        !isEditMode && 'opacity-60'
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Bottom Size
                    </label>
                    <input
                      type="text"
                      value={(measurements as { top: string; bottom: string }).bottom || ''}
                      onChange={(e) => {
                        setMeasurements({
                          type: 'mirror_door',
                          top: (measurements as { top: string; bottom: string }).top || '',
                          bottom: e.target.value,
                        });
                        setHasChanges(true);
                      }}
                      disabled={!isEditMode}
                      placeholder="e.g. 60mm"
                      className={cn(
                        'w-full px-3 py-2 rounded-lg text-sm',
                        'bg-input-background border border-border',
                        'placeholder:text-muted-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-ring',
                        !isEditMode && 'opacity-60'
                      )}
                    />
                  </div>
                </div>
              )}

              {measurementType === 'wall' && (
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    value={(measurements as { description: string }).description || ''}
                    onChange={(e) => {
                      setMeasurements({
                        type: 'wall',
                        description: e.target.value,
                      });
                      setHasChanges(true);
                    }}
                    disabled={!isEditMode}
                    rows={2}
                    placeholder="Enter wall details..."
                    className={cn(
                      'w-full px-3 py-2 rounded-lg resize-none text-sm',
                      'bg-input-background border border-border',
                      'placeholder:text-muted-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-ring',
                      !isEditMode && 'opacity-60'
                    )}
                  />
                </div>
              )}
            </div>

            {/* Section 2: Audit Photo */}
            <PhotoSection
              title="Audit Photo"
              locationId={location.id}
              storeId={storeId}
              photoType="audit"
              isEditMode={isEditMode}
              dateValue={lastAuditDate}
              onDateChange={(date) => {
                setLastAuditDate(date);
                setHasChanges(true);
              }}
              dateLabel="Latest Audit Date"
            />

            {/* Section 3: Install Photo */}
            <PhotoSection
              title="Install Photo"
              locationId={location.id}
              storeId={storeId}
              photoType="install"
              isEditMode={isEditMode}
              dateValue={lastInstallDate}
              onDateChange={(date) => {
                setLastInstallDate(date);
                setHasChanges(true);
              }}
              dateLabel="Latest Install Date"
            />
          </>
        )}
      </div>

      {/* Footer with Save button */}
      {isEditMode && hasChanges && (
        <div className="p-4 border-t border-border bg-card">
          <button
            onClick={handleSave}
            disabled={upsertLocationData.isPending}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90 transition-colors',
              'disabled:opacity-50'
            )}
          >
            <Save className="h-4 w-4" />
            {upsertLocationData.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}

// Photo Section Component with Lightbox
interface PhotoSectionProps {
  title: string;
  locationId: string;
  storeId: string;
  photoType: 'audit' | 'install';
  isEditMode: boolean;
  dateValue: string;
  onDateChange: (date: string) => void;
  dateLabel: string;
}

function PhotoSection({
  title,
  locationId,
  storeId,
  photoType,
  isEditMode,
  dateValue,
  onDateChange,
  dateLabel,
}: PhotoSectionProps) {
  const { data: photos = [], isLoading } = usePhotosByType(locationId, photoType);
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      try {
        await uploadPhoto.mutateAsync({
          file,
          locationId,
          storeId,
          type: photoType,
        });
        toast.success('Photo uploaded');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [uploadPhoto, locationId, storeId, photoType]);

  // Handle paste
  useEffect(() => {
    if (!isEditMode || !isFocused) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            await handleFileUpload([file]);
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [isEditMode, isFocused, handleFileUpload]);

  // Handle delete
  const handleDelete = async (photo: Photo, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deletePhoto.mutateAsync({
        photoId: photo.id,
        locationId: photo.location_id,
        storagePath: photo.storage_path,
        thumbnailPath: photo.thumbnail_path,
      });
      toast.success('Photo deleted');
      if (lightboxPhoto?.id === photo.id) {
        setLightboxPhoto(null);
      }
    } catch (error) {
      toast.error('Failed to delete photo');
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Camera className="h-4 w-4" />
        {title}
      </h3>

      {/* Photo Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group aspect-square cursor-pointer"
              onClick={() => setLightboxPhoto(photo)}
            >
              <img
                src={getStorageUrl(photo.thumbnail_path)}
                alt="Photo"
                className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-lg">
                <ZoomIn className="h-6 w-6 text-white" />
              </div>
              {isEditMode && (
                <button
                  onClick={(e) => handleDelete(photo, e)}
                  disabled={deletePhoto.isPending}
                  className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {/* Upload Area */}
      {isEditMode && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
          onDrop={async (e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files.length > 0) {
              await handleFileUpload(e.dataTransfer.files);
            }
          }}
          onMouseEnter={() => setIsFocused(true)}
          onMouseLeave={() => setIsFocused(false)}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className={cn(
            'border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors',
            isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              if (e.target.files) {
                handleFileUpload(e.target.files);
                e.target.value = '';
              }
            }}
            className="hidden"
          />
          <Upload className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Upload or paste
          </p>
          {uploadPhoto.isPending && (
            <p className="text-xs text-primary mt-1">Uploading...</p>
          )}
        </div>
      )}

      {/* Date Field */}
      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          {dateLabel}
        </label>
        <input
          type="text"
          value={dateValue}
          onChange={(e) => onDateChange(e.target.value)}
          disabled={!isEditMode}
          placeholder="e.g. Jan 15, 2024"
          className={cn(
            'w-full px-3 py-2 rounded-lg text-sm',
            'bg-input-background border border-border',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            !isEditMode && 'opacity-60'
          )}
        />
      </div>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={getStorageUrl(lightboxPhoto.storage_path)}
            alt="Full size photo"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {/* Navigation arrows if multiple photos */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = photos.findIndex(p => p.id === lightboxPhoto.id);
                  const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
                  setLightboxPhoto(photos[prevIndex]);
                }}
                className="absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
              >
                <ChevronDown className="h-6 w-6 rotate-90" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = photos.findIndex(p => p.id === lightboxPhoto.id);
                  const nextIndex = (currentIndex + 1) % photos.length;
                  setLightboxPhoto(photos[nextIndex]);
                }}
                className="absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
              >
                <ChevronDown className="h-6 w-6 -rotate-90" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
