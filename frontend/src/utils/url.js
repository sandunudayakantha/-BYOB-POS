/**
 * Sanitizes URLs to prevent Cross-Site Scripting (XSS) via javascript:, data:, or vbscript: links.
 * Returns the URL if it begins with http://, https://, or /, otherwise returns '#'.
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:')
  ) {
    return '#';
  }
  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('/')
  ) {
    return trimmed;
  }
  return '#';
}
