// ============================================
// Photos Hook - CRUD operations for photos
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, uploadToStorage, deleteFromStorage } from '@/lib/supabase';
import { processImage } from '@/lib/image-processing';
import { generateId } from '@/lib/utils';
import { QUERY_STALE_TIME } from '@/lib/constants';
import type { Photo, PhotoType } from '@/types';

/**
 * Fetch all photos for a location
 */
export function usePhotos(locationId: string | null) {
  return useQuery({
    queryKey: ['photos', locationId],
    queryFn: async () => {
      if (!locationId) return [];

      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('location_id', locationId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data as Photo[];
    },
    enabled: !!locationId,
    staleTime: QUERY_STALE_TIME,
  });
}

/**
 * Fetch photos by type for a location
 */
export function usePhotosByType(locationId: string | null, type: PhotoType) {
  return useQuery({
    queryKey: ['photos', locationId, type],
    queryFn: async () => {
      if (!locationId) return [];

      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('location_id', locationId)
        .eq('type', type)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data as Photo[];
    },
    enabled: !!locationId,
    staleTime: QUERY_STALE_TIME,
  });
}

/**
 * Upload a photo
 */
export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      locationId,
      storeId,
      type,
      uploadedBy,
    }: {
      file: File;
      locationId: string;
      storeId: string;
      type: PhotoType;
      uploadedBy?: string;
    }) => {
      // Process image (compress + thumbnail)
      const { full, thumbnail } = await processImage(file);

      const photoId = generateId();
      const basePath = `${storeId}/${locationId}/${type}`;
      const fullPath = `${basePath}/${photoId}.webp`;
      const thumbPath = `${basePath}/${photoId}_thumb.webp`;

      // Upload both images
      await Promise.all([
        uploadToStorage(fullPath, full),
        uploadToStorage(thumbPath, thumbnail),
      ]);

      // Create database record - store only paths, not full URLs
      const { data: photo, error } = await supabase
        .from('photos')
        .insert({
          id: photoId,
          location_id: locationId,
          type,
          storage_path: fullPath,
          thumbnail_path: thumbPath,
          uploaded_by: uploadedBy || null,
        })
        .select()
        .single();

      if (error) throw error;
      return photo as Photo;
    },
    onSuccess: (photo) => {
      queryClient.invalidateQueries({
        queryKey: ['photos', photo.location_id],
      });
    },
  });
}

/**
 * Delete a photo
 */
export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      photoId,
      locationId,
      storagePath,
      thumbnailPath,
    }: {
      photoId: string;
      locationId: string;
      storagePath: string;
      thumbnailPath: string;
    }) => {
      // Extract path from full URL if needed (handles both old and new formats)
      const extractPath = (pathOrUrl: string) => {
        if (pathOrUrl.startsWith('http')) {
          const match = pathOrUrl.match(/store-audit-photos\/(.+)$/);
          return match ? match[1] : pathOrUrl;
        }
        return pathOrUrl;
      };

      await Promise.all([
        deleteFromStorage(extractPath(storagePath)),
        deleteFromStorage(extractPath(thumbnailPath)),
      ]);

      // Delete database record
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
      return { locationId };
    },
    onSuccess: ({ locationId }) => {
      queryClient.invalidateQueries({
        queryKey: ['photos', locationId],
      });
    },
  });
}

/**
 * Upload multiple photos
 */
export function useUploadPhotos() {
  const uploadPhoto = useUploadPhoto();

  return useMutation({
    mutationFn: async ({
      files,
      locationId,
      storeId,
      type,
      uploadedBy,
    }: {
      files: File[];
      locationId: string;
      storeId: string;
      type: PhotoType;
      uploadedBy?: string;
    }) => {
      const results = await Promise.all(
        files.map((file) =>
          uploadPhoto.mutateAsync({
            file,
            locationId,
            storeId,
            type,
            uploadedBy,
          })
        )
      );
      return results;
    },
  });
}
