import { useState, useCallback, useEffect, useRef } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../helpers/cropImage.js";
import { uploadCroppedImage } from "../../api/cloudinary.js";
import { validateImageFile } from "../../utils/nsfwDetector.js";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import NSFWAnalysisModal from "../UI/NSFWAnalysisModal";
import { Camera } from "lucide-react";
import "./UpdateMultipleImagesWithCrop.css";

function UpdateMultipleImagesWithCrop({ uid, initialImages = [], onImagesChange, onDirectUpdate, maxImages = 9 }) {
    const [images, setImages] = useState(initialImages);
    const fileInputRef = useRef(null);

    // Notificar al padre cuando cambian las imágenes
    useEffect(() => {
        if (onImagesChange) {
            onImagesChange(images);
        }
    }, [images, onImagesChange]);

    const [originalFile, setOriginalFile] = useState(null);
    const [previewURL, setPreviewURL] = useState(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppingMode, setCroppingMode] = useState(false);
    const [loading, setLoading] = useState(false);

    // NSFW Analysis states
    const [nsfwAnalyzing, setNsfwAnalyzing] = useState(false);
    const [nsfwStatus, setNsfwStatus] = useState(null); // 'analyzing', 'approved', 'rejected', 'error'
    const [nsfwResult, setNsfwResult] = useState(null);

    const onFileChange = async (e) => {
        if (images.length >= maxImages) {
            alert(`Solo se permiten ${maxImages} fotos.`);
            return;
        }

        const file = e.target.files[0];
        if (!file) return;

        // Reset input value to allow selecting the same file again if needed
        e.target.value = null;

        // Analizar imagen con NSFW detector
        setNsfwAnalyzing(true);
        setNsfwStatus('analyzing');

        try {
            const result = await validateImageFile(file);

            if (result.isSafe) {
                // Imagen aprobada - mostrar cropper
                setNsfwStatus('approved');
                setOriginalFile(file);
                setPreviewURL(URL.createObjectURL(file));

                // Pequeño delay para mostrar el mensaje de éxito
                setTimeout(() => {
                    setNsfwAnalyzing(false);
                    setCroppingMode(true);
                }, 1500);
            } else {
                // Imagen rechazada
                setNsfwStatus('rejected');
                setNsfwResult(result);
            }
        } catch (error) {
            console.error('Error al analizar imagen:', error);
            setNsfwStatus('error');
            setNsfwResult({ reason: 'Error al verificar la imagen' });
        }
    };

    const onCropComplete = useCallback((_, areaPixels) => {
        setCroppedAreaPixels(areaPixels);
    }, []);

    const uploadCropped = async () => {
        if (!originalFile || !croppedAreaPixels) {
            console.log("Faltan datos para recortar");
            return;
        }

        setLoading(true);

        try {
            const toBase64 = (file) =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

            const base64Image = await toBase64(originalFile);
            const blob = await getCroppedImg(base64Image, croppedAreaPixels);

            if (!blob) {
                throw new Error("El recorte devolvió un blob vacío.");
            }

            const url = await uploadCroppedImage(blob, uid);

            const newImages = [...images, url];
            setImages(newImages);

            // Actualización inmediata en Firestore si se proporciona la función
            if (onDirectUpdate) {
                await onDirectUpdate(newImages);
            }

            handleCloseModal();

        } catch (err) {
            console.error("Error al procesar recorte:", err);
            alert("Error al subir la imagen. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setCroppingMode(false);
        setPreviewURL(null);
        setOriginalFile(null);
        setCroppedAreaPixels(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setNsfwAnalyzing(false);
        setNsfwStatus(null);
        setNsfwResult(null);
    };

    const handleCloseNSFWModal = () => {
        // Solo cerrar el modal NSFW sin resetear los datos del archivo
        setNsfwAnalyzing(false);
        setNsfwStatus(null);
        setNsfwResult(null);
    };

    const handleDeleteImage = async (indexToDelete) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar esta foto?")) {
            const newImages = images.filter((_, index) => index !== indexToDelete);
            setImages(newImages);

            // Actualización inmediata en Firestore si se proporciona la función
            if (onDirectUpdate) {
                await onDirectUpdate(newImages);
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="image-upload-container">
            {/* Hidden File Input */}
            <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                disabled={images.length >= maxImages}
                className="file-input"
                ref={fileInputRef}
            />

            {/* Upload Button */}
            {images.length < maxImages && (
                <div className="upload-btn-wrapper">
                    <button
                        className="upload-btn"
                        onClick={triggerFileInput}
                        type="button"
                    >
                        <Camera size={32} className="upload-icon" />
                        <span>Agregar Foto ({images.length}/{maxImages})</span>
                    </button>
                </div>
            )}

            {/* Image Grid */}
            <div className="image-grid">
                {images.map((img, i) => (
                    <div key={i} className="image-preview-card">
                        <img src={img} alt={`Foto ${i + 1}`} />
                        <button
                            className="delete-btn"
                            onClick={() => handleDeleteImage(i)}
                            type="button"
                            aria-label="Eliminar foto"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>

            {/* Crop Modal */}
            <Modal
                isOpen={croppingMode}
                onClose={handleCloseModal}
                title="Recortar Imagen"
            >
                <div className="cropper-container">
                    <Cropper
                        image={previewURL}
                        crop={crop}
                        zoom={zoom}
                        aspect={3 / 4} // Standard portrait ratio for dating apps
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                <div className="zoom-controls">
                    <span>-</span>
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(e.target.value)}
                        className="zoom-slider"
                    />
                    <span>+</span>
                </div>

                <div className="cropper-actions">
                    <Button
                        onClick={handleCloseModal}
                        variant="secondary"
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={uploadCropped}
                        disabled={loading}
                    >
                        {loading ? "Subiendo..." : "Confirmar y Subir"}
                    </Button>
                </div>
            </Modal>

            {/* NSFW Analysis Modal */}
            <NSFWAnalysisModal
                isOpen={nsfwAnalyzing}
                status={nsfwStatus}
                result={nsfwResult}
                onClose={handleCloseNSFWModal}
                onRetry={triggerFileInput}
            />
        </div>
    );
}

export default UpdateMultipleImagesWithCrop;
