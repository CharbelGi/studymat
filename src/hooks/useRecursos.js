import { useCallback } from 'react';
import { useConsulta } from './useConsulta';
import { listarRecursos, obtenerRecurso } from '../repositories/recursosRepository';

export function useListaRecursos() {
  const consultar = useCallback((signal) => listarRecursos({ signal }), []);
  const consulta = useConsulta('recursos', consultar);

  const payload = consulta?.datos && Array.isArray(consulta.datos.datos)
    ? consulta.datos
    : (consulta?.data && Array.isArray(consulta.data.datos) ? consulta.data : consulta);

  return {
    cargando: consulta.cargando,
    datos: Array.isArray(payload?.datos) ? payload.datos : [],
    origen: payload?.origen || 'api',
    error: consulta.error,
    reintentar: consulta.reintentar,
  };
}

export function useRecurso(id) {
  const consultar = useCallback(
    (signal) => obtenerRecurso(id, { signal }),
    [id]
  );
  const consulta = useConsulta(id ? `recurso:${id}` : null, consultar);

  const payload = consulta?.datos?.recurso !== undefined
    ? consulta.datos
    : (consulta?.data?.recurso !== undefined ? consulta.data : consulta);

  return {
    cargando: consulta.cargando,
    datos: payload?.recurso ?? payload?.datos ?? null,
    origen: payload?.origen || 'api',
    error: consulta.error,
    reintentar: consulta.reintentar,
  };
}