export const formatPhoneForDisplay = (phone: string) => {
  if (!phone) return "";
  if (phone.startsWith("+91 ")) return phone;
  if (phone.startsWith("+91")) return `+91 ${phone.slice(3)}`;
  return `+91 ${phone}`;
};

export const formatPhoneForApi = (phone: string) => {
  if (!phone) return "";
  const cleaned = phone.replace(/\s/g, "");
  if (cleaned.startsWith("+91")) return cleaned;
  return `+91${cleaned}`;
};

export const ensurePhoneHasPlusPrefix = (phone: string | null | undefined): string => {
  if (!phone) return "";
  if (phone.startsWith("+")) return phone;
  return `+${phone}`;
};

