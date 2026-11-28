import { useRegisterSW } from 'virtual:pwa-register/react';

// Registra el service worker y avisa cuando hay una versión nueva
export default function AvisoActualizacion() {
  const {
    needRefresh: [hayVersionNueva, setHayVersionNueva],
    updateServiceWorker,
  } = useRegisterSW();

  if (!hayVersionNueva) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="position-fixed end-0 bg-white border border-light-subtle p-3 p-sm-4"
      style={{
        bottom: '96px',
        right: '24px',
        zIndex: 1080,
        maxWidth: '360px',
        width: 'calc(100% - 2rem)',
        borderRadius: '16px',
        boxShadow: '0 14px 34px rgba(15, 23, 42, 0.14)',
      }}
    >
      <div className="d-flex align-items-start gap-3">
        <div
          className="d-flex align-items-center justify-content-center flex-shrink-0 text-white fw-bold"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            fontSize: '0.95rem',
          }}
          aria-hidden="true"
        >
          ↑
        </div>

        <div className="flex-grow-1">
          <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
            <span
              className="badge rounded-pill px-2 py-1"
              style={{
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                color: '#4f46e5',
                fontSize: '0.72rem',
                fontWeight: 600,
              }}
            >
              Nueva versión
            </span>
          </div>

          <p className="fw-semibold text-dark mb-1" style={{ fontSize: '0.95rem' }}>
            Hay una versión nueva de la app.
          </p>
          <p className="text-muted small mb-3" style={{ lineHeight: 1.4 }}>
            Actualiza ahora para obtener los últimos cambios y mejoras.
          </p>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-light border btn-sm px-3 fw-medium text-secondary"
              style={{ borderRadius: '10px' }}
              onClick={() => setHayVersionNueva(false)}
            >
              Después
            </button>
            <button
              type="button"
              className="btn btn-sm px-3 fw-semibold text-white"
              style={{
                borderRadius: '10px',
                backgroundColor: '#4f46e5',
                borderColor: '#4f46e5',
              }}
              onClick={() => updateServiceWorker(true)}
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}