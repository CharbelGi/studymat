import { API } from '../config/api';
import { getJSON, ErrorHttp } from '../services/http';
import { dbLocal } from '../db/local';

// Traductor: JSON de Open-Meteo (derecha) -> modelo de TU app (izquierda)
export function aRecurso(json) {
  const actual = json.current_weather ?? json;
  const temp = actual.temperature ?? actual.tempMax;
  const extra = actual.windspeed !== undefined
    ? `Viento: ${actual.windspeed} km/h`
    : (actual.tempMin !== undefined ? `Mínima: ${actual.tempMin}°C` : '');

  return {
    id: String(actual.time ?? 'actual'),
    titulo: temp !== undefined ? `${temp}°C` : 'Sin datos',
    descripcion: extra,
    imagen: null,
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
  const db = await dbLocal;

  try {
    const datos = await getJSON(`${API.base}${API.lista}`, { signal });
    const lista = comoLista(datos).map(aRecurso);

    if (lista.length > 0) {
      const tx = db.transaction('climas', 'readwrite');
      await Promise.all([...lista.map((item) => tx.store.put(item)), tx.done]);
    }

    return { datos: lista, origen: 'api' };
  } catch (e) {
    if (e?.name === 'AbortError') throw e;

    const locales = await db.getAll('climas');
    if (Array.isArray(locales) && locales.length > 0) {
      return { datos: locales, origen: 'cache' };
    }

    throw e;
  }
}

export async function obtenerRecurso(id, { signal } = {}) {
  const db = await dbLocal;

  try {
    const datos = await getJSON(`${API.base}${API.detalle(id)}`, { signal });
    const recurso = aRecurso(datos);

    if (recurso) {
      await db.put('climas', recurso);
    }

    return { recurso, origen: 'api' };
  } catch (e) {
    if (e?.name === 'AbortError') throw e;

    const encontrado = await db.get('climas', String(id));
    if (encontrado) {
      return { recurso: encontrado, origen: 'cache' };
    }

    if (e instanceof ErrorHttp && e.status === 404) return null;
    throw e;
  }
}