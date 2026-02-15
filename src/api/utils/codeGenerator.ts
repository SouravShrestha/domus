const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const NUMERIC = '0123456789';
const MAX_GENERATION_ATTEMPTS = 10;

export function generateCode(
  length: number,
  charset: string = ALPHANUMERIC
): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return code;
}

export function generateAlphanumericCode(length: number = 6): string {
  return generateCode(length, ALPHANUMERIC);
}

export function generateNumericCode(length: number = 6): string {
  return generateCode(length, NUMERIC);
}

export async function generateUniqueCode(
  generator: () => string,
  isUnique: (code: string) => Promise<boolean>,
  maxAttempts: number = MAX_GENERATION_ATTEMPTS
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generator();
    if (await isUnique(code)) {
      return code;
    }
  }
  throw new Error('Failed to generate unique code after maximum attempts');
}
