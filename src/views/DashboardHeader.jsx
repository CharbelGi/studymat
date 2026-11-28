import { CheckSquare, FileText, Folder, Plus } from 'lucide-react';
import ClimaCompacto from '../components/ClimaCompacto';
import { ListaTareas } from '../components/ListaTareas'; // 👈 Importación nombrada con llaves exactas

const FONT_DASHBOARD = {
  fontFamily:
    "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
};

export const DashboardHeaderSkeleton = () => {
  return (
    <div className="w-100 placeholder-glow" style={FONT_DASHBOARD}>
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

export const DashboardHeader = ({
  userName = 'Fernando',
  urgentCount = 0,
  pendingTasks = 0,
  upcomingExams = 0,
  activeProjects = 0,
  onOpenModal,
}) => {
  const nombreCorto = userName.includes('@') ? userName.split('@')[0] : userName;

  return (
    <div className="w-100 px-2 px-md-0" style={FONT_DASHBOARD}>
      <div
        className="position-relative overflow-hidden text-white rounded-4 p-4 mb-4 shadow-sm d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
          borderRadius: '1.25rem',
        }}
      >
        <div className="position-relative z-1">
          <span
            className="badge bg-white bg-opacity-20 text-white rounded-pill px-3 py-1 mb-2 fw-semibold"
            style={{ fontSize: '0.78rem' }}
          >
            Panel del Estudiante
          </span>
          <h1 className="fw-bold fs-3 mb-2 text-break">
            ¡Hola bienvenidos, {nombreCorto}! 👋
          </h1>
          <p className="mb-0" style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.92rem' }}>
            Tienes{' '}
            <strong
              className="text-white text-decoration-underline"
              style={{ textDecorationColor: '#facc15' }}
            >
              {urgentCount} pendientes urgentes
            </strong>{' '}
            para hoy.
          </p>
        </div>

        {onOpenModal && (
          <button
            type="button"
            onClick={onOpenModal}
            className="btn rounded-3 px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm flex-shrink-0 position-relative z-1"
            style={{
              backgroundColor: '#ffffff',
              color: '#4338ca',
              borderColor: '#ffffff',
              fontSize: '0.9rem',
            }}
          >
            <Plus size={18} />
            <span>Nueva actividad</span>
          </button>
        )}
      </div>

      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
            <div className="card-body d-flex justify-content-between align-items-center p-2">
              <div>
                <small
                  className="text-muted fw-bold text-uppercase"
                  style={{ fontSize: '0.74rem', letterSpacing: '0.03em' }}
                >
                  Tareas Pendientes
                </small>
                <div className="d-flex align-items-baseline gap-2 mt-2">
                  <span className="fs-2 fw-bold text-dark">{pendingTasks}</span>
                  <small className="text-muted" style={{ fontSize: '0.84rem' }}>
                    por entregar
                  </small>
                </div>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-3">
                <CheckSquare size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
            <div className="card-body d-flex justify-content-between align-items-center p-2">
              <div>
                <small
                  className="text-muted fw-bold text-uppercase"
                  style={{ fontSize: '0.74rem', letterSpacing: '0.03em' }}
                >
                  Próximos Exámenes
                </small>
                <div className="d-flex align-items-baseline gap-2 mt-2">
                  <span className="fs-2 fw-bold text-dark">{upcomingExams}</span>
                  <small className="text-muted" style={{ fontSize: '0.84rem' }}>
                    programados
                  </small>
                </div>
              </div>
              <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-3">
                <FileText size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
            <div className="card-body d-flex justify-content-between align-items-center p-2">
              <div>
                <small
                  className="text-muted fw-bold text-uppercase"
                  style={{ fontSize: '0.74rem', letterSpacing: '0.03em' }}
                >
                  Proyectos Activos
                </small>
                <div className="d-flex align-items-baseline gap-2 mt-2">
                  <span className="fs-2 fw-bold text-dark">{activeProjects}</span>
                  <small className="text-muted" style={{ fontSize: '0.84rem' }}>
                    en desarrollo
                  </small>
                </div>
              </div>
              <div className="p-3 rounded-3" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                <Folder size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <ClimaCompacto />
        </div>
      </div>

      {/* 🚀 Renderizado de tu lista de tareas con códigos de color de urgencia */}
      <ListaTareas />
    </div>
  );
};