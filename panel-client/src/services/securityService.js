import { db } from '../firebase/config';
import { doc, getDoc, collection, getDocs, limit, query, setDoc, addDoc } from 'firebase/firestore';
import { getAllUsers } from './userService';

/**
 * Intenta leer un documento y devuelve el resultado
 * @param {string} path - Ruta del documento o colección
 * @param {boolean} isCollection - Si es una colección o un documento
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
const testRead = async (path, isCollection = false) => {
    try {
        if (isCollection) {
            const colRef = collection(db, path);
            // Intentamos leer solo 1 documento para verificar acceso
            const q = query(colRef, limit(1));
            await getDocs(q);
        } else {
            const docRef = doc(db, path);
            await getDoc(docRef);
        }
        return { success: true, error: null };
    } catch (error) {
        return { success: false, error: error.code || error.message };
    }
};

/**
 * Intenta escribir en un documento y devuelve el resultado
 * @param {string} path - Ruta del documento
 * @param {object} data - Datos de prueba a escribir
 * @param {boolean} isCollection - Si es una colección (usará addDoc) o documento (usará setDoc)
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
const testWrite = async (path, data = { _test: true }, isCollection = false) => {
    try {
        if (isCollection) {
            const colRef = collection(db, path);
            await addDoc(colRef, data);
        } else {
            const docRef = doc(db, path);
            // Usamos merge: true para no sobrescribir datos existentes
            await setDoc(docRef, data, { merge: true });
        }
        return { success: true, error: null };
    } catch (error) {
        return { success: false, error: error.code || error.message };
    }
};

/**
 * Ejecuta la auditoría de seguridad
 * @param {string} currentUserId - ID del usuario autenticado
 * @returns {Promise<Array>} - Lista de resultados de pruebas
 */
