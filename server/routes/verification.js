import express from 'express';
import { db } from '../firebase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/verification/identity
 * Enviar una verificación de identidad
 */
router.post('/identity', verifyToken, async (req, res) => {
    try {
        const { userId, gestureType, timestamp } = req.body;
        let { confidence } = req.body;
        
        // Convertir confidence a número si es string
        confidence = parseFloat(confidence);
        
        // Validar que el usuario que realiza la solicitud es el mismo del ID
        if (req.user.uid !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'No autorizado para verificar este usuario' 
            });
        }

        // Validar datos
        if (!gestureType || typeof confidence !== 'number' || isNaN(confidence)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Datos incompletos o inválidos',
                received: { gestureType, confidence: typeof confidence, isNaN: isNaN(confidence) }
            });
        }

        // Log para debugging
        console.log(`[VERIFICACIÓN] userId: ${userId}, confidence: ${confidence}, gestureType: ${gestureType}`);

        // Determinar estado automáticamente basado en confianza
        // Si confianza >= 0.6 se aprueba automáticamente
        // Si confianza >= 0.4 y < 0.6 requiere revisión
        // Si confianza < 0.4 se rechaza automáticamente
        let status = 'pending';
        let isVerified = false;
        
        console.log(`[EVALUACIÓN] Confianza: ${confidence}`);
        if (confidence >= 0.6) {
            status = 'approved';
            isVerified = true;
            console.log(`[RESULTADO] Status: APPROVED (>= 0.6)`);
        } else if (confidence < 0.4) {
            status = 'rejected';
            isVerified = false;
            console.log(`[RESULTADO] Status: REJECTED (< 0.4)`);
        } else {
            console.log(`[RESULTADO] Status: PENDING (0.4 - 0.6)`);
        }

        // Guardar verificación en Firestore
        const verificationData = {
            userId,
            gestureType,
            timestamp: new Date(timestamp),
            confidence,
            status: status, // approved, pending, rejected
            submittedAt: new Date(),
            reviewedAt: status !== 'pending' ? new Date() : null,
            reviewedBy: status !== 'pending' ? 'system' : null,
            notes: status === 'approved' ? 'Aprobado automáticamente' : status === 'rejected' ? 'Rechazado automáticamente - confianza insuficiente' : ''
        };

        const verificationRef = await db.collection('identity_verifications').add(verificationData);

        // Actualizar documento del usuario con referencia a la verificación
        await db.collection('users').doc(userId).update({
            identityVerificationId: verificationRef.id,
            lastVerificationAttempt: new Date(),
            identityVerified: isVerified
        }).catch(async () => {
            // Si el documento no existe, crearlo
            await db.collection('users').doc(userId).set({
                identityVerificationId: verificationRef.id,
                lastVerificationAttempt: new Date(),
                identityVerified: isVerified
            }, { merge: true });
        });

        return res.status(201).json({
            success: true,
            message: status === 'approved' ? 'Verificación completada exitosamente' : status === 'rejected' ? 'Verificación rechazada - confianza insuficiente' : 'Verificación enviada a revisión',
            status: status,
            isVerified: isVerified,
            verificationId: verificationRef.id,
            confidenceDetected: confidence,
            data: {
                ...verificationData,
                status: status,
                isVerified: isVerified,
                verificationId: verificationRef.id,
                confidenceDetected: confidence
            }
        });
    } catch (error) {
        console.error('Error en verificación de identidad:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al procesar la verificación',
            error: error.message
        });
    }
});

/**
 * GET /api/verification/status/:userId
 * Obtener estado de verificación del usuario
 */
router.get('/status/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;

        // Solo el usuario puede ver su propio estado, o un admin
        if (req.user.uid !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'No autorizado' 
            });
        }

        const userDoc = await db.collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        const userData = userDoc.data();
        const verificationId = userData.identityVerificationId;

        if (!verificationId) {
            return res.status(200).json({
                success: true,
                status: 'not_submitted',
                data: null
            });
        }

        const verificationDoc = await db.collection('identity_verifications').doc(verificationId).get();
        
        if (!verificationDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                message: 'Verificación no encontrada' 
            });
        }

        return res.status(200).json({
            success: true,
            status: verificationDoc.data().status,
            data: {
                submittedAt: verificationDoc.data().submittedAt,
                status: verificationDoc.data().status,
                gestureType: verificationDoc.data().gestureType,
                reviewedAt: verificationDoc.data().reviewedAt,
                notes: verificationDoc.data().notes
            }
        });
    } catch (error) {
        console.error('Error obteniendo estado de verificación:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener estado de verificación',
            error: error.message
        });
    }
});

/**
 * POST /api/verification/cancel/:userId
 * Cancelar verificación pendiente
 */
router.post('/cancel/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;

        if (req.user.uid !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'No autorizado' 
            });
        }

        const userDoc = await db.collection('users').doc(userId).get();
        
        if (!userDoc.exists || !userDoc.data().identityVerificationId) {
            return res.status(404).json({ 
                success: false, 
                message: 'No hay verificación para cancelar' 
            });
        }

        const verificationId = userDoc.data().identityVerificationId;
        const verificationDoc = await db.collection('identity_verifications').doc(verificationId).get();

        if (verificationDoc.data().status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                message: 'Solo se pueden cancelar verificaciones pendientes' 
            });
        }

        // Cambiar estado a cancelled
        await db.collection('identity_verifications').doc(verificationId).update({
            status: 'cancelled',
            cancelledAt: new Date()
        });

        await db.collection('users').doc(userId).update({
            identityVerificationId: null
        });

        return res.status(200).json({
            success: true,
            message: 'Verificación cancelada exitosamente'
        });
    } catch (error) {
        console.error('Error cancelando verificación:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al cancelar verificación',
            error: error.message
        });
    }
});

/**
 * GET /api/verification/history/:userId
 * Obtener historial de intentos de verificación
 */
router.get('/history/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;

        if (req.user.uid !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'No autorizado' 
            });
        }

        const verifications = await db.collection('identity_verifications')
            .where('userId', '==', userId)
            .orderBy('submittedAt', 'desc')
            .limit(10)
            .get();

        const history = [];
        verifications.forEach(doc => {
            history.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error obteniendo historial:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener historial de verificación',
            error: error.message
        });
    }
});

export default router;
