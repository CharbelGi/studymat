import { API } from '../config/api';
import { getJSON, ErrorHttp } from '../services/http';

// Traductor: JSON de Open-Meteo (derecha) -> modelo de TU app (izquierda)
export function aRecurso(json) {
  // Si viene del detalle (current_weather) o de un elemento transformado de lista diaria
  const actual = json.current_weather ?? json;
  const temp = actual.temperature ?? actual.tempMax;
  const extra = actual.windspeed !== undefined
    ? `Viento: ${actual.windspeed} km/h`
    : (actual.tempMin !== undefined ? `Mínima: ${actual.tempMin}°C` : '');

  return {
    id: String(actual.time ?? 'actual'),
    titulo: temp !== undefined ? `${temp}°C` : 'Sin datos',
    descripcion: extra,
    imagen: null, // Open-Meteo devuelve weathercode numérico, no URL de imagen
  };
}

// Open-Meteo entrega los días en arreglos paralelos dentro de datos.daily
function comoLista(datos) {
  if (Array.isArray(datos)) return datos;
  if (datos.daily?.time) {
    return datos.daily.time.map((fecha, i) => ({
      time: fecha,
      tempMax: datos.daily.temperature_2m_max?.[i],
      tempMin: datos.daily.temperature_2m_min?.[i],
    }));
  }
  return datos.results ?? datos.data ?? [];
}

export async function listarRecursos({ signal } = {}) {
  const datos = await getJSON(`${API.base}${API.lista}`, { signal });
  return comoLista(datos).map(aRecurso);
}

export async function obtenerRecurso(id, { signal } = {}) {
  try {
    const datos = await getJSON(`${API.base}${API.detalle(id)}`, { signal });
    return aRecurso(datos);
  } catch (e) {
    if (e instanceof ErrorHttp && e.status === 404) return null; // no existe
    throw e;
  }
}