import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter General
 * Aplica a todos los endpoints de la API
 * Límite: 100 requests cada 15 minutos
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests por ventana
    message: {
        error: 'Demasiadas solicitudes desde esta dirección, por favor intenta más tarde.'
    },
    standardHeaders: true, // Retorna info de rate limit en headers `RateLimit-*`
    legacyHeaders: false, // Deshabilita headers `X-RateLimit-*`
});

/**
 * Rate Limiter Estricto
 * Para endpoints sensibles (matches, mensajes, etc.)
 * Límite: 50 requests cada hora
 */
export const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 50, // 50 requests por hora
    message: {
        error: 'Has excedido el límite de solicitudes para esta acción. Intenta más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate Limiter para Autenticación
 * Protege endpoints de login/registro
 * Límite: 5 intentos cada 15 minutos
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos
    message: {
        error: 'Demasiados intentos de autenticación. Por favor, espera 15 minutos antes de intentar nuevamente.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // No contar requests exitosos
});

/**
 * Rate Limiter para Consultas
 * Para endpoints de lectura (GET)
 * Límite: 200 requests cada hora
 */
export const readLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 200, // 200 requests por hora
    message: {
        error: 'Has excedido el límite de consultas. Intenta más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate Limiter para Creación de Recursos
 * Para endpoints POST/PUT/DELETE
 * Límite: 30 requests cada hora
 */
export const writeLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 30, // 30 requests por hora
    message: {
        error: 'Has excedido el límite de acciones. Intenta más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
