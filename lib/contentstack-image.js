/**
 * Contentstack image URLs accept query parameters for resizing.
 * @param {string} url — Base asset URL from Contentstack (`cover.url`, etc.)
 * @param {number} [width=800]
 * @returns {string | null}
 */
export function contentstackImageSrc(url, width = 800) {
  if (!url || typeof url !== "string") return null;
  try {
    const u = new URL(url);
    u.searchParams.set("width", String(width));
    return u.toString();
  } catch {
    return url;
  }
}
