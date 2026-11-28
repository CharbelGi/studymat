import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  BookOpen,
  CloudSun,
  MapPin,
  Home,
  LogOut,
  LogIn,
  Download,
  Wifi,
  WifiOff,
} from 'lucide-react';

const FONT_BASE = {
  fontFamily:
    "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
};

export function Header({
  onLoginGoogle,
  onLogout,
  isAuthenticated = false,
  userName = 'Invitado',
  userRole = 'Estudiante',
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const location = useLocation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert(
        'Para instalar la app: abre el menú de tu navegador (⋮) y selecciona "Instalar aplicación" o "Agregar a pantalla de inicio".'
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const navItems = [
    { path: '/', label: 'Clima (Principal)', icon: CloudSun },
    { path: '/ciudades', label: 'Ciudades y Favoritas', icon: MapPin },
    { path: '/panel', label: 'Panel de Actividades', icon: Home },
  ];

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'I';

  const handleAuthAction = async () => {
    toggleSidebar();
    if (isAuthenticated) {
      if (onLogout) await onLogout();
    } else if (onLoginGoogle) {
      await onLoginGoogle();
    }
  };

  return (
    <>
      <header
        className="w-100 bg-white border-bottom sticky-top d-flex align-items-center justify-content-between px-3 px-md-4"
        style={{ height: '64px', zIndex: 1030, ...FONT_BASE }}
      >
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="btn btn-light border-0 p-2 rounded-3 d-flex align-items-center justify-content-center"
            aria-label="Abrir menú"
          >
            <Menu size={22} className="text-dark" />
          </button>

          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: '34px', height: '34px', backgroundColor: '#4f46e5', color: '#fff' }}
            >
              <BookOpen size={18} />
            </div>
            <span
              className="fw-bold text-dark"
              style={{ fontSize: '1.15rem', letterSpacing: '-0.01em' }}
            >
              StudyMate
            </span>
          </Link>
        </div>

        <div className="d-flex align-items-center gap-2 gap-md-3">
          <button
            type="button"
            onClick={handleInstallClick}
            className="btn btn-light btn-sm rounded-3 px-2 px-md-3 py-2 fw-semibold d-flex align-items-center gap-2 border-0"
            style={{ fontSize: '0.88rem' }}
            title="Instalar aplicación"
          >
            <Download size={16} />
            <span className="d-none d-sm-inline">Instalar</span>
          </button>

          <div
            className={`d-flex align-items-center gap-2 px-2 px-md-3 py-2 rounded-pill fw-semibold ${
              isOnline ? 'bg-success text-white' : 'bg-danger text-white'
            }`}
            style={{ fontSize: '0.85rem', lineHeight: 1 }}
            title={isOnline ? 'Conectado a internet' : 'Sin conexión a internet'}
          >
            {isOnline ? <Wifi size={15} /> : <WifiOff size={15} />}
            <span className="d-none d-sm-inline">{isOnline ? 'En línea' : 'Sin conexión'}</span>
          </div>

          <div className="d-flex align-items-center gap-2 ps-2 border-start">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center fw-bold"
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#e0e7ff',
                color: '#4338ca',
                fontSize: '0.95rem',
              }}
            >
              {userInitial}
            </div>
            <div className="d-none d-lg-block" style={{ lineHeight: 1.25 }}>
              <div className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                {userName}
              </div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                {isAuthenticated ? 'Sesión activa' : 'Cuenta Google'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040, backdropFilter: 'blur(2px)' }}
        />
      )}

      <aside
        className="position-fixed top-0 start-0 h-100 bg-white shadow-lg"
        style={{
          width: '300px',
          maxWidth: '88vw',
          zIndex: 1050,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px',
          ...FONT_BASE,
        }}
      >
        <div>
          <div className="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: '36px', height: '36px', backgroundColor: '#4f46e5', color: '#fff' }}
              >
                <BookOpen size={18} />
              </div>
              <span className="fw-bold text-dark" style={{ fontSize: '1.2rem' }}>
                StudyMate
              </span>
            </div>

            <button
              type="button"
              onClick={toggleSidebar}
              className="btn btn-light btn-sm rounded-circle p-2 border-0 d-flex align-items-center justify-content-center"
              style={{ width: '36px', height: '36px' }}
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>
          </div>

          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={toggleSidebar}
                  className="text-decoration-none rounded-3"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    lineHeight: 1.35,
                    backgroundColor: isActive ? '#18181b' : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#1e293b',
                  }}
                >
                  <Icon size={20} style={{ flexShrink: 0 }} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-3 border-top">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
              style={{
                width: '42px',
                height: '42px',
                backgroundColor: '#e0e7ff',
                color: '#4338ca',
                fontSize: '1rem',
              }}
            >
              {userInitial}
            </div>
            <div className="overflow-hidden" style={{ lineHeight: 1.35 }}>
              <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.96rem' }}>
                {userName}
              </div>
              <div className="text-muted text-truncate" style={{ fontSize: '0.84rem' }}>
                {isAuthenticated ? userRole : 'Inicia sesión con Google'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAuthAction}
            className={`btn w-100 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 ${
              isAuthenticated ? 'btn-outline-danger' : 'btn-primary text-white shadow-sm'
            }`}
            style={{
              padding: '10px 14px',
              fontSize: '0.92rem',
              ...(!isAuthenticated ? { backgroundColor: '#4f46e5', borderColor: '#4f46e5' } : {}),
            }}
          >
            {isAuthenticated ? (
              <>
                <LogOut size={17} />
                <span>Cerrar Sesión</span>
              </>
            ) : (
              <>
                <LogIn size={17} />
                <span>Iniciar sesión con Google</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}