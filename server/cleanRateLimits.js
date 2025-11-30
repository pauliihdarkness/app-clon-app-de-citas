import { db } from "./firebase.js";
import admin from "./firebase.js";

/**
 * Script para limpiar documentos antiguos de rateLimits
 * Elimina documentos que no han sido modificados en las últimas 24 horas.
 * 
 * Uso: node cleanRateLimits.js
 */
async function cleanOldRateLimits() {
    console.log('🧹 Iniciando limpieza de rateLimits...');

    try {
        // Calcular timestamp de hace 24 horas
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        console.log(`📅 Buscando documentos anteriores a: ${yesterday.toISOString()}`);

        // Obtener todos los documentos (idealmente usaríamos una query con where, 
        // pero rateLimits estructura los datos dentro del documento, no en campos de nivel superior indexables por fecha de modificación automática de Firestore sin configuración extra)
        // Para esta implementación simple, leeremos y verificaremos.
        // NOTA: En producción con millones de usuarios, esto debería ser una Cloud Function programada
        // que use un campo 'lastUpdated' indexado.

        const snapshot = await db.collection('rateLimits').get();

        if (snapshot.empty) {
            console.log('✅ No hay documentos para revisar.');
            process.exit(0);
        }

        console.log(`📊 Total de documentos encontrados: ${snapshot.size}`);

        let deletedCount = 0;
        let batch = db.batch();
        let operationCounter = 0;
        const BATCH_SIZE = 500; // Límite de Firestore para batch writes

        for (const doc of snapshot.docs) {
            const data = doc.data();

            // Si el documento tiene likes, verificar el más reciente
            // Si el array de likes está vacío o el último like es muy viejo, borrar

            let shouldDelete = false;

            if (!data.likes || data.likes.length === 0) {
                shouldDelete = true;
            } else {
                // Los likes son timestamps (números)
                // Ordenar para asegurar que tenemos el último (aunque deberían estar en orden)
                const sortedLikes = data.likes.sort((a, b) => b - a);
                const lastLikeTime = sortedLikes[0];

                if (lastLikeTime < yesterday.getTime()) {
                    shouldDelete = true;
                }
            }

            if (shouldDelete) {
                batch.delete(doc.ref);
                deletedCount++;
                operationCounter++;

                // Si alcanzamos el límite del batch, ejecutar y crear uno nuevo
                if (operationCounter >= BATCH_SIZE) {
                    await batch.commit();
                    console.log(`   ... Lote de ${BATCH_SIZE} documentos borrado.`);
                    batch = db.batch();
                    operationCounter = 0;
                }
            }
        }

        // Ejecutar operaciones restantes
        if (operationCounter > 0) {
            await batch.commit();
        }

        console.log('\n📈 Resumen de limpieza:');
        console.log(`   🗑️  Documentos eliminados: ${deletedCount}`);
        console.log(`   💾 Documentos conservados: ${snapshot.size - deletedCount}`);

    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar
cleanOldRateLimits();
