import { pb } from '../../lib/pocketbase';

export interface MediaFile {
  id: string;
  name: string;
  bucket_id?: string;
  bucket_name?: string;
  type: 'image' | 'video' | 'document' | 'audio' | 'other';
  format: string;
  size: number;
  sizeFormatted: string;
  url: string;
  publicUrl: string;
  metadata?: {
    width?: number;
    height?: number;
    mimetype?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
  file_count: number;
  total_size: number;
}

const FILE_FORMATS = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'ico', 'bmp', 'tiff'],
  video: ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'm4v'],
  document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf', 'odt', 'ods', 'odp'],
  audio: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'],
};

const VIDEO_MIME_FALLBACKS: Record<string, string> = {
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  mkv: 'video/x-matroska',
  flv: 'video/x-flv',
  wmv: 'video/x-ms-wmv',
  m4v: 'video/x-m4v',
};

function getFileType(filename: string): { type: MediaFile['type']; format: string } {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  for (const [type, formats] of Object.entries(FILE_FORMATS)) {
    if (formats.includes(ext)) {
      return { type: type as MediaFile['type'], format: ext.toUpperCase() };
    }
  }
  
  return { type: 'other', format: ext.toUpperCase() };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export async function getAllBuckets(): Promise<StorageBucket[]> {
  return [
    { id: 'media', name: 'media', public: true, file_count: 0, total_size: 0 },
    { id: 'website-assets', name: 'website-assets', public: true, file_count: 0, total_size: 0 },
    { id: 'popup-assets', name: 'popup-assets', public: true, file_count: 0, total_size: 0 },
    { id: 'blog-images', name: 'blog-images', public: true, file_count: 0, total_size: 0 },
    { id: 'web-offers', name: 'web-offers', public: true, file_count: 0, total_size: 0 },
  ];
}

export async function getAllFiles(bucketName?: string): Promise<MediaFile[]> {
  try {
    const tenantId = pb.authStore.model?.website_id || 'dktsle4yev6syo4';

    let filter = `website_id="${tenantId}"`;
    if (bucketName && bucketName !== 'all') {
      filter += ` && bucket_name = "${bucketName}"`;
    }

    console.log('Fetching media with filter:', filter);

    const records = await pb.collection('media').getFullList({
      filter: filter,
      $autoCancel: false, // <-- IMPORTANTE: Evita que se cancele si se llama a getStorageStats al mismo tiempo
    });
    
    return records.map(record => {
      const { type, format } = getFileType(record.file || '');
      return {
        id: record.id,
        name: record.name || record.file,
        bucket_id: record.bucket_name,
        bucket_name: record.bucket_name,
        type,
        format,
        size: record.size || 0,
        sizeFormatted: formatFileSize(record.size || 0),
        url: record.file,
        publicUrl: pb.files.getURL(record, record.file),
        metadata: {
          width: record.metadata?.width,
          height: record.metadata?.height,
          mimetype: record.mime_type || getMimeTypeForFormat(format.toLowerCase()),
        },
        created_at: record.created,
        updated_at: record.updated,
      };
    });
  } catch (err) {
    console.error('Error getting all files from PocketBase:', err);
    return [];
  }
}

function getMimeTypeForFormat(format: string): string {
  // Video formats
  if (['mp4', 'm4v'].includes(format)) return 'video/mp4';
  if (format === 'webm') return 'video/webm';
  if (format === 'ogg') return 'video/ogg';
  if (format === 'mov') return 'video/quicktime';
  if (format === 'avi') return 'video/x-msvideo';
  if (format === 'mkv') return 'video/x-matroska';
  
  // Audio formats
  if (format === 'mp3') return 'audio/mpeg';
  if (format === 'wav') return 'audio/wav';
  if (format === 'flac') return 'audio/flac';
  if (format === 'aac') return 'audio/aac';
  
  // Image formats
  if (format === 'jpg' || format === 'jpeg') return 'image/jpeg';
  if (format === 'png') return 'image/png';
  if (format === 'gif') return 'image/gif';
  if (format === 'webp') return 'image/webp';
  if (format === 'svg') return 'image/svg+xml';
  
  // Default
  return 'application/octet-stream';
}

export async function deleteFile(bucketName: string, id: string): Promise<boolean> {
  try {
    await pb.collection('media').delete(id);
    return true;
  } catch (err) {
    console.error('Error deleting file from PocketBase:', err);
    return false;
  }
}

export async function getStorageStats(): Promise<{
  totalFiles: number;
  totalSize: number;
  sizeFormatted: string;
  byType: Record<string, number>;
  byBucket: Record<string, number>;
}> {
  const files = await getAllFiles();
  
  let totalSize = 0;
  const byType: Record<string, number> = {};
  const byBucket: Record<string, number> = {};
  
  files.forEach(file => {
    totalSize += file.size;
    byType[file.type] = (byType[file.type] || 0) + 1;
    if (file.bucket_name) {
      byBucket[file.bucket_name] = (byBucket[file.bucket_name] || 0) + 1;
    }
  });
  
  return {
    totalFiles: files.length,
    totalSize,
    sizeFormatted: formatFileSize(totalSize),
    byType,
    byBucket,
  };
}

export function isVideoMimeType(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export async function uploadFiles(files: FileList | File[], bucketName: string = 'website-assets'): Promise<boolean> {
  try {
    const tenantId = pb.authStore.model?.website_id || 'dktsle4yev6syo4';

    for (const file of Array.from(files)) {
      const { type, format } = getFileType(file.name);
      
      let normalizedMime = file.type;
      if (!normalizedMime || normalizedMime === 'application/octet-stream') {
        if (type === 'video') {
          if (format.toLowerCase() === 'mov') {
            normalizedMime = 'video/quicktime';
          } else {
            normalizedMime = VIDEO_MIME_FALLBACKS[format.toLowerCase()] || 'video/mp4';
          }
        } else if (type === 'image') {
          normalizedMime = getMimeTypeForFormat(format.toLowerCase());
        } else if (type === 'audio') {
          normalizedMime = `audio/${format.toLowerCase()}`;
        } else {
          normalizedMime = 'application/octet-stream';
        }
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      if (pb.authStore.isValid && tenantId) {
        formData.append('website_id', tenantId);
      }
      formData.append('name', file.name);
      formData.append('bucket_name', bucketName);
      formData.append('type', type);
      formData.append('format', format.toUpperCase());
      formData.append('mime_type', normalizedMime);
      formData.append('size', file.size.toString());
      
      try {
        await pb.collection('media').create(formData);
      } catch (err: any) {
        console.error(`Upload error for ${file.name}:`, err.response?.data || err);
        const serverMsg = err.response?.data?.message || err.message || '';
        throw new Error(`Błąd upload ${file.name}: ${serverMsg}`);
      }
    }
    return true;
  } catch (err) {
    console.error('Error uploading files to PocketBase:', err);
    throw err;
  }
}
