/**
 * Supabase Storage Configuration
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Create Supabase clients
let supabaseAdmin = null;

const getSupabaseAdmin = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  if (!supabaseAdmin) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdmin;
};

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseServiceKey);
};

/**
 * Upload file to Supabase Storage
 * @param {Object} file - File object with buffer, originalname, mimetype
 * @param {string} folder - Folder path in storage bucket
 * @returns {Object} Result with success status, url, etc.
 */
const uploadToSupabase = async (file, folder = 'barang') => {
  try {
    const client = getSupabaseAdmin();

    // Fallback to local storage if Supabase not configured
    if (!client) {
      console.log('Supabase not configured, using local storage fallback');
      return uploadToLocal(file, folder);
    }

    // Generate unique filename
    const ext = file.originalname.split('.').pop() || 'jpg';
    const filename = `${uuidv4()}.${ext}`;
    const filepath = `${folder}/${filename}`;

    // Upload to Supabase Storage
    const { data, error } = await client.storage
      .from('kai-finder')
      .upload(filepath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Get public URL
    const { data: urlData } = client.storage
      .from('kai-finder')
      .getPublicUrl(filepath);

    return {
      success: true,
      url: urlData.publicUrl,
      key: filepath,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  } catch (error) {
    console.error('Supabase upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete file from Supabase Storage
 * @param {string} key - File path/key in storage bucket
 * @returns {Object} Result with success status
 */
const deleteFromSupabase = async (key) => {
  try {
    const client = getSupabaseAdmin();

    if (!client) {
      return { success: true };
    }

    const { error } = await client.storage
      .from('kai-finder')
      .remove([key]);

    if (error) {
      console.error('Supabase delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Supabase delete error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fallback: Upload to local storage
 */
const uploadToLocal = async (file, folder = 'uploads') => {
  try {
    const uploadDir = path.join(__dirname, '../../uploads', folder);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = file.originalname.split('.').pop() || 'jpg';
    const filename = `${uuidv4()}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, file.buffer);

    const url = `/uploads/${folder}/${filename}`;

    return {
      success: true,
      url,
      key: `${folder}/${filename}`,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  } catch (error) {
    console.error('Local upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  uploadToSupabase,
  deleteFromSupabase,
  isSupabaseConfigured,
  getSupabaseAdmin,
};
