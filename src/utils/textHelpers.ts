import colorMapping from "@themes/colors";

export function sanitizeName(text: string): string {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trimStart();
}

export function capitalizeFirstLetterOfWords(text: string): string {
  if (!text) return "";
  return text.replace(/\b\w/g, (char: string) => char.toUpperCase());
}

export function formatPhoneNumber(
  phoneNumber: { countryCode: string; number: string } | null | undefined,
  fallback: string = ""
): string {
  if (!phoneNumber) return fallback;
  const { countryCode, number } = phoneNumber;
  if (!countryCode || !number) return fallback;
  return `${countryCode} ${number}`.trim();
}

export function formatFloorNumber(floor: number): string {
  if (floor === undefined || floor === null) return "";
  
  const lastDigit = floor % 10;
  const lastTwoDigits = floor % 100;
  
  let suffix = "th";
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    suffix = "th";
  } else if (lastDigit === 1) {
    suffix = "st";
  } else if (lastDigit === 2) {
    suffix = "nd";
  } else if (lastDigit === 3) {
    suffix = "rd";
  }
  
  return `${floor}${suffix} Floor`;
}

export function formatBlock(block: string): string {
  if (!block) return "";
  return `Block '${block}'`;
}

export function getInitials(username: string): string {
  if (!username) return "";
  return username.split(" ").map((name) => name[0]).join("");
}

export function getRandomColor(): string {
  return colorMapping[Object.keys(colorMapping)[Math.floor(Math.random() * Object.keys(colorMapping).length)]];
}

export function getColorForInvite(inviteCode: string): string {
  if (!inviteCode) return getRandomColor();
  
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < inviteCode.length; i++) {
    const char = inviteCode.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get index
  const colorKeys = Object.keys(colorMapping);
  const index = Math.abs(hash) % colorKeys.length;
  return colorMapping[colorKeys[index]];
}

export function generateColorsForInvites(inviteCodes: string[]): Record<string, string> {
  const colorMap: Record<string, string> = {};
  const colorKeys = Object.keys(colorMapping);
  
  inviteCodes.forEach((code) => {
    if (code && !colorMap[code]) {
      colorMap[code] = colorMapping[colorKeys[Math.floor(Math.random() * colorKeys.length)]];
    }
  });
  
  return colorMap;
}

export function getGreetingTime(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  return "Evening";
}