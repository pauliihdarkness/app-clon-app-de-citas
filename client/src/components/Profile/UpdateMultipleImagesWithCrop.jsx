import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../helpers/cropImage.js";
import { uploadCroppedImage } from "../../api/cloudinary.js";

function UpdateMultipleImagesWithCrop({ uid, initialImages = [], onImagesChange, maxImages = 6 }) {
    const [images, setImages] = useState(initialImages);

    // Notificar al padre cuando cambian las imágenes
    useEffect(() => {
        if (onImagesChange) {
            onImagesChange(images);
        }
    }, [images, onImagesChange]);

    const [originalFile, setOriginalFile] = useState(null);      // <-- Archivo original real
    const [previewURL, setPreviewURL] = useState(null);          // <-- URL de preview
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null); // <-- Antes estaba mal
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppingMode, setCroppingMode] = useState(false);
    const [loading, setLoading] = useState(false);

    const onFileChange = (e) => {
        if (images.length >= maxImages) {
            alert(`Solo se permiten ${maxImages} fotos.`);
            return;
        }

        const file = e.target.files[0];
        if (!file) return;

        setOriginalFile(file);                     // guardamos el archivo real
        setPreviewURL(URL.createObjectURL(file));  // mostramos preview
        setCroppingMode(true);
    };

    // 🔥 ahora guardamos croppedAreaPixels correctamente
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
            // 1. Convertimos FILE a base64 para que recorte bien
            const toBase64 = (file) =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

            const base64Image = await toBase64(originalFile);

            // 2. Recorte funcionando correctamente
            const blob = await getCroppedImg(base64Image, croppedAreaPixels);

            if (!blob) {
                throw new Error("El recorte devolvió un blob vacío.");
            }

            // 3. Subida a Cloudinary
            const url = await uploadCroppedImage(blob, uid);

            setImages((prev) => [...prev, url]);

            // 4. Reset
            setCroppingMode(false);
            setPreviewURL(null);
            setOriginalFile(null);
            setCroppedAreaPixels(null);
            setCrop({ x: 0, y: 0 });
            setZoom(1);

        } catch (err) {
            console.error("Error al procesar recorte:", err);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div>
            <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                disabled={images.length >= maxImages}
            />

            {croppingMode && (
                <>
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            height: "430px",
                            background: "#000",
                            marginTop: "10px",
                            overflow: "hidden",
                            borderRadius: "12px"
                        }}
                    >
                        <Cropper
                            image={previewURL}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />

                        {/* Botón dentro del recorte */}
                        <button
                            onClick={uploadCropped}
                            disabled={loading}
                            style={{
                                position: "absolute",
                                bottom: "20px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                padding: "10px 20px",
                                background: "#ffffffcc",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: "600"
                            }}
                        >
                            {loading ? "Subiendo..." : "Confirmar recorte"}
                        </button>
                    </div>

                    {/* Botón afuera del recorte */}
                    <div style={{ textAlign: "center", marginTop: "12px" }}>
                        <button
                            onClick={() => setCroppingMode(false)}
                            style={{
                                padding: "8px 16px",
                                background: "#eee",
                                border: "1px solid #ccc",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "14px"
                            }}
                        >
                            Cancelar
                        </button>
                    </div>
                </>
            )}

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "20px",
                }}
            >
                {images.map((img, i) => (
                    <img
                        key={i}
                        src={img}
                        style={{ width: "120px", borderRadius: "8px" }}
                    />
                ))}
            </div>
        </div>
    );
}

export default UpdateMultipleImagesWithCrop;
