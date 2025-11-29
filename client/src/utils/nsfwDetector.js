import * as nsfwjs from 'nsfwjs';

/**
 * NSFW Image Detector
 * Utiliza nsfwjs para detectar contenido inapropiado en imágenes
 */

let model = null;
let modelLoading = false;

/**
 * Umbrales de detección (0-100)
 * Valores más bajos = más estricto
 */
const DEFAULT_THRESHOLDS = {
    Porn: parseInt(import.meta.env.VITE_NSFW_PORN_THRESHOLD) || 60,
    Hentai: parseInt(import.meta.env.VITE_NSFW_HENTAI_THRESHOLD) || 60,
    Sexy: parseInt(import.meta.env.VITE_NSFW_SEXY_THRESHOLD) || 80,
};

/**
 * Carga el modelo nsfwjs
 * El modelo se cachea en memoria para reutilización
 * @returns {Promise<Object>} Modelo cargado
 */
export async function loadModel() {
    if (model) {
        return model;
    }

    if (modelLoading) {
        // Esperar a que termine de cargar
        while (modelLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return model;
    }

    try {
        modelLoading = true;
        console.log('🔍 Cargando modelo NSFW...');
        
        // Cargar modelo desde CDN de nsfwjs
        model = await nsfwjs.load();
        
        console.log('✅ Modelo NSFW cargado correctamente');
        return model;
    } catch (error) {
        console.error('❌ Error al cargar modelo NSFW:', error);
        throw new Error('No se pudo cargar el modelo de detección. Por favor, intenta de nuevo.');
    } finally {
        modelLoading = false;
    }
}

/**
 * Analiza una imagen para detectar contenido NSFW
 * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} imageElement - Elemento de imagen a analizar
 * @returns {Promise<Array>} Predicciones del modelo
 */
export async function analyzeImage(imageElement) {
    if (!imageElement) {
        throw new Error('No se proporcionó una imagen para analizar');
    }

    try {
        const nsfwModel = await loadModel();
        const predictions = await nsfwModel.classify(imageElement);
        
        console.log('📊 Predicciones NSFW:', predictions);
        return predictions;
    } catch (error) {
        console.error('❌ Error al analizar imagen:', error);
        throw error;
    }
}

/**
 * Convierte un File o Blob a HTMLImageElement
 * @param {File|Blob} file - Archivo de imagen
 * @returns {Promise<HTMLImageElement>} Elemento de imagen
 */
export function fileToImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('No se pudo cargar la imagen'));
        };

        img.src = url;
    });
}

/**
 * Valida si una imagen es segura basándose en las predicciones
 * @param {Array} predictions - Predicciones del modelo
 * @param {Object} customThresholds - Umbrales personalizados (opcional)
 * @returns {Object} { isSafe: boolean, reason: string, predictions: Array }
 */
export function isImageSafe(predictions, customThresholds = {}) {
    const thresholds = { ...DEFAULT_THRESHOLDS, ...customThresholds };

    // Convertir predicciones a objeto para fácil acceso
    const predictionMap = {};
    predictions.forEach(pred => {
        predictionMap[pred.className] = pred.probability * 100;
    });

    // Verificar cada categoría contra su umbral
    if (predictionMap.Porn >= thresholds.Porn) {
        return {
            isSafe: false,
            reason: 'Contenido explícito detectado',
            category: 'Porn',
            confidence: predictionMap.Porn.toFixed(1),
            predictions
        };
    }

    if (predictionMap.Hentai >= thresholds.Hentai) {
        return {
            isSafe: false,
            reason: 'Contenido explícito detectado',
            category: 'Hentai',
            confidence: predictionMap.Hentai.toFixed(1),
            predictions
        };
    }

    if (predictionMap.Sexy >= thresholds.Sexy) {
        return {
            isSafe: false,
            reason: 'Contenido inapropiado detectado',
            category: 'Sexy',
            confidence: predictionMap.Sexy.toFixed(1),
            predictions
        };
    }

    // La imagen es segura
    return {
        isSafe: true,
        reason: 'Imagen aprobada',
        predictions
    };
}

/**
 * Analiza un archivo de imagen completo
 * @param {File} file - Archivo de imagen
 * @param {Object} customThresholds - Umbrales personalizados (opcional)
 * @returns {Promise<Object>} Resultado de la validación
 */
export async function validateImageFile(file, customThresholds = {}) {
    try {
        // Convertir archivo a imagen
        const img = await fileToImage(file);
        
        // Analizar imagen
        const predictions = await analyzeImage(img);
        
        // Validar resultados
        const result = isImageSafe(predictions, customThresholds);
        
        return result;
    } catch (error) {
        console.error('❌ Error al validar imagen:', error);
        throw error;
    }
}

/**
 * Verifica si el modelo está cargado
 * @returns {boolean} True si el modelo está cargado
 */
export function getModelStatus() {
    return {
        isLoaded: model !== null,
        isLoading: modelLoading
    };
}

/**
 * Descarga el modelo de forma anticipada (opcional)
 * Útil para pre-cargar el modelo en el background
 */
export async function preloadModel() {
    try {
        await loadModel();
        console.log('✅ Modelo NSFW pre-cargado');
    } catch (error) {
        console.warn('⚠️ No se pudo pre-cargar el modelo NSFW:', error);
    }
}
