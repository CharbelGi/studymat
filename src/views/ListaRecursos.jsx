import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  CloudSun,
  RefreshCw,
  Database,
  Globe,
  Calendar,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { auth } from '../config/firebase';
import { useListaRecursos } from '../hooks/useRecursos';
import TarjetaRecurso from '../components/TarjetaRecurso';
import { Cargando, ErrorCarga, Vacio } from '../components/Estados';
import { crearReporteClima, listarReportesClima } from '../services/reportesClimaService';
import { sincronizarFotosYComentariosConFirebase } from '../services/fotosComentariosIndexedDB';

const FONT_VISTA = {
  fontFamily:
    "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  lineHeight: 1.5,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
};

export default function ListaRecursos() {
  const { cargando, datos, origen, error, reintentar } = useListaRecursos();

  const [estadoClima, setEstadoClima] = useState('mal'); // 'bien' | 'mal'
  const [comentario, setComentario] = useState('');
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(() => auth.currentUser);
  const [sinInternetActual, setSinInternetActual] = useState(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  const cargarReportes = useCallback(async () => {
    const lista = await listarReportesClima();
    setReportes(Array.isArray(lista) ? lista : []);
  }, []);

  useEffect(() => {
    const actualizarRed = () => {
      if (typeof navigator !== 'undefined') {
        setSinInternetActual(!navigator.onLine);
      }
    };

    window.addEventListener('online', actualizarRed);
    window.addEventListener('offline', actualizarRed);

    return () => {
      window.removeEventListener('online', actualizarRed);
      window.removeEventListener('offline', actualizarRed);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuarioActual(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let activo = true;

    const inicializarReportes = async () => {
      const lista = await listarReportesClima();
      if (activo) {
        setReportes(Array.isArray(lista) ? lista : []);
      }
    };

    inicializarReportes();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    let activo = true;

    const intentarSincronizar = async () => {
      const conectado = typeof navigator !== 'undefined' ? navigator.onLine : true;
      if (!conectado || !auth.currentUser) return;

      const res = await sincronizarFotosYComentariosConFirebase();
      const totalSubidos = res?.sincronizados ?? res?.subidos ?? 0;

      if (totalSubidos > 0 && activo) {
        setMensajeEstado({
          tipo: 'success',
          texto: `Sincronizado con Firestore: se enviaron ${totalSubidos} registro(s) desde IndexedDB.`,
        });
      }

      if (activo) {
        await cargarReportes();
      }
    };

    window.addEventListener('online', intentarSincronizar);

    if (usuarioActual && (typeof navigator === 'undefined' || navigator.onLine)) {
      intentarSincronizar();
    }

    return () => {
      activo = false;
      window.removeEventListener('online', intentarSincronizar);
    };
  }, [cargarReportes, usuarioActual]);

  const tieneDatos = Array.isArray(datos) && datos.length > 0;

  if (cargando && !tieneDatos) return <Cargando />;
  if (!tieneDatos && error) return <ErrorCarga mensaje={error.message} onReintentar={reintentar} />;
  if (!tieneDatos) return <Vacio />;

  const hoyISO = new Date().toLocaleDateString('en-CA');
  const climaHoy = datos.find((item) => JSON.stringify(item).includes(hoyISO)) || datos[0];
  const otrosDias = datos.filter((item) => item.id !== climaHoy.id);

  const handleRecargarPagina = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comentario.trim() && !archivoFoto) {
      setMensajeEstado({ tipo: 'warning', texto: 'Escribe un comentario o adjunta una foto.' });
      return;
    }

    const sinConexionAlEnviar = typeof navigator !== 'undefined' && !navigator.onLine;
    const tieneUsuario = Boolean(auth.currentUser || usuarioActual);
    setEnviando(true);

    setMensajeEstado(
      sinConexionAlEnviar
        ? {
            tipo: 'info',
            texto: 'Sin internet: guardando en base local (IndexedDB)...',
          }
        : null
    );

    try {
      const resultado = await crearReporteClima({
        estadoClima,
        comentario,
        archivoFoto,
        usuario: auth.currentUser || usuarioActual,
      });

      setComentario('');
      setArchivoFoto(null);
      e.target.reset();

      if (resultado?.sincronizado) {
        setMensajeEstado({
          tipo: 'success',
          texto: 'Guardado en IndexedDB (caché local) y enviado a Firestore.',
        });
      } else if (!tieneUsuario && sinConexionAlEnviar) {
        setMensajeEstado({
          tipo: 'warning',
          texto: 'Guardado en local sin internet. Cuando quieras subirlo debes entrar con Google.',
        });
      } else if (!tieneUsuario) {
        setMensajeEstado({
          tipo: 'warning',
          texto: 'El comentario para que se envie requiere acceder con Google. Se guardó en local por ahora.',
        });
      } else {
        setMensajeEstado({
          tipo: 'info',
          texto: 'Sin conexión: guardado en IndexedDB. Se enviará a Firestore cuando vuelva el internet.',
        });
      }

      await cargarReportes();
    } catch (err) {
      setMensajeEstado({
        tipo: 'danger',
        texto: 'Error al guardar/enviar: ' + err.message,
      });
    } finally {
      setEnviando(false);
    }
  };

  const haySesionGoogle = Boolean(usuarioActual || auth.currentUser);

  return (
    <div className="d-flex flex-column gap-4" style={FONT_VISTA}>
      {/* Banner superior degradado índigo */}
      <div
        className="card border-0 shadow-sm rounded-4 text-white overflow-hidden"
        style={{
          background: 'linear-gradient(120deg, #4f46e5 0%, #6366f1 55%, #4338ca 100%)',
        }}
      >
        <div className="card-body p-4 p-md-5">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
            <span
              className="badge rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 fw-semibold"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.8rem' }}
            >
              <Sparkles size={14} />
              <span>Open-Meteo · PWA</span>
            </span>

            {origen && (
              <span
                className="badge rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 fw-semibold"
                style={{ backgroundColor: 'rgba(255,255,255,0.16)', color: '#fff', fontSize: '0.8rem' }}
              >
                {origen === 'cache' ? <Database size={13} /> : <Globe size={13} />}
                <span>{origen === 'cache' ? 'Caché local' : 'En vivo'}</span>
              </span>
            )}
          </div>

          <h1 className="fw-bold mb-1" style={{ fontSize: '1.65rem', lineHeight: 1.25 }}>
            Clima y Reportes Comunitarios
          </h1>
          <p className="mb-0" style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.94rem' }}>
            Revisa el pronóstico actual, consulta los próximos días y comparte reportes con foto.
          </p>
        </div>
      </div>

      {/* Aviso cuando se muestran datos guardados */}
      {origen === 'cache' && (
        <div
          className="card border-0 shadow-sm rounded-4"
          style={{ backgroundColor: '#fef3c7' }}
        >
          <div className="card-body px-4 py-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
            <div className="d-flex align-items-center gap-2" style={{ color: '#92400e', fontSize: '0.9rem' }}>
              <Database size={17} className="flex-shrink-0" />
              <span>
                <strong>Datos guardados:</strong> los últimos que se consultaron.
              </span>
            </div>

            <button
              type="button"
              onClick={handleRecargarPagina}
              className="btn btn-sm rounded-3 px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1"
              style={{ backgroundColor: '#92400e', color: '#fff', fontSize: '0.84rem' }}
            >
              <RefreshCw size={14} />
              <span>Recargar página</span>
            </button>
          </div>
        </div>
      )}

      {/* Clima de hoy + formulario de reporte */}
      <div className="row g-4 align-items-stretch">
        {/* Cuadro principal de Clima de Hoy */}
        <div className="col-12 col-lg-4 d-flex flex-column">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: '32px', height: '32px', backgroundColor: '#e0e7ff', color: '#4338ca' }}
                >
                  <CloudSun size={17} />
                </div>
                <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                  Clima de Hoy
                </span>
              </div>
              <span
                className="badge rounded-pill px-3 py-1 fw-semibold"
                style={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '0.78rem' }}
              >
                Actual
              </span>
            </div>

            <div className="my-auto py-1">
              <TarjetaRecurso recurso={climaHoy} />
            </div>
          </div>
        </div>

        {/* Formulario de reporte */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <div className="mb-3">
              <h5 className="fw-bold mb-1 text-dark" style={{ fontSize: '1.1rem' }}>
                Reportar estado del clima
              </h5>
              <p className="text-muted mb-0" style={{ fontSize: '0.88rem' }}>
                Selecciona cómo está el clima, agrega un comentario o una foto.
              </p>
            </div>

            {/* Solo se muestra cuando SÍ hay internet y NO hay sesión de Google */}
            {!haySesionGoogle && !sinInternetActual && (
              <div
                className="alert alert-warning py-2.5 px-3 rounded-3"
                style={{ fontSize: '0.88rem' }}
              >
                El comentario para que se envie requiere acceder con Google. Abre el menú lateral para iniciar sesión.
              </div>
            )}

            {mensajeEstado && (
              <div
                className={`alert alert-${mensajeEstado.tipo} py-2.5 px-3 rounded-3`}
                style={{ fontSize: '0.88rem' }}
              >
                {mensajeEstado.texto}
              </div>
            )}

            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-12 col-md-5">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.86rem' }}>
                  Estado del clima
                </label>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className={`btn flex-fill rounded-3 fw-semibold py-2 ${
                      estadoClima === 'bien'
                        ? 'btn-success shadow-sm'
                        : 'btn-outline-success'
                    }`}
                    style={{ fontSize: '0.9rem' }}
                    onClick={() => setEstadoClima('bien')}
                  >
                    ☀️ Clima bien
                  </button>
                  <button
                    type="button"
                    className={`btn flex-fill rounded-3 fw-semibold py-2 ${
                      estadoClima === 'mal'
                        ? 'btn-danger shadow-sm'
                        : 'btn-outline-danger'
                    }`}
                    style={{ fontSize: '0.9rem' }}
                    onClick={() => setEstadoClima('mal')}
                  >
                    🌧️ Clima mal
                  </button>
                </div>
              </div>

              <div className="col-12 col-md-7">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.86rem' }}>
                  Foto del lugar (opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control rounded-3 bg-light border-0 py-2"
                  style={{ fontSize: '0.88rem' }}
                  onChange={(e) => setArchivoFoto(e.target.files?.[0] || null)}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.86rem' }}>
                  Comentario
                </label>
                <textarea
                  rows="2"
                  className="form-control rounded-3 bg-light border-0"
                  style={{ fontSize: '0.92rem' }}
                  placeholder="Escribe tu comentario sobre el clima..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />
              </div>

              <div className="col-12 d-flex justify-content-end pt-1">
                <button
                  type="submit"
                  disabled={enviando}
                  className="btn btn-primary px-4 py-2 rounded-3 fw-semibold shadow-sm d-inline-flex align-items-center gap-2"
                  style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5', fontSize: '0.9rem' }}
                >
                  {enviando ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" />
                      <span>
                        {sinInternetActual ? 'Cargando sin internet...' : 'Cargando...'}
                      </span>
                    </>
                  ) : (
                    <span>Guardar y enviar</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Cuadros de pronóstico de los demás días */}
      {otrosDias.length > 0 && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: '32px', height: '32px', backgroundColor: '#e0e7ff', color: '#4338ca' }}
              >
                <Calendar size={16} />
              </div>
              <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '1rem' }}>
                Pronóstico de los demás días
              </h6>
            </div>
            <span
              className="badge rounded-pill px-3 py-1 fw-semibold"
              style={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '0.8rem' }}
            >
              {otrosDias.length} {otrosDias.length === 1 ? 'día' : 'días'}
            </span>
          </div>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-6 g-3">
            {otrosDias.map((recurso) => (
              <div className="col" key={recurso.id}>
                <div className="h-100 rounded-4 p-3 bg-light">
                  <TarjetaRecurso recurso={recurso} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px', backgroundColor: '#e0e7ff', color: '#4338ca' }}
            >
              <MessageSquare size={16} />
            </div>
            <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '1rem' }}>
              Comentarios y fotos fercho2322
            </h6>
          </div>

          <span
            className="badge rounded-pill px-3 py-1 fw-semibold"
            style={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '0.8rem' }}
          >
            {reportes.length}
          </span>
        </div>

        {reportes.length === 0 ? (
          <div className="text-center py-4 text-muted rounded-4 bg-light" style={{ fontSize: '0.9rem' }}>
            Aún no hay registros guardados.
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {reportes.map((rep, idx) => {
              const srcImg = rep.previewLocalUrl;
              const estaSincronizado = Boolean(rep.sincronizado);
              const estaLeido = Boolean(rep.leido);
              const esInvitadoSinSesion =
                !estaSincronizado &&
                (!haySesionGoogle || !rep.usuarioEmail || rep.usuarioEmail === 'Invitado');

              return (
                <div
                  key={rep.keyUnica || rep.id || idx}
                  className="rounded-4 p-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3"
                  style={{
                    backgroundColor: estaSincronizado ? '#f8fafc' : '#fffbeb',
                    border: estaSincronizado ? '1px solid #e2e8f0' : '1px solid #fde68a',
                  }}
                >
                  <div className="flex-grow-1">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                      <span
                        className={`badge rounded-pill px-3 py-1 ${
                          rep.estadoClima === 'bien' ? 'bg-success' : 'bg-danger'
                        }`}
                        style={{ fontSize: '0.78rem' }}
                      >
                        {rep.estadoClima === 'bien' ? '☀️ Clima bien' : '🌧️ Clima mal'}
                      </span>

                      <span className="text-muted fw-medium" style={{ fontSize: '0.84rem' }}>
                        {rep.usuarioEmail || 'Invitado'}
                      </span>
                    </div>

                    <p className="mb-2 text-dark" style={{ fontSize: '0.95rem' }}>
                      {rep.comentario || 'Sin comentario'}
                    </p>

                    <div className="d-flex align-items-center justify-content-between">
                      {!estaSincronizado ? (
                        esInvitadoSinSesion ? (
                          <span className="fw-semibold text-danger" style={{ fontSize: '0.85rem' }}>
                            El comentario para que se envie requiere acceder con Google.
                          </span>
                        ) : (
                          <span
                            className="d-inline-flex align-items-center gap-2 fw-semibold text-warning-emphasis"
                            style={{ fontSize: '0.85rem' }}
                          >
                            <span
                              className="spinner-border spinner-border-sm text-warning"
                              role="status"
                            />
                            <span>
                              {sinInternetActual
                                ? 'Cargando sin internet...'
                                : 'Cargando...'}
                            </span>
                          </span>
                        )
                      ) : estaLeido ? (
                        <span
                          className="d-inline-flex align-items-center gap-1 fw-bold"
                          style={{ color: '#16a34a', fontSize: '0.86rem' }}
                          title="Confirmado"
                        >
                          <span style={{ fontSize: '1.05rem', letterSpacing: '-1px' }}>✓✓</span>
                          <span>Confirmado</span>
                        </span>
                      ) : (
                        <span
                          className="d-inline-flex align-items-center gap-1 fw-bold"
                          style={{ color: '#d97706', fontSize: '0.86rem' }}
                          title="Enviado a Firestore"
                        >
                          <span style={{ fontSize: '1.05rem', letterSpacing: '-1px' }}>✓✓</span>
                          <span>Enviado</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {srcImg && (
                    <a
                      href={srcImg}
                      target="_blank"
                      rel="noreferrer"
                      className="d-block shrink-0"
                    >
                      <img
                        src={srcImg}
                        alt="Foto del clima"
                        style={{ width: '110px', height: '78px', objectFit: 'cover' }}
                        className="rounded-3 border"
                      />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}