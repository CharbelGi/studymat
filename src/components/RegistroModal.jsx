import React, { useState } from 'react';
import { db, auth } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Camera, Loader2, CheckCircle2 } from 'lucide-react';

export const RegistroModal = ({ isOpen, onClose, onGuardadoExitoso }) => {
  const [tipo, setTipo] = useState('examen');
  const [titulo, setTitulo] = useState('');
  const [materia, setMateria] = useState('');
  const [fecha, setFecha] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Estados para controlar el proceso de la API OCR
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);

  if (!isOpen) return null;

  // 📸 Función que toma la foto/archivo y la manda a la API de OCR.Space
  const handleOcrImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrSuccess(false);

    try {
      const base64Image = await convertToBase64(file);

      const myHeaders = new Headers();
      myHeaders.append("apikey", "helloworld"); // Clave genérica de pruebas o tu API Key de OCR.Space

      const formdata = new FormData();
      formdata.append("base64Image", base64Image);
      formdata.append("language", "spa"); // Idioma español
      formdata.append("isOverlayRequired", "false");
      formdata.append("scale", "true");
      formdata.append("OCREngine", "2");

      const response = await fetch("https://api.ocr.space/parse/image", {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow'
      });

      const result = await response.json();

      if (result && result.ParsedResults && result.ParsedResults.length > 0) {
        const extractedText = result.ParsedResults[0].ParsedText.trim();
        if (extractedText) {
          // Rellena automáticamente el título con lo que leyó la API de la foto
          setTitulo(extractedText);
          setOcrSuccess(true);
        } else {
          alert("No se pudo detectar texto claro en la imagen.");
        }
      } else {
        alert("Error al procesar la respuesta de la API.");
      }
    } catch (error) {
      console.error("Error en la petición OCR:", error);
      alert("Ocurrió un error al escanear la imagen.");
    } finally {
      setOcrLoading(false);
    }
  };

  // Convertir imagen a Base64 para enviarla en la petición POST
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      await addDoc(collection(db, "actividades"), {
        userId: auth.currentUser.uid, 
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
      setOcrSuccess(false);
      
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
              
              {/* 📷 SECCIÓN DE CÁMARA DIRECTA Y API OCR.SPACE */}
              <div className="mb-3 p-3 bg-light rounded-3 border border-dashed">
                <label className="form-label fw-semibold text-primary d-flex align-items-center gap-2 mb-1" style={{ fontSize: '0.85rem' }}>
                  <Camera size={18} />
                  Tomar foto con la cámara (API OCR)
                </label>
                <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                  Usa tu cámara para fotografiar tu tarea y extraer el texto automáticamente.
                </p>
                
                {/* Atributos configurados para invocar la cámara del dispositivo móvil */}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  onChange={handleOcrImage}
                  className="form-control form-control-sm"
                  disabled={ocrLoading}
                />

                {ocrLoading && (
                  <div className="d-flex align-items-center gap-2 text-primary mt-2" style={{ fontSize: '0.8rem' }}>
                    <Loader2 className="spinner-border spinner-border-sm" size={14} />
                    <span>Analizando imagen con OCR.Space...</span>
                  </div>
                )}

                {ocrSuccess && !ocrLoading && (
                  <div className="d-flex align-items-center gap-2 text-success mt-2 fw-semibold" style={{ fontSize: '0.8rem' }}>
                    <CheckCircle2 size={14} />
                    <span>¡Texto extraído de la foto e insertado con éxito!</span>
                  </div>
                )}
              </div>

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
                <input 
                  type="text" 
                  className="form-control" 
                  value={titulo} 
                  onChange={(e) => setTitulo(e.target.value)} 
                  placeholder="Se rellenará con la foto o escríbelo aquí" 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Materia</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={materia} 
                  onChange={(e) => setMateria(e.target.value)} 
                  placeholder="Ej. Ingeniería de Software" 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Fecha límite</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={fecha} 
                  onChange={(e) => setFecha(e.target.value)} 
                  required 
                />
              </div>

            </div>

            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-light" onClick5={onClose} onClick={onClose}>Cancelar</button>
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