import React, { useState, useEffect } from 'react';
import { Menu, Plus, Bell } from 'lucide-react';

export const Header = ({ onOpenModal, pendingUrgentCount = 2, userName = "Fernando", userRole = "Estudiante" }) => {
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

  return (
    <header className="bg-white px-4 py-3 border-bottom shadow-sm">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        
        {/* Lado Izquierdo: Menú, Fecha y Hora */}
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-light p-2 border-0 text-secondary">
            <Menu size={22} />
          </button>
          <div className="d-flex flex-column">
            <small className="text-muted fw-medium lh-1" style={{ fontSize: '0.8rem' }}>
              {formatDate(time)}
            </small>
            <span className="fw-bold text-dark lh-1 mt-1" style={{ fontSize: '0.95rem' }}>
              {formatTime(time)}
            </span>
          </div>
        </div>

        {/* Lado Derecho: Acciones y Usuario */}
        <div className="d-flex align-items-center gap-3">
          <button 
            onClick={onOpenModal}
            className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold shadow-sm"
            style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5' }}
          >
            <Plus size={18} />
            <span>Nuevo Registro</span>
          </button>

          <div className="position-relative">
            <button className="btn btn-light p-2 border-0 text-secondary rounded-3 position-relative">
              <Bell size={20} />
              {pendingUrgentCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                  <span className="visually-hidden">Alertas</span>
                </span>
              )}
            </button>
          </div>

          <div className="vr mx-1" style={{ height: '24px', opacity: 0.15 }}></div>

          {/* Perfil de Usuario */}
          <div className="d-flex align-items-center gap-2">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center fw-bold"
              style={{ width: '38px', height: '38px', backgroundColor: '#e0e7ff', color: '#4338ca' }}
            >
              {userName.charAt(0)}
            </div>
            <div className="d-flex flex-column text-start">
              <span className="fw-bold text-dark lh-1" style={{ fontSize: '0.875rem' }}>{userName}</span>
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>{userRole}</small>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};