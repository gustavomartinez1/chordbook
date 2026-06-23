/**
 * Admin PIN verification.
 * The PIN is passed directly in form submissions (via hidden field).
 * No cookies needed - simpler and more reliable.
 */

export function verifyPin(pin: string): boolean {
  const adminPin = process.env.ADMIN_PIN ?? '1234';
  return pin === adminPin;
}
