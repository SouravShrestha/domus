export const formatPhoneForDisplay = (phone: string) => {
  if (!phone) return "";
  if (phone.startsWith("+91")) return phone;
  return `+91 ${phone}`;
};

export const formatPhoneForApi = (phone: string) => {
  if (!phone) return "";
  if (phone.startsWith("+91")) return phone;
  return `+91${phone}`;
}