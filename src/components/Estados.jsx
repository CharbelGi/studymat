// Las 3 pantallas que NO son datos: cargando, error y vacío
export function Cargando() {
  return (
    <div className="text-center py-5" role="status">
      <div className="spinner-border" aria-hidden="true" />
      <p className="mt-2 mb-0">Cargando...</p>
    </div>
  );
}

export function ErrorCarga({ mensaje, onReintentar }) {
  return (
    <div className="alert alert-danger d-flex align-items-center gap-3" role="alert">
      <span className="flex-grow-1">{mensaje}</span>
      <button className="btn btn-outline-danger btn-sm" onClick={onReintentar}>
        Reintentar
      </button>
    </div>
  );
}

export function Vacio({ texto = 'No hay resultados' }) {
  return <p className="text-center text-body-secondary py-5">{texto}</p>;
}