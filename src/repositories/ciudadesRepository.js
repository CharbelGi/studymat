import { dbLocal } from '../db/local';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export async function buscarCiudadesPorNombre(nombre, { signal } = {}) {
  const consulta = nombre.trim();
  if (!consulta) return [];

  const params = new URLSearchParams({
    name: consulta,
    count: '6',
    language: 'es',
    format: 'json',
  });

  const resp = await fetch(`${GEOCODING_URL}?${params.toString()}`, { signal });
  if (!resp.ok) {
    throw new Error(`Error buscando ciudades (${resp.status})`);
  }

  const data = await resp.json();
  const resultados = Array.isArray(data?.results) ? data.results : [];

  return resultados.map((item) => ({
    id: String(item.id),
    nombre: item.name,
    region: item.admin1 || '',
    pais: item.country || '',
    latitude: item.latitude,
    longitude: item.longitude,
    etiqueta: '', // ej. "Casa", "Escuela", "Actual"
  }));
}

export async function listarCiudadesGuardadas() {
  const db = await dbLocal;
  return db.getAll('ciudades');
}

export async function guardarCiudadFavorita(ciudad, etiqueta = '') {
  const db = await dbLocal;
  const registro = {
    id: String(ciudad.id),
    nombre: ciudad.nombre,
    region: ciudad.region || '',
    pais: ciudad.pais || '',
    latitude: ciudad.latitude,
    longitude: ciudad.longitude,
    etiqueta: etiqueta.trim(),
    actualizadaEn: new Date().toISOString(),
  };

  await db.put('ciudades', registro);
  return db.getAll('ciudades');
}

export async function eliminarCiudadFavorita(id) {
  const db = await dbLocal;
  await db.delete('ciudades', String(id));
  return db.getAll('ciudades');
}

export async function obtenerClimaDeCiudad(ciudad, { signal } = {}) {
  const db = await dbLocal;
  const cacheKey = `ciudad:${ciudad.id}`;

  try {
    const params = new URLSearchParams({
      latitude: String(ciudad.latitude),
      longitude: String(ciudad.longitude),
      current_weather: 'true',
      daily: 'temperature_2m_max,temperature_2m_min',
      timezone: 'auto',
      forecast_days: '4',
    });

    const resp = await fetch(`${FORECAST_URL}?${params.toString()}`, { signal });
    if (!resp.ok) {
      throw new Error(`Error consultando clima (${resp.status})`);
    }

    const json = await resp.json();
    const actual = json.current_weather || {};

    const pronostico = {
      id: cacheKey,
      ciudadId: String(ciudad.id),
      ciudadNombre: ciudad.nombre,
      temperaturaActual: actual.temperature ?? null,
      vientoKmh: actual.windspeed ?? null,
      horaActual: actual.time ?? '',
      dias: Array.isArray(json.daily?.time)
        ? json.daily.time.map((fecha, idx) => ({
            fecha,
            tempMax: json.daily.temperature_2m_max?.[idx] ?? null,
            tempMin: json.daily.temperature_2m_min?.[idx] ?? null,
          }))
        : [],
      guardadoEn: new Date().toISOString(),
    };

    await db.put('climas', pronostico);
    return { pronostico, origen: 'api' };
  } catch (error) {
    if (error?.name === 'AbortError') throw error;

    const guardado = await db.get('climas', cacheKey);
    if (guardado) {
      return { pronostico: guardado, origen: 'cache' };
    }

    throw error;
  }
}