export const formatPhoneForDisplay = (phone: string) => {
  if (!phone) return "";
  if (phone.startsWith("+91 ")) return phone;
  if (phone.startsWith("+91")) return `+91 ${phone.slice(3)}`;
  return `+91 ${phone}`;
};

export const formatPhoneForApi = (phone: string) => {
  if (!phone) return "";
  if (phone.startsWith("+91")) return phone;
  return `+91${phone}`;
};

/**
 * Ensures phone number has a "+" prefix if it doesn't already have one
 * @param phone - Phone number to normalize
 * @returns Phone number with "+" prefix, or empty string if phone is empty/null
 */
export const ensurePhoneHasPlusPrefix = (phone: string | null | undefined): string => {
  if (!phone) return "";
  if (phone.startsWith("+")) return phone;
  return `+${phone}`;
};