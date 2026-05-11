/**
 * Convert Google Drive URL to lh3.googleusercontent direct link
 * @param url Google Drive share or view URL
 * @returns File ID or null if not a valid Google Drive URL
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url) return null;

  // Match various Google Drive URL formats
  const patterns = [
    /[?&]id=([a-zA-Z0-9-_]+)/, // ?id=...
    /\/d\/([a-zA-Z0-9-_]+)/, // /d/...
    /\/d\/([a-zA-Z0-9-_]+)\//, // /d/.../
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Get proxied image URL for Google Drive files
 * @param url Original Google Drive URL
 * @returns Proxied image URL or original URL if not a Google Drive link
 */
export function getProxiedImageUrl(url: string): string {
  if (!url) return '';

  // If already using our proxy, return as-is
  if (url.includes('/api/image')) {
    return url;
  }

  // If not a Google Drive URL, return original
  if (!url.includes('drive.google.com') && !url.includes('drive.usercontent.com')) {
    return url;
  }

  // Extract file ID and create proxy URL
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    return `/api/image?id=${fileId}`;
  }

  return url;
}

/**
 * Get proxied download URL for Google Drive files
 * @param url Original Google Drive URL
 * @returns Proxied download URL or original URL if not a Google Drive link
 */
export function getProxiedDownloadUrl(url: string): string {
  if (!url) return '';

  // If not a Google Drive URL, return original
  if (!url.includes('drive.google.com') && !url.includes('drive.usercontent.com')) {
    return url;
  }

  // Extract file ID and create download proxy URL
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    return `/api/image?id=${fileId}`;
  }

  return url;
}
