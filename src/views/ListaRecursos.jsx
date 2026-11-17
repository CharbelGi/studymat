import { useListaRecursos } from '../hooks/useRecursos';
import TarjetaRecurso from '../components/TarjetaRecurso';
import { Cargando, ErrorCarga, Vacio } from '../components/Estados';

export default function ListaRecursos() {
  const { cargando, datos, error, reintentar } = useListaRecursos();

  if (cargando) return <Cargando />;
  if (error) return <ErrorCarga mensaje={error.message} onReintentar={reintentar} />;
  if (!datos.length) return <Vacio />;

  return (
    <div className="row row-cols-2 row-cols-md-4 g-3">
      {datos.map((recurso) => (
        <div className="col" key={recurso.id}>
          <TarjetaRecurso recurso={recurso} />
        </div>
      ))}
    </div>
  );
}