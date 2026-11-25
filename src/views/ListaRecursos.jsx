import { useEffect, useState, useCallback } from 'react';
import { auth } from '../config/firebase';
import { useListaRecursos } from '../hooks/useRecursos';
import TarjetaRecurso from '../components/TarjetaRecurso';
import { Cargando, ErrorCarga, Vacio } from '../components/Estados';
import { crearReporteClima, listarReportesClima } from '../services/reportesClimaService';
import { sincronizarFotosYComentariosConFirebase } from '../services/fotosComentariosIndexedDB';

export default function ListaRecursos() {
  const { cargando, datos, error, reintentar } = useListaRecursos();

  const [estadoClima, setEstadoClima] = useState('mal'); // 'bien' | 'mal'
  const [comentario, setComentario] = useState('');
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState(null);
  const [reportes, setReportes] = useState([]);

  const cargarReportes = useCallback(async () => {
    const lista = await listarReportesClima();
    setReportes(lista);
  }, []);

  useEffect(() => {
    cargarReportes();
  }, [cargarReportes]);

  useEffect(() => {
    const intentarSincronizar = async () => {
      if (!navigator.onLine || !auth.currentUser) return;

      const res = await sincronizarFotosYComentariosConFirebase();
      const totalSubidos = res?.sincronizados ?? res?.subidos ?? 0;

      if (totalSubidos > 0) {
        setMensajeEstado({
          tipo: 'success',
          texto: `Sincronizado con Firestore: se enviaron ${totalSubidos} registro(s) desde IndexedDB.`,
        });
        await cargarReportes();
      }
    };

    window.addEventListener('online', intentarSincronizar);
    intentarSincronizar();

    return () => window.removeEventListener('online', intentarSincronizar);
  }, [cargarReportes]);

  if (cargando) return <Cargando />;
  if (error) return <ErrorCarga mensaje={error.message} onReintentar={reintentar} />;
  if (!datos || !datos.length) return <Vacio />;

  const hoyISO = new Date().toLocaleDateString('en-CA');
  const climaHoy = datos.find((item) => JSON.stringify(item).includes(hoyISO)) || datos[0];
  const otrosDias = datos.filter((item) => item.id !== climaHoy.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comentario.trim() && !archivoFoto) {
      setMensajeEstado({ tipo: 'warning', texto: 'Escribe un comentario o adjunta una foto.' });
      return;
    }

    setEnviando(true);
    setMensajeEstado(null);

    try {
      const resultado = await crearReporteClima({
        estadoClima,
        comentario,
        archivoFoto,
        usuario: auth.currentUser,
      });

      setComentario('');
      setArchivoFoto(null);
      e.target.reset();

      if (resultado?.sincronizado) {
        setMensajeEstado({
          tipo: 'success',
          texto: 'Guardado en IndexedDB (caché local) y enviado a Firestore.',
        });
      } else if (!auth.currentUser) {
        setMensajeEstado({
          tipo: 'warning',
          texto: 'Guardado en IndexedDB. Inicia sesión con Google en el menú para enviarlo a Firestore.',
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

  return (
    <div className="d-flex flex-column gap-4">
      {/* Clima de hoy + formulario de reporte */}
      <div className="row g-4 align-items-stretch">
        <div className="col-12 col-lg-4 d-flex flex-column">
          <div className="card border-primary border-2 shadow-sm rounded-4 p-4 h-100 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-primary rounded-pill px-3 py-2">Clima de Hoy</span>
              <small className="text-muted fw-semibold">Actual</small>
            </div>
            <div className="my-auto">
              <TarjetaRecurso recurso={climaHoy} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h5 className="fw-bold mb-1">Reportar estado del clima</h5>
            <p className="text-muted small mb-3">
              Elige si el clima está bien o mal, escribe tu comentario y adjunta una foto local.
            </p>

            {mensajeEstado && (
              <div className={`alert alert-${mensajeEstado.tipo} py-2 small rounded-3`}>
                {mensajeEstado.texto}
              </div>
            )}

            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-12 col-md-5">
                <label className="form-label small fw-semibold">Estado del clima</label>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className={`btn flex-fill rounded-3 fw-semibold ${
                      estadoClima === 'bien' ? 'btn-success' : 'btn-outline-success'
                    }`}
                    onClick={() => setEstadoClima('bien')}
                  >
                    Clima bien
                  </button>
                  <button
                    type="button"
                    className={`btn flex-fill rounded-3 fw-semibold ${
                      estadoClima === 'mal' ? 'btn-danger' : 'btn-outline-danger'
                    }`}
                    onClick={() => setEstadoClima('mal')}
                  >
                    Clima mal
                  </button>
                </div>
              </div>

              <div className="col-12 col-md-7">
                <label className="form-label small fw-semibold">Foto (opcional - local)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control rounded-3"
                  onChange={(e) => setArchivoFoto(e.target.files?.[0] || null)}
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold">Comentario</label>
                <textarea
                  rows="2"
                  className="form-control rounded-3"
                  placeholder="Escribe tu comentario sobre el clima..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />
              </div>

              <div className="col-12 d-flex justify-content-end">
                <button
                  type="submit"
                  disabled={enviando}
                  className="btn btn-primary px-4 rounded-3 fw-semibold"
                  style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5' }}
                >
                  {enviando ? 'Guardando...' : 'Guardar y enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Demás días */}
      {otrosDias.length > 0 && (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <h6 className="fw-bold mb-3 text-secondary">Pronóstico de los demás días</h6>
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-6 g-3">
            {otrosDias.map((recurso) => (
              <div className="col" key={recurso.id}>
                <TarjetaRecurso recurso={recurso} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial */}
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <h6 className="fw-bold mb-3">Comentarios y fotos ({reportes.length})</h6>
        {reportes.length === 0 ? (
          <p className="text-muted small mb-0">Aún no hay registros guardados.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {reportes.map((rep, idx) => {
              const srcImg = rep.previewLocalUrl;
              return (
                <div
                  key={rep.keyUnica || rep.id || idx}
                  className="border rounded-3 p-3 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 bg-light"
                >
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span
                        className={`badge ${
                          rep.estadoClima === 'bien' ? 'bg-success' : 'bg-danger'
                        }`}
                      >
                        {rep.estadoClima === 'bien' ? 'Clima bien' : 'Clima mal'}
                      </span>
                      <span className="badge bg-secondary">
                        {rep.sincronizado ? 'Enviado a Firestore' : 'Pendiente en IndexedDB'}
                      </span>
                      <small className="text-muted">{rep.usuarioEmail || 'Invitado'}</small>
                    </div>
                    <p className="mb-1 small">{rep.comentario || 'Sin comentario'}</p>
                  </div>

                  {srcImg && (
                    <img
                      src={srcImg}
                      alt="Foto del clima"
                      style={{ width: '90px', height: '65px', objectFit: 'cover' }}
                      className="rounded-3 border"
                    />
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