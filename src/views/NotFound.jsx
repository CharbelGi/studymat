import React from 'react';
import { MapPinOff, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container d-flex flex-column align-items-center justify-content-center py-5 text-center" style={{ minHeight: '65vh' }}>
      <div className="mb-4 text-muted p-4 rounded-circle bg-secondary bg-opacity-10 shadow-sm">
        <MapPinOff size={56} className="text-secondary" />
      </div>
      
      <h2 className="fw-bold text-dark mb-2">Esta página no existe</h2>
      <p className="text-muted mb-4 small" style={{ maxWidth: '320px' }}>
        La ruta que intentaste buscar en la barra de direcciones no es válida o ya no está disponible.
      </p>

      <a 
        href="/" 
        className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-pill fw-semibold shadow-sm text-decoration-none"
        style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5', fontSize: '0.9rem' }}
      >
        <ArrowLeft size={16} />
        <span>Ir a mi inicio</span>
      </a>
    </div>
  );
}