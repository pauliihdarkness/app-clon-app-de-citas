// Funciones de geolocalización
// Aquí puedes implementar funciones para manejar la ubicación del usuario.

/**
 * Obtiene la ubicación inicial del usuario (ciudad, provincia y país)
 * No devuelve coordenadas exactas para privacidad
 * Utiliza la API de geolocalización y un servicio de reverse geocoding
 */
export const getInitialLocation = async () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject("Geolocalización no soportada");
            return;
        }
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Usar una API pública de reverse geocoding (ejemplo: OpenStreetMap Nominatim)
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                // Extraer ciudad, provincia y país
                const ciudad = data.address.city || data.address.town || data.address.village || "";
                const provincia = data.address.state || "";
                const pais = data.address.country || "";
                resolve({ ciudad, provincia, pais });
            } catch (err) {
                reject("No se pudo obtener la ubicación");
            }
        }, (error) => {
            reject("Permiso de ubicación denegado");
        }, { enableHighAccuracy: false, timeout: 10000 });
    });
};