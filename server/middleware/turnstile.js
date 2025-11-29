/**
 * Cloudflare Turnstile Verification Middleware
 * Verifies Turnstile tokens from client requests
 */

/**
 * Verify Turnstile token with Cloudflare API
 * @param {string} token - Turnstile token from client
 * @param {string} remoteip - Client IP address (optional)
 * @returns {Promise<Object>} Verification result
 */
const verifyTurnstileToken = async (token, remoteip = null) => {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
        throw new Error('TURNSTILE_SECRET_KEY not configured');
    }

    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);

    if (remoteip) {
        formData.append('remoteip', remoteip);
    }

    try {
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ Error verifying Turnstile token:', error);
        throw error;
    }
};

/**
 * Express middleware to verify Turnstile token
 * Expects token in request body as 'turnstileToken'
 */
export const verifyTurnstile = async (req, res, next) => {
    const token = req.body.turnstileToken || req.headers['x-turnstile-token'];

    if (!token) {
        return res.status(400).json({
            success: false,
            error: 'Turnstile token required'
        });
    }

    try {
        // Get client IP from various headers
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim()
            || req.headers['x-real-ip']
            || req.socket.remoteAddress;

        const result = await verifyTurnstileToken(token, clientIp);

        if (!result.success) {
            console.warn('⚠️ Turnstile verification failed:', result['error-codes']);
            return res.status(403).json({
                success: false,
                error: 'Turnstile verification failed',
                details: result['error-codes']
            });
        }

        console.log('✅ Turnstile verification successful');

        // Attach verification result to request
        req.turnstile = {
            success: true,
            challenge_ts: result.challenge_ts,
            hostname: result.hostname
        };

        next();
    } catch (error) {
        console.error('❌ Turnstile verification error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error during verification'
        });
    }
};

/**
 * Standalone endpoint for Turnstile verification
 * Can be used by client to verify tokens independently
 */
export const verifyTurnstileEndpoint = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'Token is required'
        });
    }

    try {
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim()
            || req.headers['x-real-ip']
            || req.socket.remoteAddress;

        const result = await verifyTurnstileToken(token, clientIp);

        if (result.success) {
            return res.json({
                success: true,
                message: 'Verification successful',
                challenge_ts: result.challenge_ts,
                hostname: result.hostname
            });
        } else {
            return res.status(403).json({
                success: false,
                message: 'Verification failed',
                errors: result['error-codes']
            });
        }
    } catch (error) {
        console.error('❌ Verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export default verifyTurnstile;
