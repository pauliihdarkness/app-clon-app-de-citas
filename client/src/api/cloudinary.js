import imageCompression from "browser-image-compression";

export async function uploadCroppedImage(fileBlob, uid) {
    if (!fileBlob) throw new Error("No se recibió imagen recortada.");
    if (!uid) throw new Error("No se recibió UID.");

    const urlStorage = import.meta.env.VITE_URL_STORAGE;
    const presetName = import.meta.env.VITE_PRESET_NAME;
    const cloudName = import.meta.env.VITE_CLOUD_NAME;

    // Comprimir el recorte
    const compressed = await imageCompression(fileBlob, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1500,
    });

    const data = new FormData();
    data.append("file", compressed);
    data.append("upload_preset", presetName);
    data.append("folder", `app-de-citas/users/${uid}`);

    const response = await fetch(`${urlStorage}${cloudName}/image/upload`, {
        method: "POST",
        body: data,
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message);

    return result.secure_url;
}
