import { useState, useEffect } from 'react';
import { Bell, X, Sparkles } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function NotificationFloating({ pendingUrgentCount = 0 }) {
  const [mostrarPanel, setMostrarPanel] = useState(false);

  const {
    needRefresh: [hayVersionNueva],
    updateServiceWorker,
  } = useRegisterSW();

  // Cuando se detecta una nueva versión, abre automáticamente el panel de notificaciones
  useEffect(() => {
    if (hayVersionNueva) {
      setMostrarPanel(true);
    }
  }, [hayVersionNueva]);

  const totalAvisos = pendingUrgentCount + (hayVersionNueva ? 1 : 0);

  return (
    <div
      className="position-fixed bottom-0 end-0 p-3 z-3"
      style={{ zIndex: 1050 }}
    >
      {/* Panel de Notificaciones (todo aparece AQUÍ ADENTRO) */}
      {mostrarPanel && (
        <div
          className="card border-0 shadow-lg rounded-4 mb-2 p-3 bg-white"
          style={{ width: '300px' }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold m-0 text-dark">Notificaciones</h6>
            <button
              type="button"
              className="btn btn-sm btn-light p-1 rounded-circle"
              onClick={() => setMostrarPanel(false)}
              aria-label="Cerrar notificaciones"
            >
              <X size={14} />
            </button>
          </div>

          <div className="d-flex flex-column gap-2 small">
            {/* 1. Aviso de nueva versión DENTRO de Notificaciones */}
            {hayVersionNueva && (
              <div
                className="p-2 rounded-3"
                style={{
                  backgroundColor: '#f3f4ff',
                  border: '1px solid #e0e2ff',
                }}
              >
                <div className="d-flex align-items-center gap-1 fw-semibold text-dark mb-1">
                  <Sparkles size={14} style={{ color: '#4f46e5' }} />
                  <span>Nueva versión disponible</span>
                </div>
                <p className="text-muted mb-2" style={{ fontSize: '0.78rem', lineHeight: 1.35 }}>
                  Actualiza ahora para obtener los últimos cambios y mejoras.
                </p>
                <div className="d-flex justify-content-end gap-1">
                  <button
                    type="button"
                    className="btn btn-sm btn-light border py-0 px-2"
                    style={{ fontSize: '0.75rem', borderRadius: '8px' }}
                    onClick={() => setMostrarPanel(false)}
                  >
                    Después
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm text-white fw-semibold py-0 px-2"
                    style={{
                      fontSize: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#4f46e5',
                    }}
                    onClick={() => updateServiceWorker(true)}
                  >
                    Actualizar
                  </button>
                </div>
              </div>
            )}

            {/* 2. Tu notificación habitual (sigue apareciendo siempre) */}
            <div className="text-muted">
              {pendingUrgentCount > 0 ? (
                <p className="m-0 text-dark">
                  ⚠️ Tienes <strong className="text-danger">{pendingUrgentCount} actividades</strong> con fecha de entrega próxima.
                </p>
              ) : (
                <p className="m-0">
                  🎉 ¡Estás al día! No tienes actividades urgentes pendientes.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Botón Flotante de la Campanita Morada */}
      <div className="d-flex justify-content-end">
        <button
          type="button"
          onClick={() => setMostrarPanel(!mostrarPanel)}
          className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center p-0 position-relative border-0"
          style={{
            width: '54px',
            height: '54px',
            backgroundColor: '#4f46e5',
            boxShadow: '0px 4px 15px rgba(79, 70, 229, 0.4)',
          }}
          title="Ver notificaciones"
        >
          <Bell size={24} className="text-white" />

          {totalAvisos > 0 && (
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger border border-2 border-white d-flex align-items-center justify-content-center"
              style={{ width: '22px', height: '22px', fontSize: '0.7rem' }}
            >
              {totalAvisos}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}