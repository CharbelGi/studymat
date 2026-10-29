import React, { useState, useEffect } from 'react';
import { Droplets, Wind, Sparkles, Share2 } from 'lucide-react';
import { compartirContenido } from '../config/shareUtils';

export default function ClimaCompacto() {
  const [clima, setClima] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [esOffline, setEsOffline] = useState(false);

  const interpretarClimaEstudiantil = (code, temp, precipitacion) => {
    if (precipitacion > 0 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(code)) {
      return {
        texto: "Lluvioso",
        icono: "🌧️",
        consejo: "¡Lleva paraguas! Buen día para avanzar tareas en casa."
      };
    }
    
    if (code === 0) {
      if (temp > 28) {
        return {
          texto: "Soleado y caluroso",
          icono: "☀️",
          consejo: "Día caluroso. ¡Mantente hidratado mientras estudias!"
        };
      }
      return {
        texto: "Despejado",
        icono: "🌤️",
        consejo: "Excelente clima para ir a la biblioteca de la universidad."
      };
    }

    if ([1, 2, 3, 45, 48].includes(code)) {
      return {
        texto: "Nublado / Fresco",
        icono: "⛅",
        consejo: "Ambiente fresco, ideal para concentrarse en proyectos."
      };
    }

    return {
      texto: "Variable",
      icono: "🌡️",
      consejo: "Revisa bien tus pendientes del día."
    };
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
        
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,precipitation,wind_speed_10m&timezone=auto`;

        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error();
          const data = await res.json();

          const temp = Math.round(data.current.temperature_2m);
          const codigo = data.current.weather_code;
          const precipitacion = data.current.precipitation;
          
          const infoSugerencia = interpretarClimaEstudiantil(codigo, temp, precipitacion);

          const datosClima = {
            temperatura: temp,
            humedad: data.current.relative_humidity_2m,
            viento: data.current.wind_speed_10m,
            ...infoSugerencia
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

  const handleCompartirClima = (e) => {
    e.stopPropagation();
    if (!clima) return;

    compartirContenido({
      title: "Clima actual en StudyMate",
      text: `El clima actual es de ${clima.temperatura}°C (${clima.texto}). Consejo: "${clima.consejo}" 🌤️📚`,
      url: window.location.origin
    });
  };

  if (cargando) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white placeholder-glow">
        <div className="d-flex align-items-center justify-content-between p-1">
          <div>
            <span className="placeholder col-6 mb-2 d-block" style={{ height: '10px' }}></span>
            <span className="placeholder col-4 d-block" style={{ height: '24px' }}></span>
          </div>
          <span className="placeholder rounded-3" style={{ width: '40px', height: '40px' }}></span>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white position-relative overflow-hidden">
      <div className="card-body d-flex flex-column justify-content-between p-0">
        
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="d-flex align-items-center gap-1">
              <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>
                Clima Actual {esOffline && <span className="text-warning" title="Modo offline">⚠️</span>}
              </small>
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-2 fw-bold text-dark">{clima ? `${clima.temperatura}°C` : '--'}</span>
              <span className="text-muted small text-truncate" style={{ maxWidth: '90px', fontSize: '0.75rem' }}>
                {clima?.texto}
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button 
              onClick={handleCompartirClima}
              className="btn btn-light btn-sm p-1.5 rounded-3 text-secondary border-0 shadow-sm"
              title="Compartir clima"
              style={{ backgroundColor: '#f3f4f6' }}
            >
              <Share2 size={14} />
            </button>

            <div className="p-2.5 rounded-3 text-primary d-flex align-items-center justify-content-center" style={{ backgroundColor: '#e0f2fe', fontSize: '1.25rem', minWidth: '42px', minHeight: '42px' }}>
              {clima?.icono || '🌡️'}
            </div>
          </div>
        </div>

        {clima?.consejo && (
          <div className="mt-2 p-2 rounded-3 bg-light border-0 d-flex align-items-start gap-1" style={{ fontSize: '0.7rem' }}>
            <Sparkles size={12} className="text-warning mt-0.5 flex-shrink-0" />
            <span className="text-secondary fw-medium">{clima.consejo}</span>
          </div>
        )}

        <div className="d-flex gap-3 mt-2 text-muted pt-1 border-top" style={{ fontSize: '0.75rem' }}>
          <span><Droplets size={12} className="me-1" />{clima?.humedad}%</span>
          <span><Wind size={12} className="me-1" />{clima?.viento} km/h</span>
        </div>

      </div>
    </div>
  );
}