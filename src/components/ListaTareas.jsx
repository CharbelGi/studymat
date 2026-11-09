import React, { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';

export const ListaTareas = () => {
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Función para obtener las tareas desde Firebase
  const obtenerTareas = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, "actividades"),
        where("userId", "==", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const lista = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTareas(lista);
    } catch (error) {
      console.error("Error al obtener tareas:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerTareas();
  }, []);

  // Función para marcar como completada
  const cambiarEstado = async (id, estadoActual) => {
    try {
      const tareaRef = doc(db, "actividades", id);
      await updateDoc(tareaRef, { completado: !estadoActual });
      obtenerTareas(); // Recargar lista
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
    }
  };

  // 🎨 Lógica de colores según la fecha límite
  const calcularIndicadorTiempo = (fechaLimite) => {
    if (!fechaLimite) return { texto: 'Sin fecha', clase: 'bg-secondary text-white', icono: <Clock size={14}/> };

    const hoy = new Date();
    const limite = new Date(fechaLimite + 'T23:59:59'); // Fin del día límite
    const diferenciaDias = Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24));

    if (diferenciaDias < 0) {
      return { texto: 'Vencido', clase: 'bg-danger text-white', icono: <AlertTriangle size={14}/> };
    } else if (diferenciaDias === 0) {
      return { texto: '¡Es hora / Vence hoy!', clase: 'bg-warning text-dark fw-bold animate-pulse', icono: <AlertTriangle size={14}/> };
    } else if (diferenciaDias <= 2) {
      return { texto: `Faltan ${diferenciaDias} días`, clase: 'bg-info text-dark', icono: <Clock size={14}/> };
    } else {
      return { texto: `Faltan ${diferenciaDias} días`, clase: 'bg-success text-white', icono: <CheckCircle size={14}/> };
    }
  };

  if (cargando) {
    return <div className="text-center py-4 text-muted">Cargando tus registros...</div>;
  }

  return (
    <div className="w-100 mt-4">
      <h4 className="fw-bold mb-3 fs-5">Mis Tareas y Actividades Ingresadas</h4>
      
      {tareas.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border shadow-sm">
          <p className="text-muted mb-0">No hay tareas o registros guardados todavía.</p>
        </div>
      ) : (
        <div className="row g-3">
          {tareas.map((t) => {
            const indicador = calcularIndicadorTiempo(t.fecha);

            return (
              <div key={t.id} className="col-12 col-md-6 col-lg-4">
                <div className={`card border-0 shadow-sm rounded-4 p-3 h-100 ${t.completado ? 'opacity-50 bg-light' : 'bg-white'}`}>
                  
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-primary bg-opacity-10 text-primary text-uppercase fw-semibold" style={{ fontSize: '0.65rem' }}>
                      {t.tipo || 'tarea'}
                    </span>
                    
                    {/* Etiqueta de colores inteligente */}
                    <span className={`badge rounded-pill px-2 py-1 d-flex align-items-center gap-1 ${indicador.clase}`} style={{ fontSize: '0.7rem' }}>
                      {indicador.icono}
                      {indicador.texto}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark fs-6 mb-1">{t.materia}</h5>
                  <p className="text-muted small mb-3">{t.titulo}</p>

                  <div className="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                    <small className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                      <Calendar size={13} /> Límite: {t.fecha}
                    </small>

                    <button 
                      onClick={() => cambiarEstado(t.id, t.completado)}
                      className={`btn btn-sm rounded-pill px-3 ${t.completado ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {t.completado ? 'Completada ✓' : 'Marcar lista'}
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};