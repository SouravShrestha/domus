export const formatPhoneForDisplay = (phone: string) => {
  if (!phone) return "";
  
  const cleaned = phone.replace(/\s/g, "");
  
  if (cleaned.startsWith("+91") && cleaned.length === 13) {
    return `+91 ${cleaned.slice(3)}`;
  }
  
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    return `+91 ${cleaned.slice(2)}`;
  }

  if (/^\d{10}$/.test(cleaned)) {
    return `+91 ${cleaned}`;
  }
  
  return phone;
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

