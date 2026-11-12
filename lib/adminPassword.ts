import crypto from 'crypto';

/**
 * Admin password helpers.
 *
 * admin-panel deliberately has no bcryptjs dependency, so we use Node's
 * built-in scrypt instead. Stored format: `scrypt$<salt>$<hash>` (hex).
 * Legacy values are stored as `plain:<password>` — those still verify, and
 * are upgraded to scrypt on the next successful password change.
 */

const SCRYPT_KEYLEN = 64;
const SCRYPT_COST = 16384;

export function hashAdminPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .scryptSync(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_COST })
    .toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyAdminPassword(password: string, stored?: string | null): boolean {
  if (!stored) return false;

  // Legacy plaintext records created before hashing existed.
  if (stored.startsWith('plain:')) {
    const legacy = stored.slice('plain:'.length);
    // Constant-time compare so we don't leak prefix length via timing.
    return timingSafeEqual(legacy, password);
  }

  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;

  const [, salt, expected] = parts;
  try {
    const actual = crypto
      .scryptSync(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_COST })
      .toString('hex');
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
