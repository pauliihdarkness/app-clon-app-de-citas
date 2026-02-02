import React, { useEffect, useRef, useState } from 'react';
import { useGestureDetection } from '../../hooks/useGestureDetection';
import './GestureDetection.css';

const GestureDetection = ({ gestureType, userId, onSuccess, onError, onCancel }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [permission, setPermission] = useState('pending');
    const [countdown, setCountdown] = useState(3);
    const [isRecording, setIsRecording] = useState(false);
    const [progress, setProgress] = useState(0);
    const { detectGesture, isDetecting } = useGestureDetection(gestureType);

    const gestureLabels = {
        smile: 'Sonrisa',
        blink: 'Parpadeo',
        nod: 'Asentimiento',
        headShake: 'Negación'
    };

    const gestureInstructions = {
        smile: '¡Sonríe naturalmente a la cámara!',
        blink: '¡Parpadea dos o tres veces claramente!',
        nod: '¡Mueve tu cabeza hacia arriba y hacia abajo!',
        headShake: '¡Mueve tu cabeza de un lado al otro!'
    };

    // Solicitar acceso a la cámara
    useEffect(() => {
        const requestCameraAccess = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user' }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setPermission('granted');
            } catch (error) {
                console.error('Error al acceder a la cámara:', error);
                setPermission('denied');
                onError('No se puede acceder a la cámara. Verifica los permisos.');
            }
        };

        requestCameraAccess();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, [onError]);

    // Contador regresivo antes de empezar
    useEffect(() => {
        if (countdown > 0 && !isRecording) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }

        if (countdown === 0 && !isRecording) {
            setIsRecording(true);
            startGestureDetection();
        }
    }, [countdown, isRecording]);

    // Tiempo máximo de grabación (5 segundos)
    useEffect(() => {
        let timer;
        if (isRecording && progress < 5000) {
            timer = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev + 100;
                    if (newProgress >= 5000) {
                        completeRecording();
                    }
                    return newProgress;
                });
            }, 100);
        }
        return () => clearInterval(timer);
    }, [isRecording, progress]);

    const startGestureDetection = async () => {
        if (videoRef.current && canvasRef.current) {
            try {
                const result = await detectGesture(videoRef.current, canvasRef.current);
                if (result.detected) {
                    onSuccess({
                        gestureType,
                        userId,
                        timestamp: new Date().toISOString(),
                        confidence: result.confidence
                    });
                } else {
                    onError('No se detectó el gesto. Intenta de nuevo.');
                }
            } catch (error) {
                console.error('Error detectando gesto:', error);
                onError('Error al procesar el gesto. Intenta de nuevo.');
            }
        }
    };

    const completeRecording = () => {
        setIsRecording(false);
        startGestureDetection();
    };

    const handleCancel = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        onCancel();
    };

    if (permission === 'denied') {
        return (
            <div className="gesture-detection-error">
                <h2>Acceso a cámara denegado</h2>
                <p>Se requiere acceso a la cámara para completar la verificación.</p>
                <button onClick={handleCancel}>Volver</button>
            </div>
        );
    }

    return (
        <div className="gesture-detection-container">
            <div className="gesture-header">
                <h2>{gestureLabels[gestureType]}</h2>
                <p>{gestureInstructions[gestureType]}</p>
            </div>

            <div className="camera-container">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="camera-feed"
                />
                <canvas
                    ref={canvasRef}
                    className="gesture-canvas"
                    style={{ display: 'none' }}
                />

                {!isRecording && countdown > 0 && (
                    <div className="countdown">
                        <span className="countdown-number">{countdown}</span>
                    </div>
                )}

                {isRecording && (
                    <div className="recording-indicator">
                        <div className="recording-dot"></div>
                        <span>Grabando...</span>
                    </div>
                )}
            </div>

            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${(progress / 5000) * 100}%` }}
                ></div>
            </div>

            <div className="gesture-tips">
                <h4>Consejos:</h4>
                <ul>
                    <li>Asegúrate de que tu rostro esté bien iluminado</li>
                    <li>Mira directamente a la cámara</li>
                    <li>Realiza el gesto de forma clara y natural</li>
                    <li>Tienes 5 segundos para completar el gesto</li>
                </ul>
            </div>

            <button className="cancel-button" onClick={handleCancel} disabled={isDetecting}>
                Cancelar
            </button>
        </div>
    );
};

export default GestureDetection;
