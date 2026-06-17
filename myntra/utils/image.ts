const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop";

// Map of known broken Unsplash photo IDs to working replacements
const BROKEN_IMAGE_FIXES: Record<string, string> = {
  "photo-1583391733956-6c78276477e1": "photo-1610030469983-98e550d6193c",
  "photo-1617917571552-20d2a25e5e19": "photo-1583743814966-8936f5b7be1a",
  "photo-1618244972963-dbad0c4abf18": "photo-1515372039744-b8f02a3ae446",
  "photo-1515886657613-9f3515b0c78f": "photo-1496747611176-843222e1e57c",
  "photo-1594938298603-c8148c4b4c0a": "photo-1509631179647-0177331693ae",
  "photo-1523381294911-8d3cead13475": "photo-1551488831-00ddcb6c6bd3",
  "photo-1627123424574-724758594913": "photo-1624222247344-550fb60583dc",
  "photo-1618354691373-d851c5c3a990": "photo-1556228578-0d85b1a4d571",
  "photo-1586495777744-4e6232bf2f31": "photo-1591561954557-26941169b49e",
  "photo-1596462502278-27bfdc403348": "photo-1556228578-0d85b1a4d571",
  "photo-1606503153255-59d8b2e4b0a4": "photo-1624222247344-550fb60583dc",
  "photo-1512532939431-4c9a7b9a2a74": "photo-1556228578-0d85b1a4d571",
  "photo-1631214540553-ff044a3ff1ea": "photo-1591561954557-26941169b49e",
  "photo-1522335789203-aabd1fc54bc9": "photo-1556228578-0d85b1a4d571",
};

/**
 * Resolves a given image URI, falling back to a default placeholder
 * if the URI is invalid, empty, or a dummy URL (e.g. example.com).
 * Also fixes known broken Unsplash URLs.
 */
export function resolveImageUri(uri?: string): string {
  if (!uri || typeof uri !== "string") {
    return PLACEHOLDER_IMAGE;
  }
  let trimmed = uri.trim();
  if (
    trimmed === "" ||
    trimmed.includes("example.com") ||
    trimmed.includes("placeholder")
  ) {
    return PLACEHOLDER_IMAGE;
  }

  // Fix known broken Unsplash URLs
  for (const [broken, fixed] of Object.entries(BROKEN_IMAGE_FIXES)) {
    if (trimmed.includes(broken)) {
      trimmed = trimmed.replace(broken, fixed);
      break;
    }
  }

  return trimmed;
}
