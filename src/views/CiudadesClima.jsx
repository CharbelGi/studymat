import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  MapPin,
  Star,
  Trash2,
  Wind,
  Thermometer,
  Sparkles,
  Database,
  Globe,
  Calendar,
} from 'lucide-react';
import {
  buscarCiudadesPorNombre,
  listarCiudadesGuardadas,
  guardarCiudadFavorita,
  eliminarCiudadFavorita,
  obtenerClimaDeCiudad,
} from '../repositories/ciudadesRepository';

const ETIQUETAS_RAPIDAS = ['Actual', 'Casa', 'Escuela'];

export default function CiudadesClima() {
  const [busqueda, setBusqueda] = useState('');
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState('Casa');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState('');

  const [favoritas, setFavoritas] = useState([]);
  const [ciudadActiva, setCiudadActiva] = useState(null);
  const [climaActual, setClimaActual] = useState(null);
  const [origenClima, setOrigenClima] = useState('api');
  const [cargandoClima, setCargandoClima] = useState(false);

  const cargarClimaCiudad = useCallback(async (ciudad) => {
    if (!ciudad) return;
    setCiudadActiva(ciudad);
    setCargandoClima(true);

    try {
      const { pronostico, origen } = await obtenerClimaDeCiudad(ciudad);
      setClimaActual(pronostico);
      setOrigenClima(origen);
    } catch {
      setClimaActual(null);
    } finally {
      setCargandoClima(false);
    }
  }, []);

  useEffect(() => {
    let activo = true;

    (async () => {
      const guardadas = await listarCiudadesGuardadas();
      if (!activo) return;
      setFavoritas(guardadas);

      if (guardadas.length > 0) {
        cargarClimaCiudad(guardadas[0]);
      }
    })();

    return () => {
      activo = false;
    };
  }, [cargarClimaCiudad]);

  const handleBuscar = async (e) => {
    e.preventDefault();
    setErrorBusqueda('');

    if (!busqueda.trim()) {
      setResultados([]);
      return;
    }

    setBuscando(true);
    try {
      const encontrados = await buscarCiudadesPorNombre(busqueda);
      setResultados(encontrados);
      if (encontrados.length === 0) {
        setErrorBusqueda('No encontramos ciudades con ese nombre. Intenta con otra.');
      }
    } catch {
      setErrorBusqueda('No se pudo consultar el buscador. Revisa tu conexión.');
    } finally {
      setBuscando(false);
    }
  };

  const handleAgregarFavorita = async (ciudad) => {
    const actualizadaLista = await guardarCiudadFavorita(ciudad, etiquetaSeleccionada);
    setFavoritas(actualizadaLista);
    const guardada = actualizadaLista.find((c) => c.id === ciudad.id) || ciudad;
    cargarClimaCiudad(guardada);
  };

  const handleEliminarFavorita = async (id) => {
    const restante = await eliminarCiudadFavorita(id);
    setFavoritas(restante);

    if (ciudadActiva?.id === id) {
      if (restante.length > 0) {
        cargarClimaCiudad(restante[0]);
      } else {
        setCiudadActiva(null);
        setClimaActual(null);
      }
    }
  };

  return (
    <section className="container-fluid px-0">
      <div className="d-flex flex-column gap-4">
        {/* Banner superior a juego con tu estilo */}
        <div
          className="card border-0 shadow-sm rounded-4 text-white overflow-hidden"
          style={{
            background: 'linear-gradient(120deg, #4f46e5 0%, #6366f1 55%, #4338ca 100%)',
          }}
        >
          <div className="card-body p-4 p-md-5 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <span
                className="badge rounded-pill px-3 py-2 mb-2 d-inline-flex align-items-center gap-1 fw-semibold"
                style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: '#fff' }}
              >
                <Sparkles size={14} />
                <span>Open-Meteo Geocoding + IndexedDB</span>
              </span>
              <h1 className="h3 fw-bold mb-1">Ciudades y Favoritas</h1>
              <p className="mb-0 text-white-50 small">
                Busca cualquier ciudad, fíjala como Actual, Casa o Escuela y consulta su pronóstico al instante.
              </p>
            </div>

            <div
              className="px-4 py-3 rounded-4 text-md-end"
              style={{ backgroundColor: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(6px)' }}
            >
              <div className="small text-white-50 fw-medium">Ciudades fijadas</div>
              <div className="h4 fw-bold mb-0">{favoritas.length}</div>
            </div>
          </div>
        </div>

        {/* Tarjeta de búsqueda */}
        <div className="card border-0 shadow-sm rounded-4 bg-white">
          <div className="card-body p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: '34px', height: '34px', backgroundColor: '#e0e7ff', color: '#4338ca' }}
              >
                <Search size={18} />
              </div>
              <h2 className="h6 fw-bold text-dark mb-0">Buscar nueva ciudad</h2>
            </div>

            <form onSubmit={handleBuscar} className="row g-2 align-items-center">
              <div className="col-12 col-md-6">
                <input
                  type="text"
                  className="form-control rounded-3 py-2 bg-light border-0"
                  placeholder="Ej. Guadalajara, Monterrey, CDMX, Madrid..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <select
                  className="form-select rounded-3 py-2 bg-light border-0 fw-medium"
                  value={etiquetaSeleccionada}
                  onChange={(e) => setEtiquetaSeleccionada(e.target.value)}
                  aria-label="Etiqueta de ciudad"
                >
                  {ETIQUETAS_RAPIDAS.map((etiq) => (
                    <option key={etiq} value={etiq}>
                      Fijar como: {etiq}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-sm-6 col-md-3 d-grid">
                <button
                  type="submit"
                  disabled={buscando}
                  className="btn btn-primary rounded-3 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5' }}
                >
                  <Search size={16} />
                  <span>{buscando ? 'Buscando...' : 'Buscar'}</span>
                </button>
              </div>
            </form>

            {errorBusqueda && (
              <div className="alert alert-light border rounded-3 small text-muted mt-3 mb-0">
                {errorBusqueda}
              </div>
            )}

            {resultados.length > 0 && (
              <div className="mt-4 pt-3 border-top">
                <div className="small fw-semibold text-muted mb-2">Resultados encontrados</div>
                <div className="row g-2">
                  {resultados.map((ciudad) => (
                    <div key={ciudad.id} className="col-12 col-lg-6">
                      <div className="p-3 rounded-3 bg-light d-flex justify-content-between align-items-center gap-3 h-100">
                        <div className="min-w-0">
                          <div className="fw-bold text-dark small text-truncate">
                            {ciudad.nombre}
                            {ciudad.region ? `, ${ciudad.region}` : ''}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {ciudad.pais ? `${ciudad.pais} · ` : ''}
                            {ciudad.latitude.toFixed(2)}, {ciudad.longitude.toFixed(2)}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAgregarFavorita(ciudad)}
                          className="btn btn-sm rounded-3 px-3 py-2 fw-semibold flex-shrink-0 d-inline-flex align-items-center gap-1"
                          style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}
                        >
                          <Star size={14} />
                          <span>{etiquetaSeleccionada}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ciudades favoritas para cambio rápido */}
        <div className="card border-0 shadow-sm rounded-4 bg-white">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: '34px', height: '34px', backgroundColor: '#e0e7ff', color: '#4338ca' }}
                >
                  <MapPin size={18} />
                </div>
                <h2 className="h6 fw-bold text-dark mb-0">Mis ciudades guardadas</h2>
              </div>
              <span
                className="badge rounded-pill px-3 py-1 fw-semibold"
                style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}
              >
                {favoritas.length} {favoritas.length === 1 ? 'ciudad' : 'ciudades'}
              </span>
            </div>

            {favoritas.length === 0 ? (
              <div className="text-center py-4 px-3 rounded-4 bg-light">
                <div className="fw-semibold text-dark small mb-1">Aún no tienes ciudades fijadas</div>
                <div className="text-muted small">
                  Busca una ciudad arriba y guárdala para cambiar de pronóstico con un toque.
                </div>
              </div>
            ) : (
              <div className="d-flex flex-wrap gap-2">
                {favoritas.map((ciudad) => {
                  const activa = ciudadActiva?.id === ciudad.id;
                  return (
                    <div
                      key={ciudad.id}
                      className={`d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 transition ${
                        activa ? 'text-white shadow-sm' : 'bg-light text-dark'
                      }`}
                      style={activa ? { backgroundColor: '#4f46e5' } : undefined}
                    >
                      <button
                        type="button"
                        onClick={() => cargarClimaCiudad(ciudad)}
                        className={`btn btn-link p-0 text-decoration-none fw-semibold small d-inline-flex align-items-center gap-2 ${
                          activa ? 'text-white' : 'text-dark'
                        }`}
                      >
                        {ciudad.etiqueta && (
                          <span
                            className="badge rounded-pill px-2 py-1"
                            style={
                              activa
                                ? { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.7rem' }
                                : { backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '0.7rem' }
                            }
                          >
                            {ciudad.etiqueta}
                          </span>
                        )}
                        <span>{ciudad.nombre}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEliminarFavorita(ciudad.id)}
                        className={`btn btn-sm p-0 ms-1 lh-1 border-0 bg-transparent ${
                          activa ? 'text-white-50' : 'text-muted'
                        }`}
                        title="Eliminar ciudad"
                        aria-label={`Eliminar ${ciudad.nombre}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pronóstico de la ciudad seleccionada */}
        {ciudadActiva && (
          <div className="card border-0 shadow-sm rounded-4 bg-white">
            <div className="card-body p-4 p-md-5">
              {origenClima === 'cache' && climaActual && (
                <div
                  className="alert border-0 rounded-3 py-2 px-3 small mb-4 d-flex align-items-center gap-2"
                  style={{ backgroundColor: '#fef3c7', color: '#92400e' }}
                >
                  <Database size={16} />
                  <span>
                    <strong>Datos guardados:</strong> mostrando el último pronóstico local de{' '}
                    <strong>{ciudadActiva.nombre}</strong>.
                  </span>
                </div>
              )}

              {cargandoClima ? (
                <div className="d-flex align-items-center gap-3 py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status" />
                  <span className="text-muted small fw-medium">
                    Cargando pronóstico de {ciudadActiva.nombre}...
                  </span>
                </div>
              ) : climaActual ? (
                <>
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 pb-4 mb-4 border-bottom">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span
                          className="badge rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1"
                          style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}
                        >
                          {origenClima === 'cache' ? <Database size={12} /> : <Globe size={12} />}
                          <span>{origenClima === 'cache' ? 'Caché local' : 'En vivo'}</span>
                        </span>
                        {ciudadActiva.etiqueta && (
                          <span className="text-muted small fw-semibold">{ciudadActiva.etiqueta}</span>
                        )}
                      </div>

                      <h2 className="h4 fw-bold text-dark mb-1">{ciudadActiva.nombre}</h2>
                      <div className="display-5 fw-bold text-dark lh-1">
                        {climaActual.temperaturaActual !== null
                          ? `${climaActual.temperaturaActual}°C`
                          : 'Sin dato'}
                      </div>
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      {climaActual.vientoKmh !== null && (
                        <div className="p-3 rounded-4 bg-light d-flex align-items-center gap-2">
                          <Wind size={18} style={{ color: '#4f46e5' }} />
                          <div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              Viento
                            </div>
                            <div className="fw-bold text-dark small">{climaActual.vientoKmh} km/h</div>
                          </div>
                        </div>
                      )}

                      <div className="p-3 rounded-4 bg-light d-flex align-items-center gap-2">
                        <Thermometer size={18} style={{ color: '#4f46e5' }} />
                        <div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                            Actual
                          </div>
                          <div className="fw-bold text-dark small">
                            {climaActual.temperaturaActual !== null
                              ? `${climaActual.temperaturaActual}°C`
                              : '--'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {climaActual.dias?.length > 0 && (
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <Calendar size={16} style={{ color: '#4f46e5' }} />
                        <h3 className="h6 fw-bold text-dark mb-0">Próximos días</h3>
                      </div>

                      <div className="row g-3">
                        {climaActual.dias.map((dia) => (
                          <div key={dia.fecha} className="col-6 col-md-3">
                            <div className="p-3 rounded-4 bg-light h-100">
                              <div className="small fw-semibold text-muted mb-2">{dia.fecha}</div>
                              <div className="fw-bold text-dark">
                                Máx: {dia.tempMax ?? '--'}°C
                              </div>
                              <div className="small text-muted">
                                Mín: {dia.tempMin ?? '--'}°C
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-muted small">
                  No hay pronóstico disponible para {ciudadActiva.nombre}.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}