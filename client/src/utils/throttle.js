export function throttle(fn, delay = 1000) {
    let lastCall = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCall < delay) {
            // Optional: throw an error or provide feedback to the user
            console.warn(`Acción demasiado rápida. Intenta de nuevo en ${delay / 1000}s`);
            return;
        }
        lastCall = now;
        return fn(...args);
    };
}
