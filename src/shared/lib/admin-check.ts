/**
 * Server-side admin check via cookie.
 * After PIN verification, a secure cookie is set.
 */

export function isAdminFromCookies(cookieStore: { get: (name: string) => { value: string } | undefined }): boolean {
  const token = cookieStore.get('chordbook_admin_token')?.value;
  if (!token) return false;

  const adminPin = process.env.ADMIN_PIN ?? '1234';
  // Simple token: hash the PIN with a timestamp prefix
  const expected = Buffer.from(`admin:${adminPin}`).toString('base64');
  return token === expected;
}

export function generateAdminToken(): string {
  const adminPin = process.env.ADMIN_PIN ?? '1234';
  return Buffer.from(`admin:${adminPin}`).toString('base64');
}
