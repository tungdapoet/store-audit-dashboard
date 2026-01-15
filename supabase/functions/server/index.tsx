import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Add request logging
app.use('*', logger(console.log));

// Enable CORS for all routes
app.use("*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: false,
}));

// Middleware to wrap all responses and catch broken pipe errors
app.use("*", async (c, next) => {
  try {
    await next();
  } catch (error) {
    // Catch broken pipe errors (client disconnected)
    if (error?.code === 'EPIPE' || error?.name === 'Http' || error?.message?.includes('connection closed')) {
      console.log('⚠️ Client disconnected before response could be sent (connection closed)');
      // Don't try to send a response - connection is already closed
      return;
    }
    // Re-throw other errors to be handled by global error handler
    throw error;
  }
});

// Helper function to add timeout to promises
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 30000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};

// Helper function to safely send response (handles disconnected clients)
const safeSend = async (c: any, responseData: any, statusCode: number = 200) => {
  try {
    return c.json(responseData, statusCode);
  } catch (error) {
    // Client disconnected - log and ignore
    if (error?.name === 'Http' || error?.message?.includes('connection closed')) {
      console.log('⚠️ Cannot send response - client already disconnected');
      return;
    }
    throw error;
  }
};

// Initialize Supabase Storage bucket for photos
const initializeStorage = async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const bucketName = 'make-38786645-store-photos';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, { public: false });
      console.log(`Created storage bucket: ${bucketName}`);
    } else {
      console.log(`Storage bucket already exists: ${bucketName}`);
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Initialize storage on startup (don't block)
initializeStorage();

// Health check endpoint
app.get("/make-server-38786645/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Root endpoint
app.get("/", (c) => {
  return c.json({ message: "Store Audit API", version: "1.0.0" });
});

// DEBUG: List all keys in KV store
app.get("/make-server-38786645/debug/keys", async (c) => {
  try {
    const locationKeys = await withTimeout(kv.getByPrefix('locations_'), 3000);
    const locationDataKeys = await withTimeout(kv.getByPrefix('locationData_'), 3000);
    
    return c.json({ 
      message: 'Debug info',
      locationKeysCount: locationKeys.length,
      locationDataKeysCount: locationDataKeys.length,
    });
  } catch (error) {
    console.error('Error fetching debug keys:', error);
    return c.json({ error: 'Failed to fetch debug keys', details: String(error) }, 500);
  }
});

// ============= STORES API =============

// Get all stores
app.get("/make-server-38786645/stores", async (c) => {
  console.log('📥 GET /stores - Starting');
  try {
    const stores = await withTimeout(kv.get('stores'), 5000); // Increased from 2s to 5s for 43 stores
    console.log('✅ GET /stores - Success:', stores?.length || 0, 'stores');
    return c.json({ stores: stores || [] });
  } catch (error) {
    console.error('❌ GET /stores - Error:', error);
    // Return empty array on error so client can use localStorage fallback
    return c.json({ stores: [] }, 200);
  }
});

// Create or update stores
app.post("/make-server-38786645/stores", async (c) => {
  console.log('📥 POST /stores - Starting');
  try {
    const body = await withTimeout(c.req.json(), 5000); // Increased from 2s to 5s for large payload
    
    if (!body || !body.stores) {
      console.log('❌ POST /stores - Invalid body');
      return c.json({ error: 'Invalid request body: stores array required' }, 400);
    }
    
    console.log('💾 POST /stores - Saving', body.stores.length, 'stores');
    await withTimeout(kv.set('stores', body.stores), 25000); // Increased from 8s to 25s for 43 stores
    console.log('✅ POST /stores - Success');
    return c.json({ success: true, stores: body.stores });
  } catch (error) {
    console.error('❌ POST /stores - Error:', error);
    return c.json({ error: 'Failed to save stores', details: String(error) }, 500);
  }
});

// ============= FLOOR PLAN LOCATIONS API =============

// Get floor plan locations for a store
app.get("/make-server-38786645/locations/:storeId", async (c) => {
  const storeId = c.req.param('storeId');
  console.log('📥 GET /locations -', storeId, '- Starting');
  try {
    const key = `locations_${storeId}`;
    const locations = await withTimeout(kv.get(key), 3000); // Reduced from 5s to 3s
    console.log('✅ GET /locations -', storeId, '- Success:', locations?.length || 0, 'locations');
    return c.json({ locations: locations || [] });
  } catch (error) {
    console.error('❌ GET /locations -', storeId, '- Error:', error);
    // Always return a valid response, even on error
    return c.json({ locations: [] }, 200);
  }
});

// Save floor plan locations for a store
app.post("/make-server-38786645/locations/:storeId", async (c) => {
  const storeId = c.req.param('storeId');
  console.log('📥 POST /locations -', storeId, '- Starting');
  try {
    const body = await withTimeout(c.req.json(), 2000);
    
    if (!body || !body.locations) {
      console.log('❌ POST /locations -', storeId, '- Invalid body');
      return c.json({ error: 'Invalid request body: locations array required' }, 400);
    }
    
    console.log('💾 POST /locations -', storeId, '- Saving', body.locations.length, 'locations');
    const key = `locations_${storeId}`;
    await withTimeout(kv.set(key, body.locations), 2500); // Reduced from 3s to 2.5s
    console.log('✅ POST /locations -', storeId, '- Success');
    return c.json({ success: true, locations: body.locations });
  } catch (error) {
    console.error('❌ POST /locations -', storeId, '- Error:', error);
    return c.json({ error: 'Failed to save locations', details: String(error) }, 500);
  }
});

// ============= LOCATION DATA API =============

// Get location data for a store
app.get("/make-server-38786645/location-data/:storeId", async (c) => {
  const storeId = c.req.param('storeId');
  console.log('📥 GET /location-data -', storeId, '- Starting');
  try {
    const key = `locationData_${storeId}`;
    const locationData = await withTimeout(kv.get(key), 3000); // Reduced from 5s to 3s
    console.log('✅ GET /location-data -', storeId, '- Success:', locationData?.length || 0, 'entries');
    return c.json({ locationData: locationData || [] });
  } catch (error) {
    console.error('❌ GET /location-data -', storeId, '- Error:', error);
    // Always return a valid response, even on error
    return c.json({ locationData: [] }, 200);
  }
});

// Save location data for a store
app.post("/make-server-38786645/location-data/:storeId", async (c) => {
  const storeId = c.req.param('storeId');
  console.log('📥 POST /location-data -', storeId, '- Starting');
  try {
    const body = await withTimeout(c.req.json(), 5000); // Increased from 2s to 5s for larger payloads
    
    if (!body || !body.locationData) {
      console.log('❌ POST /location-data -', storeId, '- Invalid body');
      return c.json({ error: 'Invalid request body: locationData array required' }, 400);
    }
    
    console.log('💾 POST /location-data -', storeId, '- Saving', body.locationData.length, 'entries');
    const key = `locationData_${storeId}`;
    await withTimeout(kv.set(key, body.locationData), 20000); // Increased from 3s to 20s - location data can be large
    console.log('✅ POST /location-data -', storeId, '- Success');
    return c.json({ success: true, locationData: body.locationData });
  } catch (error) {
    console.error('❌ POST /location-data -', storeId, '- Error:', error);
    return c.json({ error: 'Failed to save location data', details: String(error) }, 500);
  }
});

// ============= PHOTO UPLOAD API =============

// Upload photo to Supabase Storage
app.post("/make-server-38786645/upload-photo", async (c) => {
  try {
    const body = await c.req.json();
    
    if (!body || !body.photoData || !body.fileName) {
      return c.json({ error: 'Photo data and filename required' }, 400);
    }
    
    const { photoData, fileName } = body;
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const bucketName = 'make-38786645-store-photos';
    
    // Convert base64 to binary
    const base64Data = photoData.split(',')[1] || photoData;
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Upload to storage
    const filePath = `${Date.now()}_${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, binaryData, {
        contentType: 'image/jpeg',
        upsert: false,
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: `Failed to upload photo: ${uploadError.message}` }, 500);
    }
    
    // Get signed URL (valid for 10 years)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 315360000); // 10 years in seconds
    
    if (urlError) {
      console.error('Error creating signed URL:', urlError);
      return c.json({ error: `Failed to create signed URL: ${urlError.message}` }, 500);
    }
    
    return c.json({ success: true, url: urlData?.signedUrl });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return c.json({ error: 'Failed to upload photo', details: String(error) }, 500);
  }
});

// ============= DELETE STORE DATA API =============

// Delete all location data for a store
app.delete("/make-server-38786645/store-data/:storeId", async (c) => {
  const storeId = c.req.param('storeId');
  console.log('📥 DELETE /store-data -', storeId, '- Starting');
  
  try {
    // Delete floor plan locations
    const locationsKey = `locations_${storeId}`;
    await withTimeout(kv.del(locationsKey), 3000);
    
    // Delete location data
    const locationDataKey = `locationData_${storeId}`;
    await withTimeout(kv.del(locationDataKey), 3000);
    
    console.log('✅ DELETE /store-data -', storeId, '- Success');
    return c.json({ success: true, message: 'Store data deleted' });
  } catch (error) {
    console.error('❌ DELETE /store-data -', storeId, '- Error:', error);
    return c.json({ error: 'Failed to delete store data', details: String(error) }, 500);
  }
});

// 404 handler for unmatched routes
app.notFound((c) => {
  return c.json({ error: 'Route not found', path: c.req.path }, 404);
});

// Global error handler
app.onError((err, c) => {
  // Ignore connection closed errors - client already disconnected
  if (err?.name === 'Http' || err?.message?.includes('connection closed')) {
    console.log('⚠️ Connection closed error caught in global handler');
    return new Response(null, { status: 499 }); // Client Closed Request
  }
  
  console.error('Global error:', err);
  
  try {
    return c.json({ error: 'Internal server error', details: String(err) }, 500);
  } catch {
    // If we can't even send JSON, just return a basic response
    return new Response('Internal server error', { status: 500 });
  }
});

// Start server - simplified to let Hono handle everything
Deno.serve(app.fetch);