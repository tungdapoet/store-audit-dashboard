// ============================================
// Location Data Hook - CRUD operations for measurements
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { QUERY_STALE_TIME } from '@/lib/constants';
import type { LocationData, MeasurementFormData } from '@/types';

/**
 * Fetch location data for a specific location
 */
export function useLocationData(locationId: string | null) {
  return useQuery({
    queryKey: ['location-data', locationId],
    queryFn: async () => {
      if (!locationId) return null;

      const { data, error } = await supabase
        .from('location_data')
        .select('*')
        .eq('location_id', locationId)
        .maybeSingle();

      if (error) throw error;
      return data as LocationData | null;
    },
    enabled: !!locationId,
    staleTime: QUERY_STALE_TIME,
  });
}

/**
 * Fetch all location data for a store (via locations)
 */
export function useStoreLocationData(storeId: string | null) {
  return useQuery({
    queryKey: ['store-location-data', storeId],
    queryFn: async () => {
      if (!storeId) return [];

      // First get all location IDs for this store
      const { data: locations, error: locError } = await supabase
        .from('locations')
        .select('id')
        .eq('store_id', storeId);

      if (locError) throw locError;
      if (!locations?.length) return [];

      const locationIds = locations.map((l) => l.id);

      // Then get all location data
      const { data, error } = await supabase
        .from('location_data')
        .select('*')
        .in('location_id', locationIds);

      if (error) throw error;
      return data as LocationData[];
    },
    enabled: !!storeId,
    staleTime: QUERY_STALE_TIME,
  });
}

/**
 * Create or update location data (upsert)
 */
export function useUpsertLocationData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      locationId,
      editedBy,
      ...data
    }: MeasurementFormData & { locationId: string; editedBy?: string }) => {
      // Check if exists
      const { data: existing } = await supabase
        .from('location_data')
        .select('id')
        .eq('location_id', locationId)
        .maybeSingle();

      const payload = {
        location_id: locationId,
        ...data,
        last_edited_by: editedBy || null,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (existing) {
        // Update
        result = await supabase
          .from('location_data')
          .update(payload)
          .eq('location_id', locationId)
          .select()
          .single();
      } else {
        // Insert
        result = await supabase
          .from('location_data')
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) throw result.error;
      return result.data as LocationData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['location-data', data.location_id],
      });
      // Also invalidate store-level data
      queryClient.invalidateQueries({
        queryKey: ['store-location-data'],
      });
    },
  });
}

/**
 * Delete location data
 */
export function useDeleteLocationData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (locationId: string) => {
      const { error } = await supabase
        .from('location_data')
        .delete()
        .eq('location_id', locationId);

      if (error) throw error;
      return { locationId };
    },
    onSuccess: ({ locationId }) => {
      queryClient.invalidateQueries({
        queryKey: ['location-data', locationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['store-location-data'],
      });
    },
  });
}
