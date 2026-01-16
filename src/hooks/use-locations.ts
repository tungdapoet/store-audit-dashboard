// ============================================
// Locations Hook - CRUD operations for floor plan markers
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { QUERY_STALE_TIME } from '@/lib/constants';
import type { Location, LocationFormData } from '@/types';

/**
 * Fetch all locations for a store
 */
export function useLocations(storeId: string | null) {
  return useQuery({
    queryKey: ['locations', storeId],
    queryFn: async () => {
      if (!storeId) return [];

      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('store_id', storeId)
        .order('name');

      if (error) throw error;
      return data as Location[];
    },
    enabled: !!storeId,
    staleTime: QUERY_STALE_TIME,
  });
}

/**
 * Create a new location
 */
export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      storeId,
      ...data
    }: LocationFormData & { storeId: string }) => {
      const { data: location, error } = await supabase
        .from('locations')
        .insert({
          store_id: storeId,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return location as Location;
    },
    onSuccess: (location) => {
      queryClient.invalidateQueries({
        queryKey: ['locations', location.store_id],
      });
    },
  });
}

/**
 * Update a location (with optimistic updates for smooth drag)
 */
export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      storeId,
      ...data
    }: Partial<Location> & { id: string; storeId: string }) => {
      const { data: location, error } = await supabase
        .from('locations')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { location: location as Location, storeId };
    },
    // Optimistic update - immediately update cache before server response
    onMutate: async ({ id, storeId, ...data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['locations', storeId] });

      // Snapshot the previous value
      const previousLocations = queryClient.getQueryData<Location[]>(['locations', storeId]);

      // Optimistically update to the new value
      if (previousLocations) {
        queryClient.setQueryData<Location[]>(
          ['locations', storeId],
          previousLocations.map(loc =>
            loc.id === id ? { ...loc, ...data } : loc
          )
        );
      }

      // Return context with the previous value
      return { previousLocations, storeId };
    },
    // If the mutation fails, use the context to roll back
    onError: (_err, _variables, context) => {
      if (context?.previousLocations) {
        queryClient.setQueryData(['locations', context.storeId], context.previousLocations);
      }
    },
    // Always refetch after error or success
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['locations', variables.storeId] });
    },
  });
}

/**
 * Delete a location
 */
export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      locationId,
      storeId,
    }: {
      locationId: string;
      storeId: string;
    }) => {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId);

      if (error) throw error;
      return { storeId };
    },
    onSuccess: ({ storeId }) => {
      queryClient.invalidateQueries({ queryKey: ['locations', storeId] });
    },
  });
}

/**
 * Batch update location positions (for drag operations)
 */
export function useBatchUpdateLocations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      storeId,
      updates,
    }: {
      storeId: string;
      updates: Array<{ id: string; x: number; y: number }>;
    }) => {
      // Use Promise.all for batch updates
      const results = await Promise.all(
        updates.map(({ id, x, y }) =>
          supabase
            .from('locations')
            .update({ x, y, updated_at: new Date().toISOString() })
            .eq('id', id)
        )
      );

      // Check for any errors
      const error = results.find((r) => r.error)?.error;
      if (error) throw error;

      return { storeId };
    },
    onSuccess: ({ storeId }) => {
      queryClient.invalidateQueries({ queryKey: ['locations', storeId] });
    },
  });
}