export const runSecurityAudit = async (currentUserId) => {
    const results = [];

    // Obtener un usuario ajeno para pruebas
    let otherUserId = 'non_existent_user';
    try {
        const users = await getAllUsers(5);
        const otherUser = users.find(u => u.id !== currentUserId);
        if (otherUser) otherUserId = otherUser.id;
    } catch (e) {
        console.warn('No se pudieron obtener usuarios para pruebas cruzadas', e);
    }

    // Definir casos de prueba
    const testCases = [
        // ===== PRUEBAS DE LECTURA =====
        {
            id: 'read_public_collection',
            name: 'Leer Colección Pública (users)',
            path: 'users',
            operation: 'read',
            isCollection: true,
            expected: true,
            description: 'Cualquier usuario autenticado debería poder listar usuarios.'
        },
        {
            id: 'read_own_profile',
            name: 'Leer Mi Perfil Público',
            path: `users/${currentUserId}`,
            operation: 'read',
            isCollection: false,
            expected: true,
            description: 'Deberías poder leer tu propio perfil público.'
        },
        {
            id: 'read_other_profile',
            name: 'Leer Perfil Público Ajeno',
            path: `users/${otherUserId}`,
            operation: 'read',
            isCollection: false,
            expected: true,
            description: 'Deberías poder leer perfiles públicos de otros usuarios.'
        },
        {
            id: 'read_own_private',
            name: 'Leer Mis Datos Privados',
            path: `users/${currentUserId}/private/data`,
            operation: 'read',
            isCollection: false,
            expected: true,
            description: 'SOLO tú deberías poder leer tus datos privados (email, fecha nacimiento).'
        },
        {
            id: 'read_other_private',
            name: 'Leer Datos Privados Ajenos',
            path: `users/${otherUserId}/private/data`,
            operation: 'read',
            isCollection: false,
            expected: false,
            description: 'NO deberías poder leer datos privados de otros usuarios.'
        },
        {
            id: 'read_own_notifications',
            name: 'Leer Mis Notificaciones',
            path: `users/${currentUserId}/notifications`,
            operation: 'read',
            isCollection: true,
            expected: true,
            description: 'Deberías poder leer tus propias notificaciones.'
        },
        {
            id: 'read_other_notifications',
            name: 'Leer Notificaciones Ajenas',
            path: `users/${otherUserId}/notifications`,
            operation: 'read',
            isCollection: true,
            expected: false,
            description: 'NO deberías poder leer notificaciones de otros.'
        },
        {
            id: 'read_own_blocked',
            name: 'Leer Mis Usuarios Bloqueados',
            path: `users/${currentUserId}/blockedUsers`,
            operation: 'read',
            isCollection: true,
            expected: true,
            description: 'Deberías poder ver tu lista de usuarios bloqueados.'
        },
        {
            id: 'read_other_blocked',
            name: 'Leer Usuarios Bloqueados Ajenos',
            path: `users/${otherUserId}/blockedUsers`,
            operation: 'read',
            isCollection: true,
            expected: false,
            description: 'NO deberías poder ver quién bloqueó otro usuario.'
        },
        {
            id: 'read_likes',
            name: 'Leer Colección Likes',
            path: 'likes',
            operation: 'read',
            isCollection: true,
            expected: true,
            description: 'Usuarios autenticados pueden leer likes (necesario para lógica de match).'
        },
        {
            id: 'read_matches',
            name: 'Leer Colección Matches',
            path: 'matches',
            operation: 'read',
            isCollection: true,
            expected: true,
            description: 'Usuarios autenticados pueden leer matches.'
        },
        {
            id: 'read_own_conversations',
            name: 'Leer Mis Conversaciones',
            path: `users/${currentUserId}/conversations`,
            operation: 'read',
            isCollection: true,
            expected: true,
            description: 'Deberías poder leer tus propias conversaciones.'
        },
        {
            id: 'read_other_conversations',
            name: 'Leer Conversaciones Ajenas',
            path: `users/${otherUserId}/conversations`,
            operation: 'read',
            isCollection: true,
            expected: false,
            description: 'NO deberías poder leer conversaciones de otros.'
        },
        {
            id: 'read_reports',
            name: 'Leer Colección Reports',
            path: 'reports',
            operation: 'read',
            isCollection: true,
            expected: false,
            description: 'Solo administradores (backend) deberían leer reportes.'
        },

        // ===== PRUEBAS DE ESCRITURA =====
        {
            id: 'write_own_profile',
            name: 'Escribir Mi Perfil Público',
            path: `users/${currentUserId}`,
            operation: 'write',
            isCollection: false,
            expected: true,
            description: 'Deberías poder actualizar tu propio perfil público.'
        },
        {
            id: 'write_other_profile',
            name: 'Escribir Perfil Ajeno',
            path: `users/${otherUserId}`,
            operation: 'write',
            isCollection: false,
            expected: false,
            description: 'NO deberías poder modificar perfiles de otros usuarios.'
        },
        {
            id: 'write_own_private',
            name: 'Escribir Mis Datos Privados',
            path: `users/${currentUserId}/private/data`,
            operation: 'write',
            isCollection: false,
            expected: true,
            description: 'Deberías poder actualizar tus propios datos privados.'
        },
        {
            id: 'write_other_private',
            name: 'Escribir Datos Privados Ajenos',
            path: `users/${otherUserId}/private/data`,
            operation: 'write',
            isCollection: false,
            expected: false,
            description: 'NO deberías poder modificar datos privados de otros.'
        },
        {
            id: 'write_own_notification',
            name: 'Crear Notificación Propia',
            path: `users/${currentUserId}/notifications`,
            operation: 'write',
            isCollection: true,
            expected: false,
            description: 'NO deberías poder crear tus propias notificaciones (solo backend).'
        },
        {
            id: 'write_other_notification',
            name: 'Crear Notificación Ajena',
            path: `users/${otherUserId}/notifications`,
            operation: 'write',
            isCollection: true,
            expected: false,
            description: 'NO deberías poder crear notificaciones para otros.'
        },
        {
            id: 'write_own_blocked',
            name: 'Bloquear Usuario',
            path: `users/${currentUserId}/blockedUsers`,
            operation: 'write',
            isCollection: true,
            expected: true,
            description: 'Deberías poder agregar usuarios a tu lista de bloqueados.'
        },
        {
            id: 'write_other_blocked',
            name: 'Modificar Bloqueados Ajenos',
            path: `users/${otherUserId}/blockedUsers`,
            operation: 'write',
            isCollection: true,
            expected: false,
            description: 'NO deberías poder modificar la lista de bloqueados de otros.'
        },
        {
            id: 'write_like',
            name: 'Crear Like',
            path: 'likes',
            operation: 'write',
            isCollection: true,
            expected: true,
            description: 'Deberías poder dar like a otros usuarios.'
        },
        {
            id: 'write_match',
            name: 'Crear Match Manualmente',
            path: 'matches',
            operation: 'write',
            isCollection: true,
            expected: false,
            description: 'NO deberías poder crear matches manualmente (solo backend).'
        },
        {
            id: 'write_report',
            name: 'Crear Reporte',
            path: 'reports',
            operation: 'write',
            isCollection: true,
            expected: true,
            description: 'Usuarios autenticados pueden crear reportes.'
        },
        {
            id: 'write_users_collection',
            name: 'Crear Usuario en Colección',
            path: 'users',
            operation: 'write',
            isCollection: true,
            expected: false,
            description: 'NO deberías poder crear usuarios directamente en la colección (solo backend).'
        }
    ];

    // Ejecutar pruebas
    for (const test of testCases) {
        let result;

        if (test.operation === 'read') {
            result = await testRead(test.path, test.isCollection);
        } else {
            result = await testWrite(test.path, { _auditTest: true, timestamp: Date.now() }, test.isCollection);
        }

        // Determinar si la prueba pasó (el resultado real coincide con el esperado)
        const passed = test.expected === result.success;

        // Si esperábamos fallo (expected: false) y obtuvimos éxito (success: true), es una BRECHA DE SEGURIDAD GRAVE
        const severity = !test.expected && result.success ? 'critical' :
            (test.expected && !result.success ? 'warning' : 'info');

        results.push({
            ...test,
            result: result.success,
            error: result.error,
            passed,
            severity
        });
    }

    return results;
};
