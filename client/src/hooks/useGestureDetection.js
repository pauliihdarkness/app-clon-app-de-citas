import { useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';

export const useGestureDetection = (gestureType) => {
    const [isDetecting, setIsDetecting] = useState(false);
    const [error, setError] = useState(null);

    const detectGesture = useCallback(async (videoElement, canvasElement) => {
        setIsDetecting(true);
        setError(null);

        try {
            // Cargar el modelo de detección de pose
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js';
            
            return new Promise((resolve) => {
                script.onload = async () => {
                    try {
                        // Usar canvas para capturar frames del video
                        const canvas = canvasElement;
                        const ctx = canvas.getContext('2d');
                        
                        // Configurar dimensiones del canvas
                        canvas.width = videoElement.videoWidth;
                        canvas.height = videoElement.videoHeight;

                        // Capturar varios frames para análisis
                        const frames = [];
                        const frameCount = 10;
                        const frameInterval = 500; // 500ms entre frames

                        for (let i = 0; i < frameCount; i++) {
                            await new Promise(resolve => setTimeout(resolve, frameInterval));
                            
                            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            frames.push(imageData);
                        }

                        // Analizar los gestos detectados
                        const gestureResult = analyzeFrames(frames, gestureType);

                        setIsDetecting(false);
                        resolve(gestureResult);
                    } catch (err) {
                        console.error('Error en detección de gesto:', err);
                        setError(err.message);
                        setIsDetecting(false);
                        resolve({ detected: false, confidence: 0 });
                    }
                };

                document.head.appendChild(script);
            });
        } catch (err) {
            console.error('Error al cargar modelo:', err);
            setError(err.message);
            setIsDetecting(false);
            return { detected: false, confidence: 0 };
        }
    }, [gestureType]);

    return {
        detectGesture,
        isDetecting,
        error
    };
};

// Función para analizar frames y detectar gestos
const analyzeFrames = (frames, gestureType) => {
    try {
        // Análisis simplificado basado en cambios en píxeles
        if (frames.length < 2) {
            return { detected: false, confidence: 0 };
        }

        let changes = 0;
        
        // Comparar frames consecutivos para detectar movimiento
        for (let i = 1; i < frames.length; i++) {
            const change = compareFrames(frames[i], frames[i - 1]);
            changes += change;
        }

        const movementIntensity = changes / (frames.length - 1);

        // Lógica específica para cada gesto
        const result = classifyGesture(gestureType, movementIntensity, frames);

        return result;
    } catch (err) {
        console.error('Error al analizar frames:', err);
        return { detected: false, confidence: 0 };
    }
};

// Comparar dos frames para detectar movimiento
const compareFrames = (frame1, frame2) => {
    const data1 = frame1.data;
    const data2 = frame2.data;
    let differences = 0;

    // Muestrear cada 4to píxel para mejor rendimiento
    for (let i = 0; i < data1.length; i += 4) {
        const diff = Math.abs(data1[i] - data2[i]) +
                     Math.abs(data1[i + 1] - data2[i + 1]) +
                     Math.abs(data1[i + 2] - data2[i + 2]);
        
        if (diff > 30) {
            differences++;
        }
    }

    return differences / (data1.length / 4);
};

// Clasificar el gesto basado en patrones de movimiento
const classifyGesture = (gestureType, movementIntensity, frames) => {
    // Umbrales de movimiento para diferentes gestos
    const thresholds = {
        smile: { min: 0.05, max: 0.2, requiredFrames: 3 },
        blink: { min: 0.15, max: 0.4, requiredFrames: 2 },
        nod: { min: 0.1, max: 0.35, requiredFrames: 4 },
        headShake: { min: 0.1, max: 0.35, requiredFrames: 4 }
    };

    const threshold = thresholds[gestureType] || thresholds.nod;

    // Detectar si el movimiento está en el rango esperado
    const isInRange = movementIntensity >= threshold.min && movementIntensity <= threshold.max;
    
    // Calcular confianza basada en cómo se ajusta el movimiento al gesto
    let confidence = 0;
    if (isInRange) {
        // Normalizar la confianza basada en cómo de bien se ajusta al patrón esperado
        const targetIntensity = (threshold.min + threshold.max) / 2;
        const distance = Math.abs(movementIntensity - targetIntensity);
        const maxDistance = (threshold.max - threshold.min) / 2;
        confidence = Math.max(0, 1 - (distance / maxDistance)) * 0.8 + 0.2; // Entre 0.2 y 1.0
    } else {
        confidence = Math.max(0, (movementIntensity / (threshold.max + threshold.min)) * 0.3);
    }

    const detected = isInRange && confidence > 0.5;

    return {
        detected,
        confidence: Math.min(1, Math.max(0, confidence)),
        gestureType,
        movementIntensity
    };
};
