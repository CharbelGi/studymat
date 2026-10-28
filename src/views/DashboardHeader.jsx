import React from 'react';
import { CheckSquare, FileText, Folder } from 'lucide-react';
import ClimaCompacto from '../components/ClimaCompacto';

// Skeleton exclusivo para el área de contenido
export const DashboardHeaderSkeleton = () => {
  return (
    <div className="w-100 placeholder-glow">
      <div 
        className="rounded-4 p-3 p-md-4 mb-3 shadow-sm bg-secondary bg-opacity-10"
        style={{ borderRadius: '1.25rem', minHeight: '150px' }}
      >
        <span className="placeholder rounded-pill col-4 mb-2" style={{ height: '20px', width: '120px' }}></span>
        <div className="placeholder col-8 mb-2 d-block" style={{ height: '28px' }}></div>
        <div className="placeholder col-10 d-block" style={{ height: '16px' }}></div>
      </div>

      <div className="row g-3">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 p-2 h-100">
              <div className="card-body d-flex justify-content-between align-items-center p-2">
                <div className="w-75">
                  <span className="placeholder col-7 d-block mb-1" style={{ height: '10px' }}></span>
                  <span className="placeholder col-5 d-block mt-2" style={{ height: '24px' }}></span>
                </div>
                <span className="placeholder rounded-3" style={{ width: '36px', height: '36px' }}></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente DashboardHeader Real
export const DashboardHeader = ({ 
  userName = "Fernando", 
  urgentCount = 0, 
  pendingTasks = 0, 
  upcomingExams = 0, 
  activeProjects = 0 
}) => {
  // Limpia el correo para mostrar sólo el nombre de usuario
  const nombreCorto = userName.includes('@') ? userName.split('@')[0] : userName;

  return (
    <div className="w-100 px-2 px-md-0">
      
      {/* Banner Principal del Dashboard */}
      <div 
        className="position-relative overflow-hidden text-white rounded-4 p-4 mb-4 shadow-sm"
        style={{ 
          background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
          borderRadius: '1.25rem'
        }}
      >
        <div className="position-relative z-1">
          <span className="badge bg-white bg-opacity-20 text-white rounded-pill px-3 py-1 mb-2 fw-semibold" style={{ fontSize: '0.75rem' }}>
            Panel del Estudiante
          </span>
          <h1 className="fw-bold fs-3 mb-2 text-break">
            ¡Hola, {nombreCorto}! 👋
          </h1>
          <p className="text-white-50 small mb-0">
            Tienes <strong className="text-white text-decoration-underline" style={{ textDecorationColor: '#facc15' }}>{urgentCount} pendientes urgentes</strong> para hoy.
          </p>
        </div>
      </div>

      {/* Cuadrícula de Métricas y Clima (1 columna en cel, 2 en tablet, 4 horizontales en laptop) */}
      <div className="row g-3">
        
        {/* Tareas Pendientes */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
            <div className="card-body d-flex justify-content-between align-items-center p-2">
              <div>
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Tareas Pendientes
                </small>
                <div className="d-flex align-items-baseline gap-2 mt-2">
                  <span className="fs-2 fw-bold text-dark">{pendingTasks}</span>
                  <small className="text-muted" style={{ fontSize: '0.8rem' }}>por entregar</small>
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
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
            <div className="card-body d-flex justify-content-between align-items-center p-2">
              <div>
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Próximos Exámenes
                </small>
                <div className="d-flex align-items-baseline gap-2 mt-2">
                  <span className="fs-2 fw-bold text-dark">{upcomingExams}</span>
                  <small className="text-muted" style={{ fontSize: '0.8rem' }}>programados</small>
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
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
            <div className="card-body d-flex justify-content-between align-items-center p-2">
              <div>
                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Proyectos Activos
                </small>
                <div className="d-flex align-items-baseline gap-2 mt-2">
                  <span className="fs-2 fw-bold text-dark">{activeProjects}</span>
                  <small className="text-muted" style={{ fontSize: '0.8rem' }}>en desarrollo</small>
                </div>
              </div>
              <div className="p-3 rounded-3" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                <Folder size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Widget de Clima Compacto */}
        <div className="col-12 col-sm-6 col-xl-3">
          <ClimaCompacto />
        </div>

      </div>
    </div>
  );
};