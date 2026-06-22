'use server';

/**
 * Verifies the admin PIN.
 * The PIN is stored server-side in the ADMIN_PIN environment variable.
 * Default: "1234" (cambiar en producción)
 */

export async function verifyAdminPin(pin: string): Promise<boolean> {
  const adminPin = process.env.ADMIN_PIN ?? '1234';
  return pin === adminPin;
}
