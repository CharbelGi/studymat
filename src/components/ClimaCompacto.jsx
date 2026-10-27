import React, { useState, useEffect } from 'react';
import { Droplets, Wind } from 'lucide-react';

export default function ClimaCompacto() {
  const [clima, setClima] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [esOffline, setEsOffline] = useState(false);

  const obtenerEstadoClima = (code) => {
    switch (code) {
      case 0: return { texto: "Despejado", icono: "☀️" };
      case 1:
      case 2:
      case 3: return { texto: "Parcialmente nublado", icono: "⛅" };
      case 45:
      case 48: return { texto: "Neblina", icono: "🌫️" };
      case 51:
      case 53:
      case 55: return { texto: "Llovizna", icono: "🌧️" };
      case 61:
      case 63:
      case 65: return { texto: "Lluvia", icono: "🌧️" };
      case 80:
      case 81:
      case 82: return { texto: "Chubascos", icono: "🌦️" };
      case 95: return { texto: "Tormenta eléctrica", icono: "🌩️" };
      default: return { texto: "Variable", icono: "🌡️" };
    }
  };

  const cargarClima = () => {
    setCargando(true);
    if (!navigator.geolocation) {
      cargarDatosOffline();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;

        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error();
          const data = await res.json();

          const datosClima = {
            temperatura: Math.round(data.current.temperature_2m),
            humedad: data.current.relative_humidity_2m,
            viento: data.current.wind_speed_10m,
            codigo: data.current.weather_code,
            lugar: "Mi Ubicación"
          };

          setClima(datosClima);
          setEsOffline(false);
          setCargando(false);
          localStorage.setItem('rutaclima_widget_cache', JSON.stringify(datosClima));
        } catch {
          cargarDatosOffline();
        }
      },
      () => cargarDatosOffline()
    );
  };

  const cargarDatosOffline = () => {
    const cache = localStorage.getItem('rutaclima_widget_cache');
    if (cache) {
      setClima(JSON.parse(cache));
      setEsOffline(true);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarClima();
  }, []);

  if (cargando) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-2 h-100 bg-white placeholder-glow">
        <div className="d-flex align-items-center justify-content-between p-1">
          <div>
            <span className="placeholder col-6 mb-2 d-block" style={{ height: '10px' }}></span>
            <span className="placeholder col-4 d-block" style={{ height: '20px' }}></span>
          </div>
          <span className="placeholder rounded-3" style={{ width: '36px', height: '36px' }}></span>
        </div>
      </div>
    );
  }

  const estado = clima ? obtenerEstadoClima(clima.codigo) : { texto: "Desconocido", icono: "🌡️" };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-2 h-100 bg-white position-relative overflow-hidden">
      <div className="card-body d-flex justify-content-between align-items-center p-2">
        <div>
          <div className="d-flex align-items-center gap-1 mb-1">
            <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>
              Clima Actual {esOffline && <span className="text-warning" title="Modo offline">⚠️</span>}
            </small>
          </div>
          
          <div className="d-flex align-items-baseline gap-2">
            <span className="fs-3 fw-bold text-dark">{clima ? `${clima.temperatura}°C` : '--'}</span>
            <span className="text-muted small text-truncate" style={{ maxWidth: '90px', fontSize: '0.75rem' }}>{estado.texto}</span>
          </div>

          <div className="d-flex gap-2 mt-1 text-muted" style={{ fontSize: '0.7rem' }}>
            <span><Droplets size={10} className="me-1" />{clima?.humedad}%</span>
            <span><Wind size={10} className="me-1" />{clima?.viento} km/h</span>
          </div>
        </div>

        <div className="p-2 rounded-3 text-primary d-flex align-items-center justify-content-center" style={{ backgroundColor: '#e0f2fe', fontSize: '1.5rem', minWidth: '48px', minHeight: '48px' }}>
          {estado.icono}
        </div>
      </div>
    </div>
  );
}