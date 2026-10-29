import React, { useState, useEffect } from 'react';
import { Menu, Plus, Wifi, WifiOff, LogOut, X, Home, Calendar, BookOpen, CheckSquare } from 'lucide-react';

export const Header = ({ 
  onOpenModal, 
  onLogout, 
  userName = "Fernando", 
  userRole = "Estudiante" 
}) => {
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const formatDate = (date) => {
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    const formatted = date.toLocaleDateString('es-ES', options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1).replace('.', '');
  };

  const formatTime = (date) => date.toLocaleTimeString('es-ES', { hour12: false });

  const limpiarNombre = (nombreOEmail) => {
    if (!nombreOEmail) return 'Usuario';
    let base = nombreOEmail.includes('@') ? nombreOEmail.split('@')[0] : nombreOEmail;
    base = base.replace(/[0-9]/g, '');
    return base.charAt(0).toUpperCase() + base.slice(1);
  };

  const nombreCorto = limpiarNombre(userName);

  return (
    <>
      <header className="bg-white px-3 px-md-4 py-2 py-md-3 border-bottom shadow-sm">
        <div className="container-fluid d-flex align-items-center justify-content-between flex-wrap gap-2">
          
          <div className="d-flex align-items-center gap-2 gap-md-3">
            <button 
              onClick={toggleSidebar}
              className="btn btn-light p-2 border-0 text-secondary rounded-3"
              title="Abrir menú"
              aria-label="Abrir menú"
            >
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

          <div className="d-flex align-items-center gap-2 ms-auto">
            <span 
              className={`badge d-flex align-items-center gap-1 px-3 py-2 rounded-pill fw-semibold shadow-sm ${
                isOnline ? 'bg-success text-white' : 'bg-danger text-white'
              }`}
              style={{ fontSize: '0.75rem', transition: 'background-color 0.3s ease' }}
            >
              {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              <span>{isOnline ? 'En línea' : 'Sin conexión'}</span>
            </span>

            <button 
              onClick={onOpenModal}
              className="btn btn-primary d-flex align-items-center gap-1 px-3 py-1.5 py-md-2 rounded-3 fw-semibold shadow-sm"
              style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5', fontSize: '0.85rem' }}
            >
              <Plus size={16} />
              <span className="d-none d-xs-inline">Nuevo Registro</span>
            </button>

            <div className="vr mx-0 d-none d-md-block" style={{ height: '24px', opacity: 0.15 }}></div>

            <div className="d-flex align-items-center gap-2">
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                style={{ width: '34px', height: '34px', backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '0.9rem' }}
              >
                {nombreCorto.charAt(0).toUpperCase()}
              </div>
              
              <div className="d-none d-md-flex flex-column text-start">
                <span className="fw-bold text-dark lh-1 text-truncate" style={{ fontSize: '0.85rem', maxWidth: '120px' }}>
                  {nombreCorto}
                </span>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>{userRole}</small>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Menú Lateral Offcanvas */}
      {isSidebarOpen && (
        <>
          <div 
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50 z-3"
            onClick={toggleSidebar}
          ></div>

          <div 
            className="position-fixed top-0 start-0 h-100 bg-white shadow-lg z-3 d-flex flex-column p-4"
            style={{ width: '280px', transition: 'all 0.3s ease' }}
          >
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
              <div className="d-flex align-items-center gap-2">
                <div className="text-white rounded-3 p-1.5 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#4f46e5' }}>
                  <BookOpen size={20} />
                </div>
                <h5 className="fw-bold mb-0 text-dark">StudyMate</h5>
              </div>
              <button onClick={toggleSidebar} className="btn btn-light btn-sm rounded-circle p-1">
                <X size={18} />
              </button>
            </div>

            <nav className="d-flex flex-column gap-2 flex-grow-1">
              <a href="#" onClick={toggleSidebar} className="btn btn-light d-flex align-items-center gap-3 text-start fw-semibold py-2 px-3 rounded-3 text-primary bg-light border-0">
                <Home size={18} />
                <span>Panel Principal</span>
              </a>
              <a href="#" onClick={toggleSidebar} className="btn btn-light d-flex align-items-center gap-3 text-start fw-semibold py-2 px-3 rounded-3 text-secondary border-0">
                <CheckSquare size={18} />
                <span>Mis Tareas</span>
              </a>
              <a href="#" onClick={toggleSidebar} className="btn btn-light d-flex align-items-center gap-3 text-start fw-semibold py-2 px-3 rounded-3 text-secondary border-0">
                <Calendar size={18} />
                <span>Exámenes</span>
              </a>
            </nav>

            <div className="border-top pt-3 mt-auto">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div 
                  className="rounded-3 d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: '38px', height: '38px', backgroundColor: '#e0e7ff', color: '#4338ca' }}
                >
                  {nombreCorto.charAt(0).toUpperCase()}
                </div>
                <div className="d-flex flex-column">
                  <span className="fw-bold text-dark small">{nombreCorto}</span>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>{userName}</span>
                </div>
              </div>

              {onLogout && (
                <button 
                  onClick={() => { toggleSidebar(); onLogout(); }} 
                  className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 btn-sm rounded-3 py-2 fw-semibold"
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              )}
            </div>

          </div>
        </>
      )}
    </>
  );
};