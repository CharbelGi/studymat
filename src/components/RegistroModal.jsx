import React, { useState } from 'react';
import { db, auth } from '../config/firebase'; // Importar auth
import { collection, addDoc } from 'firebase/firestore';

export const RegistroModal = ({ isOpen, onClose, onGuardadoExitoso }) => {
  const [tipo, setTipo] = useState('examen');
  const [titulo, setTitulo] = useState('');
  const [materia, setMateria] = useState('');
  const [fecha, setFecha] = useState('');
  const [guardando, setGuardando] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      // Guardamos la actividad vinculada al UID del usuario actual
      await addDoc(collection(db, "actividades"), {
        userId: auth.currentUser.uid, // <-- ¡Clave para separar las cuentas!
        tipo: tipo,
        titulo: titulo,
        materia: materia,
        fecha: fecha,
        completado: false,
        creadoEn: new Date()
      });

      setGuardando(false);
      setTitulo('');
      setMateria('');
      setFecha('');
      
      onGuardadoExitoso(); 
      onClose();           
    } catch (error) {
      console.error("Error al guardar en Firebase:", error);
      setGuardando(false);
      alert("No se pudo guardar el registro.");
    }
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 border-0 shadow">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">Nuevo Registro en StudyMate</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body py-3">
              <div className="mb-3">
                <label className="form-label fw-semibold">Tipo de actividad</label>
                <select className="form-select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  <option value="examen">📖 Examen</option>
                  <option value="tarea">📝 Tarea Pendiente</option>
                  <option value="proyecto">💻 Proyecto Activo</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Título / Descripción</label>
                <input type="text" className="form-control" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej. Parcial 1" required />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Materia</label>
                <input type="text" className="form-control" value5={materia} onChange={(e) => setMateria(e.target.value)} placeholder="Ej. Ingeniería de Software" required />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Fecha límite</label>
                <input type="date" className="form-control" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
              </div>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-light" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar Registro'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};