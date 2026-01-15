import { MapPin, ChevronRight, Ruler, FileText, Calendar } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { useLocations, useStoreLocationData } from '@/hooks';
import type { Store, LocationData } from '@/types';

interface LocationListProps {
  store: Store;
  selectedLocationId: string | null;
  onSelectLocation: (locationId: string) => void;
  isEditMode: boolean;
}

export function LocationList({
  store,
  selectedLocationId,
  onSelectLocation,
  isEditMode,
}: LocationListProps) {
  const { data: locations = [], isLoading: locationsLoading } = useLocations(store.id);
  const { data: locationDataList = [] } = useStoreLocationData(store.id);

  // Create a map of location data by location ID
  const locationDataMap = new Map<string, LocationData>();
  locationDataList.forEach((ld) => {
    locationDataMap.set(ld.location_id, ld);
  });

  if (locationsLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <MapPin className="h-12 w-12 mb-4 opacity-30" />
        <h3 className="text-lg font-medium mb-2">No Locations</h3>
        <p className="text-sm text-center max-w-xs">
          {isEditMode
            ? 'Go to the Floor Plan tab to add location markers'
            : 'No locations have been added yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {locations.map((location) => {
        const locationData = locationDataMap.get(location.id);
        const hasMeasurements = !!locationData?.measurements;
        const hasAudit = !!locationData?.last_audit_date;

        return (
          <button
            key={location.id}
            onClick={() => onSelectLocation(location.id)}
            className={cn(
              'w-full text-left p-4 rounded-xl transition-colors',
              'bg-card/50 border border-border',
              'hover:bg-card hover:border-primary/50',
              selectedLocationId === location.id && 'bg-card border-primary'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'p-2 rounded-lg',
                    hasMeasurements
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">{location.name}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {hasMeasurements && (
                      <span className="flex items-center gap-1">
                        <Ruler className="h-3 w-3" />
                        {locationData?.measurement_type === 'mirror_door'
                          ? 'Mirror Door'
                          : 'Column'}
                      </span>
                    )}
                    {hasAudit && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Audited {formatDate(locationData?.last_audit_date)}
                      </span>
                    )}
                    {locationData?.notes && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Has notes
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
