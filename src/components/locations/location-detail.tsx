import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Save,
  MapPin,
  Camera,
  Upload,
  X,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStorageUrl } from '@/lib/supabase';
import { useLocationData, useUpsertLocationData } from '@/hooks';
import { usePhotosByType, useUploadPhoto, useDeletePhoto } from '@/hooks/use-photos';
import { MEASUREMENT_TYPES, DEFAULT_MIRROR_DOOR, DEFAULT_COLUMN, DEFAULT_WALL } from '@/lib/constants';
import type { Location, MeasurementType, Measurement, Photo } from '@/types';
import { toast } from 'sonner';

interface LocationDetailProps {
  location: Location;
  storeId: string;
  isEditMode: boolean;
  onBack: () => void;
}

export function LocationDetail({
  location,
  storeId,
  isEditMode,
  onBack,
}: LocationDetailProps) {
  const { data: locationData, isLoading } = useLocationData(location.id);
  const upsertLocationData = useUpsertLocationData();

  // Form state
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
    if (locationData) {
      setMeasurementType(locationData.measurement_type);
      setMeasurements(locationData.measurements);
      setLastAuditDate(locationData.last_audit_date || '');
      setLastInstallDate(locationData.last_install_date || '');
      setHasChanges(false);
    }
  }, [locationData]);

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted/50 rounded animate-pulse" />
        <div className="h-64 bg-muted/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  const currentTypeLabel = MEASUREMENT_TYPES.find(t => t.value === measurementType)?.label || 'Select Type';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold">{location.name}</h2>
        </div>

        {isEditMode && hasChanges && (
          <button
            onClick={handleSave}
            disabled={upsertLocationData.isPending}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90 transition-colors',
              'disabled:opacity-50'
            )}
          >
            <Save className="h-4 w-4" />
            {upsertLocationData.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* Section 1: Location Type */}
      <div className="bg-card/50 border border-border rounded-xl p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Location Type
        </h3>
        
        {/* Dropdown */}
        <div className="relative mb-4">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
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
                  'w-full px-3 py-2 rounded-lg',
                  'bg-input-background border border-border',
                  'text-sm placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring',
                  !isEditMode && 'opacity-60 cursor-default'
                )}
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
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
                  'w-full px-3 py-2 rounded-lg',
                  'bg-input-background border border-border',
                  'text-sm placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring',
                  !isEditMode && 'opacity-60 cursor-default'
                )}
              />
            </div>
          </div>
        )}

        {measurementType === 'mirror_door' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
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
                  'w-full px-3 py-2 rounded-lg',
                  'bg-input-background border border-border',
                  'text-sm placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring',
                  !isEditMode && 'opacity-60 cursor-default'
                )}
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
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
                  'w-full px-3 py-2 rounded-lg',
                  'bg-input-background border border-border',
                  'text-sm placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring',
                  !isEditMode && 'opacity-60 cursor-default'
                )}
              />
            </div>
          </div>
        )}

        {measurementType === 'wall' && (
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
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
              rows={3}
              placeholder="Enter wall details..."
              className={cn(
                'w-full px-3 py-2 rounded-lg resize-none',
                'bg-input-background border border-border',
                'text-sm placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                !isEditMode && 'opacity-60 cursor-default'
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
        title="Latest Install Photo"
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
    </div>
  );
}

// Photo Section Component
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
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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

  // Handle paste - only when this section's dropzone is focused
  const [isFocused, setIsFocused] = useState(false);
  
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

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isEditMode) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!isEditMode) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFileUpload(files);
    }
  };

  // Handle delete
  const handleDelete = async (photo: Photo) => {
    try {
      await deletePhoto.mutateAsync({
        photoId: photo.id,
        locationId: photo.location_id,
        storagePath: photo.storage_path,
        thumbnailPath: photo.thumbnail_path,
      });
      toast.success('Photo deleted');
    } catch (error) {
      toast.error('Failed to delete photo');
    }
  };

  return (
    <div className="bg-card/50 border border-border rounded-xl p-4">
      <h3 className="font-medium mb-3 flex items-center gap-2">
        <Camera className="h-4 w-4 text-primary" />
        {title}
      </h3>

      {/* Photo Grid */}
      {isLoading ? (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square">
              <img
                src={getStorageUrl(photo.thumbnail_path)}
                alt="Photo"
                className="w-full h-full object-cover rounded-lg"
              />
              {isEditMode && (
                <button
                  onClick={() => handleDelete(photo)}
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
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onMouseEnter={() => setIsFocused(true)}
          onMouseLeave={() => setIsFocused(false)}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className={cn(
            'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors mb-4',
            isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          )}
          tabIndex={0}
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
                e.target.value = ''; // Reset input so same file can be selected again
              }
            }}
            className="hidden"
          />
          <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click to upload, drag & drop, or paste screenshot
          </p>
          {uploadPhoto.isPending && (
            <p className="text-xs text-primary mt-1">Uploading...</p>
          )}
        </div>
      )}

      {/* Date Field */}
      <div>
        <label className="block text-sm text-muted-foreground mb-1">
          {dateLabel}
        </label>
        <input
          type="text"
          value={dateValue}
          onChange={(e) => onDateChange(e.target.value)}
          disabled={!isEditMode}
          placeholder="e.g. 2024-01-15 or Jan 15, 2024"
          className={cn(
            'w-full px-3 py-2 rounded-lg',
            'bg-input-background border border-border',
            'text-sm placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            !isEditMode && 'opacity-60 cursor-default'
          )}
        />
      </div>
    </div>
  );
}
