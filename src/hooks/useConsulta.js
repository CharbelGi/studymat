import { useEffect, useState } from 'react';

// Hook genérico: ejecuta una consulta y devuelve los 4 estados
export function useConsulta(clave, consultar) {
  const [intento, setIntento] = useState(0);
  const id = `${clave}#${intento}`;
  const [r, setR] = useState({});

  useEffect(() => {
    if (!clave) return; // sin clave no se consulta
    const c = new AbortController();
    consultar(c.signal)
      .then((datos) => setR({ id, datos }))
      .catch((e) => e.name !== 'AbortError' && setR({ id, error: e }));
    return () => c.abort(); // cambió la clave o se salió
  }, [clave, id, consultar]);

  const listo = r.id === id;
  return {
    datos: listo ? r.datos : undefined,
    error: listo ? r.error : undefined,
    cargando: Boolean(clave) && !listo,
    reintentar: () => setIntento((n) => n + 1),
  };
}