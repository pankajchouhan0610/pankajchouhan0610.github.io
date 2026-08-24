import { createHash } from 'node:crypto';

const SALT = 'techlist-admin';

/**
 * SHA-256 of salt + password.
 * The plaintext password is never committed to git.
 * Override at build time with ADMIN_PASSWORD if needed.
 */
const DEFAULT_PASSWORD_HASH =
  '04f0dd439b9ceef4d88daaafd6667311fefa5c454824351a1ff9d7f25a9b34ba';

function hashPassword(password: string): string {
  return createHash('sha256').update(`${SALT}:${password}`).digest('hex');
}

export function getAdminAuthConfig() {
  const password = import.meta.env.ADMIN_PASSWORD;
  const credentialHash = password ? hashPassword(password) : DEFAULT_PASSWORD_HASH;

  return {
    enabled: true,
    salt: SALT,
    credentialHash,
  };
}
