export const getCroppedImg = (imageSrc, cropArea) => {
    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
            img.src = url;
        });

    return new Promise(async (resolve, reject) => {
        try {
            const image = await createImage(imageSrc);

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // react-easy-crop ya entrega estos valores en pixeles
            canvas.width = cropArea.width;
            canvas.height = cropArea.height;

            ctx.drawImage(
                image,
                cropArea.x,
                cropArea.y,
                cropArea.width,
                cropArea.height,
                0,
                0,
                cropArea.width,
                cropArea.height
            );

            canvas.toBlob((blob) => {
                if (!blob) reject(new Error("Blob vacío"));
                else resolve(blob);
            }, "image/jpeg");
        } catch (err) {
            reject(err);
        }
    });
};
