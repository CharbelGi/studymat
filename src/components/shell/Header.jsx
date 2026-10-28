import React, { useState, useEffect } from 'react';
import { Menu, Plus, LogOut } from 'lucide-react';

export const Header = ({ 
  onOpenModal, 
  onLogout, 
  userName = "Fernando", 
  userRole = "Estudiante" 
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    const formatted = date.toLocaleDateString('es-ES', options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1).replace('.', '');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { hour12: false });
  };

  const limpiarNombre = (nombreOEmail) => {
    if (!nombreOEmail) return 'Usuario';
    let base = nombreOEmail.includes('@') ? nombreOEmail.split('@')[0] : nombreOEmail;
    base = base.replace(/[0-9]/g, '');
    return base.charAt(0).toUpperCase() + base.slice(1);
  };

  const nombreCorto = limpiarNombre(userName);

  return (
    <header className="bg-white px-3 px-md-4 py-2 py-md-3 border-bottom shadow-sm">
      <div className="container-fluid d-flex align-items-center justify-content-between flex-wrap gap-2">
        
        {/* Izquierda: Menú, Fecha y Hora */}
        <div className="d-flex align-items-center gap-2 gap-md-3">
          <button className="btn btn-light p-2 border-0 text-secondary rounded-3">
            <Menu size={20} />
          </button>
          
          <div className="d-none d-sm-flex flex-column">
            <small className="text-muted fw-medium lh-1" style={{ fontSize: '0.75rem' }}>
              {formatDate(time)}
            </small>
            <span className="fw-bold text-dark lh-1 mt-1" style={{ fontSize: '0.85rem' }}>
              {formatTime(time)}
            </span>
          </div>
        </div>

        {/* Derecha: Botón Registro, Usuario y Cerrar Sesión */}
        <div className="d-flex align-items-center gap-2 gap-md-3 ms-auto">
          
          <button 
            onClick={onOpenModal}
            className="btn btn-primary d-flex align-items-center gap-1 px-3 py-1.5 py-md-2 rounded-3 fw-semibold shadow-sm"
            style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span className="d-none d-xs-inline">Nuevo Registro</span>
          </button>

          <div className="vr mx-0 d-none d-md-block" style={{ height: '24px', opacity: 0.15 }}></div>

          {/* Perfil de Usuario con Nombre Limpio */}
          <div className="d-flex align-items-center gap-2">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
              style={{ width: '34px', height: '34px', backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '0.9rem' }}
            >
              {nombreCorto.charAt(0).toUpperCase()}
            </div>
            
            <div className="d-none d-md-flex flex-column text-start">
              <span className="fw-bold text-dark lh-1 text-truncate" style={{ fontSize: '0.85rem', maxWidth: '130px' }}>
                {nombreCorto}
              </span>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>{userRole}</small>
            </div>
          </div>

          {/* Botón Cerrar Sesión */}
          {onLogout && (
            <button 
              onClick={onLogout}
              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 px-2.5 py-1.5 rounded-3 fw-semibold ms-1"
              style={{ fontSize: '0.8rem' }}
              title="Cerrar Sesión"
            >
              <LogOut size={15} />
              <span className="d-none d-lg-inline">Salir</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};