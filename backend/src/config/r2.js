/**
 * Cloudflare R2 Configuration
 * R2 is S3-compatible, using AWS SDK v3
 */

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

// R2 Configuration from environment variables
const r2Config = {
  region: process.env.R2_REGION || 'auto',
  accountId: process.env.R2_ACCOUNT_ID || null,
  endpoint: process.env.R2_ENDPOINT || null, // Optional: custom endpoint
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || null,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || null,
  },
  bucket: process.env.R2_BUCKET_NAME || 'kai-finder',
  publicUrl: process.env.R2_PUBLIC_URL || null, // Custom domain URL if set
};

// Check if R2 is properly configured
const isR2Configured = () => {
  return !!(
    r2Config.credentials.accessKeyId &&
    r2Config.credentials.secretAccessKey &&
    r2Config.bucket
  );
};

// Create R2 client only if configured
const getR2Client = () => {
  if (!isR2Configured()) {
    return null;
  }

  const clientConfig = {
    region: r2Config.region,
    credentials: r2Config.credentials,
    // R2 requires path-style addressing
    forcePathStyle: true,
  };

  // Use custom endpoint if provided, otherwise use R2.dev format
  if (r2Config.endpoint) {
    clientConfig.endpoint = r2Config.endpoint;
  } else if (r2Config.accountId) {
    clientConfig.endpoint = `https://${r2Config.accountId}.r2.cloudflarestorage.com`;
  }

  return new S3Client(clientConfig);
};

let r2Client = null;
const getClient = () => {
  if (!r2Client) {
    r2Client = getR2Client();
  }
  return r2Client;
};

/**
 * Generate public URL for uploaded file
 */
const getPublicUrl = (key) => {
  // Use custom public URL if configured
  if (r2Config.publicUrl) {
    return `${r2Config.publicUrl}/${key}`;
  }

  // Use R2.dev subdomain format with account ID
  if (r2Config.accountId) {
    return `https://${r2Config.bucket}.${r2Config.accountId}.r2.dev/${key}`;
  }

  // Fallback to endpoint-based URL
  if (r2Config.endpoint) {
    return `${r2Config.endpoint}/${r2Config.bucket}/${key}`;
  }

  // Last resort - return key only
  return `/${key}`;
};

/**
 * Upload file to R2
 * @param {Object} file - File object (from multer memoryStorage)
 * @param {string} folder - Folder path (e.g., 'barang', 'klaim')
 * @returns {Object} Result with success status, url, etc.
 */
const uploadToR2 = async (file, folder = 'uploads') => {
  try {
    const client = getClient();

    // Fallback to local storage if R2 not configured
    if (!client) {
      console.log('R2 not configured, using local storage fallback');
      return uploadToLocal(file, folder);
    }

    // Generate unique filename
    const ext = file.originalname.split('.').pop() || 'jpg';
    const filename = `${uuidv4()}.${ext}`;
    const key = `${folder}/${filename}`;

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: r2Config.bucket,
      Key: key,
      Body: file.buffer, // Use buffer from memoryStorage
      ContentType: file.mimetype,
      // Cache headers for CDN
      CacheControl: 'public, max-age=31536000',
      Metadata: {
        'original-name': file.originalname,
        'uploaded-at': new Date().toISOString(),
      },
    });

    await client.send(command);

    const url = getPublicUrl(key);

    return {
      success: true,
      url,
      key,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  } catch (error) {
    console.error('R2 upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete file from R2
 * @param {string} key - File key/path in R2 bucket
 * @returns {Object} Result with success status
 */
const deleteFromR2 = async (key) => {
  try {
    const client = getClient();

    if (!client) {
      return { success: true }; // Nothing to delete
    }

    const command = new DeleteObjectCommand({
      Bucket: r2Config.bucket,
      Key: key,
    });

    await client.send(command);

    return { success: true };
  } catch (error) {
    console.error('R2 delete error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Generate signed URL for private files
 * @param {string} key - File key
 * @param {number} expiresIn - Expiration time in seconds
 * @returns {string} Signed URL
 */
const getSignedUrlR2 = async (key, expiresIn = 3600) => {
  try {
    const client = getClient();

    if (!client) {
      throw new Error('R2 not configured');
    }

    const command = new GetObjectCommand({
      Bucket: r2Config.bucket,
      Key: key,
    });

    const url = await getSignedUrl(client, command, { expiresIn });
    return { success: true, url };
  } catch (error) {
    console.error('R2 signed URL error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fallback: Upload to local storage
 */
const uploadToLocal = async (file, folder = 'uploads') => {
  try {
    const fs = require('fs');
    const path = require('path');

    const uploadDir = path.join(__dirname, '../../uploads', folder);

    // Create directory if not exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = file.originalname.split('.').pop() || 'jpg';
    const filename = `${uuidv4()}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Write file
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
  uploadToR2,
  deleteFromR2,
  getSignedUrl: getSignedUrlR2,
  isR2Configured,
  getR2Client: getClient,
  getPublicUrl,
};
