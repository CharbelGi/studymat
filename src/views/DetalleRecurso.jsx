import { Link, useParams } from 'react-router-dom';
import { useRecurso } from '../hooks/useRecursos';
import { Cargando, ErrorCarga, Vacio } from '../components/Estados';

export default function DetalleRecurso() {
  const { id } = useParams(); // sale de /recursos/:id
  const { cargando, datos: recurso, error, reintentar } = useRecurso(id);

  if (cargando) return <Cargando />;
  if (error) return <ErrorCarga mensaje={error.message} onReintentar={reintentar} />;
  if (!recurso) return <Vacio texto="Ese elemento no existe" />;

  return (
    <article className="card p-4">
      {recurso.imagen && (
        <img src={recurso.imagen} alt="" className="img-fluid rounded mb-3" />
      )}
      <span className="badge bg-primary-subtle text-primary mb-2 align-self-start">
        📅 Consulta: {id}
      </span>
      <h1 className="h3">{recurso.titulo}</h1>
      <p className="text-body-secondary">{recurso.descripcion}</p>
      <div>
        <Link to="/recursos" className="btn btn-outline-secondary btn-sm">
          Volver
        </Link>
      </div>
    </article>
  );
}