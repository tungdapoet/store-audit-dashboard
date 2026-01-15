// ============================================
// Stores Hook - CRUD operations for stores
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { QUERY_STALE_TIME } from '@/lib/constants';
import type { Store, StoreFormData } from '@/types';

const STORES_KEY = ['stores'];

/**
 * Fetch all stores
 */
export function useStores() {
  return useQuery({
    queryKey: STORES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Store[];
    },
    staleTime: QUERY_STALE_TIME,
  });
}

/**
 * Fetch a single store by ID
 */
export function useStore(storeId: string | null) {
  return useQuery({
    queryKey: ['store', storeId],
    queryFn: async () => {
      if (!storeId) return null;

      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single();

      if (error) throw error;
      return data as Store;
    },
    enabled: !!storeId,
    staleTime: QUERY_STALE_TIME,
  });
}

/**
 * Create a new store
 */
export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StoreFormData) => {
      const { data: store, error } = await supabase
        .from('stores')
        .insert({
          ...data,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return store as Store;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORES_KEY });
    },
  });
}

/**
 * Update a store
 */
export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Store> & { id: string; editedBy?: string }) => {
      const updateData: Partial<Store> = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      if (data.editedBy) {
        updateData.last_edited_by = data.editedBy;
      }

      const { data: store, error } = await supabase
        .from('stores')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return store as Store;
    },
    onSuccess: (store) => {
      queryClient.invalidateQueries({ queryKey: STORES_KEY });
      queryClient.invalidateQueries({ queryKey: ['store', store.id] });
    },
  });
}

/**
 * Delete a store
 */
export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storeId: string) => {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORES_KEY });
    },
  });
}

/**
 * Check for conflicts before saving
 */
export function useCheckStoreConflict() {
  return useMutation({
    mutationFn: async ({
      storeId,
      lastKnownUpdate,
    }: {
      storeId: string;
      lastKnownUpdate: string;
    }) => {
      const { data, error } = await supabase
        .from('stores')
        .select('updated_at, last_edited_by')
        .eq('id', storeId)
        .single();

      if (error) throw error;

      const hasConflict = data.updated_at !== lastKnownUpdate;
      return {
        hasConflict,
        lastEditedBy: data.last_edited_by,
        updatedAt: data.updated_at,
      };
    },
  });
}
