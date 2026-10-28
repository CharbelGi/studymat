import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';

export default function NotificationFloating({ pendingUrgentCount = 0 }) {
  const [mostrarPanel, setMostrarPanel] = useState(false);

  return (
    <div 
      className="position-fixed bottom-0 end-0 p-3 z-3"
      style={{ zIndex: 1050 }}
    >
      {/* Popover/Panel flotante de notificaciones cuando se presiona */}
      {mostrarPanel && (
        <div className="card border-0 shadow-lg rounded-4 mb-2 p-3 bg-white" style={{ width: '280px' }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold m-0 text-dark">Notificaciones</h6>
            <button className="btn btn-sm btn-light p-1 rounded-circle" onClick={() => setMostrarPanel(false)}>
              <X size={14} />
            </button>
          </div>
          <div className="small text-muted">
            {pendingUrgentCount > 0 ? (
              <p className="m-0 text-dark">
                ⚠️ Tienes <strong className="text-danger">{pendingUrgentCount} actividades</strong> con fecha de entrega próxima.
              </p>
            ) : (
              <p className="m-0">🎉 ¡Estás al día! No tienes actividades urgentes pendientes.</p>
            )}
          </div>
        </div>
      )}

      {/* Botón Flotante Fijo (FAB) */}
      <button
        onClick={() => setMostrarPanel(!mostrarPanel)}
        className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center p-0 position-relative border-0"
        style={{ 
          width: '54px', 
          height: '54px', 
          backgroundColor: '#4f46e5',
          boxShadow: '0px 4px 15px rgba(79, 70, 229, 0.4)'
        }}
        title="Ver notificaciones"
      >
        <Bell size={24} className="text-white" />
        
        {/* Badge de contador de urgentes */}
        {pendingUrgentCount > 0 && (
          <span 
            className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger border border-2 border-white d-flex align-items-center justify-content-center"
            style={{ width: '22px', height: '22px', fontSize: '0.7rem' }}
          >
            {pendingUrgentCount}
          </span>
        )}
      </button>
    </div>
  );
}