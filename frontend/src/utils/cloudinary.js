/**
 * Utility to optimize Cloudinary images on the fly.
 * Injects transformation parameters like w_auto, q_auto, f_auto into the URL.
 * 
 * @param {string} url - Original Cloudinary Image URL
 * @param {number} width - Target width (default 400 for thumbnails)
 * @returns {string} - Optimized URL
 */
export const optimizeImage = (url, width = 400) => {
  if (!url) return '';
  
  // Only optimize if it's a Cloudinary URL
  if (!url.includes('res.cloudinary.com')) {
    return url;
  }

  // If already optimized, don't modify (e.g. contains /upload/w_, /upload/f_auto)
  if (url.match(/\/upload\/(?:[a-z]_[^/]+,)*[a-z]_[^/]+/)) {
    return url;
  }

  const transformation = `w_${width},f_auto,q_auto`;
  return url.replace('/upload/', `/upload/${transformation}/`);
};
