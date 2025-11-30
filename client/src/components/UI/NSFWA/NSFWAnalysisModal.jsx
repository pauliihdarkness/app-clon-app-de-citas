import { useEffect } from 'react';
import Modal from '../Modal/Modal';
import './NSFWAnalysisModal.css';

/**
 * Modal para mostrar el estado del análisis NSFW
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {string} status - Estado: 'analyzing', 'approved', 'rejected', 'error'
 * @param {Object} result - Resultado del análisis
 * @param {Function} onClose - Callback al cerrar
 * @param {Function} onRetry - Callback para reintentar
 */
function NSFWAnalysisModal({ isOpen, status, result, onClose, onRetry }) {
    // Auto-cerrar si fue aprobado después de 1.5 segundos
    useEffect(() => {
        if (status === 'approved' && isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [status, isOpen, onClose]);

    const renderContent = () => {
        switch (status) {
            case 'analyzing':
                return (
                    <div className="nsfw-analysis-content">
                        <div className="nsfw-spinner"></div>
                        <h3>Analizando imagen...</h3>
                        <p className="nsfw-description">
                            Verificando que la imagen cumple con nuestras políticas de contenido
                        </p>
                    </div>
                );

            case 'approved':
                return (
                    <div className="nsfw-analysis-content nsfw-success">
                        <div className="nsfw-icon nsfw-icon-success">✓</div>
                        <h3>¡Imagen aprobada!</h3>
                        <p className="nsfw-description">
                            La imagen cumple con nuestras políticas
                        </p>
                    </div>
                );

            case 'rejected':
                return (
                    <div className="nsfw-analysis-content nsfw-error">
                        <div className="nsfw-icon nsfw-icon-error">✗</div>
                        <h3>Imagen rechazada</h3>
                        <p className="nsfw-description">
                            {result?.reason || 'Esta imagen no cumple con nuestras políticas de contenido'}
                        </p>
                        <p className="nsfw-hint">
                            Por favor, selecciona una imagen apropiada para tu perfil
                        </p>
                        <div className="nsfw-actions">
                            <button
                                className="nsfw-btn nsfw-btn-primary"
                                onClick={onRetry}
                            >
                                Intentar con otra imagen
                            </button>
                            <button
                                className="nsfw-btn nsfw-btn-secondary"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                );

            case 'error':
                return (
                    <div className="nsfw-analysis-content nsfw-error">
                        <div className="nsfw-icon nsfw-icon-error">⚠</div>
                        <h3>Error al analizar</h3>
                        <p className="nsfw-description">
                            No se pudo verificar la imagen. Por favor, intenta de nuevo.
                        </p>
                        <div className="nsfw-actions">
                            <button
                                className="nsfw-btn nsfw-btn-primary"
                                onClick={onRetry}
                            >
                                Reintentar
                            </button>
                            <button
                                className="nsfw-btn nsfw-btn-secondary"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={status === 'analyzing' ? undefined : onClose}
            title=""
            className="nsfw-analysis-modal"
        >
            {renderContent()}
        </Modal>
    );
}

export default NSFWAnalysisModal;
