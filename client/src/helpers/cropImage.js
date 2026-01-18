export const getCroppedImg = (imageSrc, cropArea) => {
    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
            img.src = url;
        });

    return new Promise((resolve, reject) => {
        (async () => {
            try {
                const image = await createImage(imageSrc);

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                // react-easy-crop ya entrega estos valores en pixeles
                const MAX_DIMENSION = 1080;
                let width = cropArea.width;
                let height = cropArea.height;

                // Calcular nuevas dimensiones si superan el máximo
                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    const ratio = width / height;
                    if (width > height) {
                        width = MAX_DIMENSION;
                        height = MAX_DIMENSION / ratio;
                    } else {
                        height = MAX_DIMENSION;
                        width = MAX_DIMENSION * ratio;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(
                    image,
                    cropArea.x,
                    cropArea.y,
                    cropArea.width,
                    cropArea.height,
                    0,
                    0,
                    width,
                    height
                );

                canvas.toBlob((blob) => {
                    if (!blob) reject(new Error("Blob vacío"));
                    else resolve(blob);
                }, "image/jpeg");
            } catch (err) {
                reject(err);
            }
        })();
    });
};
