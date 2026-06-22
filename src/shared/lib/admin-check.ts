/**
 * Server-side admin check via cookie.
 * After PIN verification, a secure cookie is set.
 * Uses simple hex encoding (no Buffer dependency for edge compat).
 */

function encode(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
}

function decode(hex: string): string {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
  }
  return str;
}

export function isAdminFromCookies(cookieStore: { get: (name: string) => { value: string } | undefined }): boolean {
  const token = cookieStore.get('chordbook_admin_token')?.value;
  if (!token) return false;

  const adminPin = process.env.ADMIN_PIN ?? '1234';
  const expected = encode(`admin:${adminPin}`);
  return token === expected;
}

export function generateAdminToken(): string {
  const adminPin = process.env.ADMIN_PIN ?? '1234';
  return encode(`admin:${adminPin}`);
}
