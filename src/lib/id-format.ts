/**
 * ID Formatting Utilities
 * 
 * Converts long UUIDs and technical IDs into user-friendly formats
 * for display in the admin dashboard.
 */

/**
 * Truncate a UUID to a short display format
 * Example: "8a4b2c1d-e5f6-..." -> "8a4b2c1d"
 */
export const truncateId = (id: string, length: number = 8): string => {
  if (!id) return 'N/A';
  return id.slice(0, length).toUpperCase();
};

/**
 * Format a user ID for display
 * Example: "abc123def456..." -> "USR-ABC123DE"
 */
export const formatUserId = (id: string): string => {
  if (!id) return 'N/A';
  return `USR-${id.slice(0, 8).toUpperCase()}`;
};

/**
 * Format a machine ID for display
 * If it's already a readable tag like "VM001", return as-is
 * Otherwise truncate the UUID
 */
export const formatMachineId = (id: string, machineTag?: string): string => {
  if (machineTag && machineTag !== 'N/A') return machineTag;
  if (!id) return 'N/A';
  // If it looks like a UUID (contains dashes or very long), truncate it
  if (id.includes('-') || id.length > 20) {
    return `MCH-${id.slice(0, 8).toUpperCase()}`;
  }
  return id;
};

/**
 * Format a product ID for display
 * Example: "prod_xyz123..." -> "PRD-XYZ12345"
 */
export const formatProductId = (id: string): string => {
  if (!id) return 'N/A';
  // If it's already short and readable, return as-is
  if (id.length <= 12) return id;
  // Remove prefix if exists
  const cleanId = id.replace(/^prod_/i, '');
  return `PRD-${cleanId.slice(0, 8).toUpperCase()}`;
};

/**
 * Format a feedback ID for display
 * Example: "abc123..." -> "FDB-ABC12345"
 */
export const formatFeedbackId = (id: string): string => {
  if (!id) return 'N/A';
  return `FDB-${id.slice(0, 8).toUpperCase()}`;
};

/**
 * Format an order reference
 * Returns existing order_reference or generates one from the order ID
 */
export const formatOrderRef = (orderId: string, orderReference?: string): string => {
  if (orderReference) return orderReference;
  if (!orderId) return 'N/A';
  return `ORD-${orderId.slice(0, 8).toUpperCase()}`;
};

/**
 * Check if a string looks like a UUID
 */
export const isUUID = (str: string): boolean => {
  if (!str) return false;
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(str);
};

/**
 * Format any ID intelligently based on its format
 */
export const formatId = (id: string, prefix?: string): string => {
  if (!id) return 'N/A';
  
  // If it's short and readable, return as-is
  if (id.length <= 12 && !isUUID(id)) return id;
  
  // If prefix provided, use it
  if (prefix) {
    return `${prefix}-${id.slice(0, 8).toUpperCase()}`;
  }
  
  // Default: just truncate
  return id.slice(0, 8).toUpperCase();
};
