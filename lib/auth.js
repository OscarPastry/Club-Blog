import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.EDITOR_PASSWORD || '';
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a time-based auth token using HMAC.
 * Token format: "<timestamp>.<hmac_hex>"
 */
export function generateAuthToken() {
    const timestamp = Date.now().toString();
    const hmac = createHmac('sha256', SECRET).update(timestamp).digest('hex');
    return `${timestamp}.${hmac}`;
}

/**
 * Verify an auth token from the Authorization header.
 * Returns { valid: true } or { valid: false, error: string }
 */
export function verifyAuthToken(request) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { valid: false, error: 'Missing or invalid Authorization header' };
    }

    const token = authHeader.slice(7); // Remove "Bearer "
    const parts = token.split('.');

    if (parts.length !== 2) {
        return { valid: false, error: 'Malformed token' };
    }

    const [timestamp, providedHmac] = parts;
    const timestampNum = parseInt(timestamp, 10);

    if (isNaN(timestampNum)) {
        return { valid: false, error: 'Invalid timestamp' };
    }

    // Check expiration
    if (Date.now() - timestampNum > TOKEN_EXPIRY_MS) {
        return { valid: false, error: 'Token expired' };
    }

    // Verify HMAC
    const expectedHmac = createHmac('sha256', SECRET).update(timestamp).digest('hex');

    // Constant-time comparison to prevent timing attacks
    if (providedHmac.length !== expectedHmac.length) {
        return { valid: false, error: 'Invalid token' };
    }

    const a = Buffer.from(providedHmac, 'hex');
    const b = Buffer.from(expectedHmac, 'hex');

    if (a.length !== b.length || !timingSafeEqual(a, b)) {
        return { valid: false, error: 'Invalid token' };
    }

    return { valid: true };
}
