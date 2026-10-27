import React from 'react';
import { CheckSquare, FileText, Folder } from 'lucide-react';
import ClimaCompacto from '../components/ClimaCompacto';

// Skeleton exclusivo para el área de contenido
export const DashboardHeaderSkeleton = () => {
  return (
    <div className="w-100 placeholder-glow">
      <div 
        className="rounded-4 p-4 p-md-5 mb-4 shadow-sm bg-secondary bg-opacity-10"
        style={{ borderRadius: '1.5rem', minHeight: '180px' }}
      >
        <span className="placeholder rounded-pill col-2 mb-3" style={{ height: '24px', width: '140px' }}></span>
        <div className="placeholder col-6 mb-3 d-block" style={{ height: '32px' }}></div>
        <div className="placeholder col-8 d-block" style={{ height: '18px' }}></div>
      </div>

      <div className="row g-3">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
              <div className="card-body d-flex justify-content-between align-items-start p-2">
                <div className="w-75">
                  <span className="placeholder col-7 d-block mb-2" style={{ height: '12px' }}></span>
                  <span className="placeholder col-4 d-block mt-3" style={{ height: '32px' }}></span>
                </div>
                <span className="placeholder rounded-3" style={{ width: '48px', height: '48px' }}></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente DashboardHeader Real con el Clima Integrado
export const DashboardHeader = ({ 
  userName = "Fernando", 
  urgentCount = 2, 
  pendingTasks = 2, 
  upcomingExams = 1, 
  activeProjects = 1 
}) => {
  return (
    <div className="w-100">
      
      {/* Banner Principal Morado */}
      <div 
        className="position-relative overflow-hidden text-white rounded-4 p-4 p-md-5 mb-4 shadow-sm"
        style={{ 
          background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
          borderRadius: '1.5rem'
        }}
      >
        <div className="position-relative z-1" style={{ maxWidth: '600px' }}>
          <span className="badge bg-white bg-opacity-20 text-white rounded-pill px-3 py-2 mb-3 fw-semibold">
            Panel del Estudiante
          </span>
          <h1 className="fw-bold display-6 mb-2">
            ¡Hola de nuevo, {userName}! 👋
          </h1>
          <p className="text-white-50 fs-6 mb-0">
            Tienes <strong className="text-white text-decoration-underline" style={{ textDecorationColor: '#facc15' }}>{urgentCount} pendientes urgentes</strong> para las próximas horas. Revisa tu agenda para mantenerte al día.
          </p>
        </div>

        <div 
          className="position-absolute end-0 bottom-0 opacity-10 pe-none"
          style={{ transform: 'translate(10%, 20%)' }}
        >
          <svg width="280" height="280" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
      </div>

      {/* Tarjetas de Métricas + Clima Compacto */}
      <div className="row g-3">
        
        {/* Tareas Pendientes */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
            <div className="card-body d-flex justify-content-between align-items-start p-2">
              <div>
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Tareas Pendientes
                </small>
                <div className="d-flex align-items-baseline gap-2 mt-2">
                  <span className="fs-2 fw-bold text-dark">{pendingTasks}</span>
                  <small className="text-muted">por entregar</small>
                </div>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-3">
                <CheckSquare size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Próximos Exámenes */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
            <div className="card-body d-flex justify-content-between align-items-start p-2">
              <div>
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Próximos Exámenes
                </small>
                <div className="d-flex align-items-baseline gap-2 mt-2">
                  <span className="fs-2 fw-bold text-dark">{upcomingExams}</span>
                  <small className="text-muted">programados</small>
                </div>
              </div>
              <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-3">
                <FileText size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Proyectos Activos */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
            <div className="card-body d-flex justify-content-between align-items-start p-2">
              <div>
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Proyectos Activos
                </small>
                <div className="d-flex align-items-baseline gap-2 mt-2">
                  <span className="fs-2 fw-bold text-dark">{activeProjects}</span>
                  <small className="text-muted">en desarrollo</small>
                </div>
              </div>
              <div className="p-3 rounded-3" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                <Folder size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Widget del Clima Compacto */}
        <div className="col-12 col-sm-6 col-xl-3">
          <ClimaCompacto />
        </div>

      </div>
    </div>
  );
};