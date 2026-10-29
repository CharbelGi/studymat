import React, { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Camera, Upload, Loader2, CheckCircle2, Sparkles } from 'lucide-react';

export const RegistroModal = ({ isOpen, onClose, onGuardadoExitoso }) => {
  const [tipo, setTipo] = useState('tarea');
  const [titulo, setTitulo] = useState('');
  const [materia, setMateria] = useState('');
  const [fecha, setFecha] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Estados para el OCR y detección de dispositivo
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [esMovil, setEsMovil] = useState(false);

  // Detección limpia de pantalla táctil / móvil
  useEffect(() => {
    const checarMovil = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      setEsMovil(/android|iphone|ipad|ipod/i.test(userAgent) || window.innerWidth < 768);
    };
    checarMovil();
    window.addEventListener('resize', checarMovil);
    return () => window.removeEventListener('resize', checarMovil);
  }, []);

  if (!isOpen) return null;

  // 📸 Función para escanear con OCR.Space
  const handleOcrImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrSuccess(false);

    try {
      const base64Image = await convertToBase64(file);

      const myHeaders = new Headers();
      myHeaders.append("apikey", "helloworld"); // Reemplaza por tu API Key de OCR.Space

      const formdata = new FormData();
      formdata.append("base64Image", base64Image);
      formdata.append("language", "spa");
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
          const lines = extractedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

          if (lines.length > 0) {
            setMateria(lines[0]);
            setTitulo(lines.slice(1).join(' ') || lines[0]);
          } else {
            setTitulo(extractedText);
          }

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
        <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
          
          <div className="modal-header border-0 pb-0 pt-4 px-4">
            <h5 className="modal-title fw-bold text-dark">Nuevo Registro en StudyMate</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body py-3 px-4">
              
              {/* Selector de tipo de actividad */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary small">Tipo de actividad</label>
                <select 
                  className="form-select rounded-3 py-2 fw-medium border-light-subtle shadow-sm" 
                  value={tipo} 
                  onChange={(e) => setTipo(e.target.value)}
                >
                  <option value="tarea">📝 Tarea Pendiente</option>
                  <option value="proyecto">💻 Proyecto Activo</option>
                  <option value="examen">📖 Examen</option>
                </select>
              </div>

              {/* 📷 SECCIÓN DE ESCÁNER CON INTELIGENCIA (Solo se muestra en Tareas o Proyectos, NO en Exámenes) */}
              {tipo !== 'examen' && (
                <div 
                  className="mb-4 p-3 rounded-4 border border-1 border-primary-subtle bg-primary bg-opacity-10 position-relative"
                  style={{ transition: 'all 0.3s ease' }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="fw-semibold text-primary d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                      <Sparkles size={16} />
                      {esMovil ? 'Escanear apunte con la cámara' : 'Autocompletar con imagen'}
                    </span>
                    <span className="badge bg-primary text-white rounded-pill px-2 py-1" style={{ fontSize: '0.65rem' }}>
                      IA OCR
                    </span>
                  </div>

                  <p className="text-muted mb-3" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}>
                    {esMovil 
                      ? 'Toma una foto a tu hoja o libreta. La 1ra línea irá a Materia y el resto al Título.' 
                      : 'Sube una captura o imagen de tu tarea para rellenar los datos automáticamente.'}
                  </p>
                  
                  {/* Botón personalizado responsive */}
                  <label 
                    htmlFor="ocr-input" 
                    className={`btn w-100 d-flex align-items-center justify-content-center gap-2 rounded-3 py-2 fw-semibold shadow-sm ${
                      ocrLoading ? 'btn-secondary disabled' : 'btn-primary'
                    }`}
                    style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5', cursor: 'pointer' }}
                  >
                    {ocrLoading ? (
                      <>
                        <Loader2 className="spinner-border spinner-border-sm" size={16} />
                        <span style={{ fontSize: '0.85rem' }}>Analizando imagen con OCR...</span>
                      </>
                    ) : (
                      <>
                        {esMovil ? <Camera size={18} /> : <Upload size={18} />}
                        <span style={{ fontSize: '0.85rem' }}>
                          {esMovil ? 'Abrir Cámara y Tomar Foto' : 'Seleccionar Archivo de Imagen'}
                        </span>
                      </>
                    )}
                  </label>

                  <input 
                    id="ocr-input"
                    type="file" 
                    accept="image/*" 
                    capture={esMovil ? "environment" : undefined} 
                    onChange={handleOcrImage}
                    className="d-none" // Ocultamos el input feo del navegador para usar la tarjeta estilizada
                    disabled={ocrLoading}
                  />

                  {ocrSuccess && !ocrLoading && (
                    <div className="d-flex align-items-center gap-2 text-success mt-2 fw-semibold" style={{ fontSize: '0.8rem' }}>
                      <CheckCircle2 size={16} />
                      <span>¡Campos rellenados automáticamente con éxito!</span>
                    </div>
                  )}
                </div>
              )}

              {/* Campos del Formulario */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary small">Materia</label>
                <input 
                  type="text" 
                  className="form-control rounded-3 py-2" 
                  value={materia} 
                  onChange={(e) => setMateria(e.target.value)} 
                  placeholder={tipo !== 'examen' ? "Ej. Ingeniería de Software (o usa el escáner)" : "Ej. Ingeniería de Software"} 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary small">Título / Descripción</label>
                <input 
                  type="text" 
                  className="form-control rounded-3 py-2" 
                  value={titulo} 
                  onChange={(e) => setTitulo(e.target.value)} 
                  placeholder="Ej. Avance del sprint 2" 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary small">Fecha límite</label>
                <input 
                  type="date" 
                  className="form-control rounded-3 py-2" 
                  value={fecha} 
                  onChange={(e) => setFecha(e.target.value)} 
                  required 
                />
              </div>

            </div>

            <div className="modal-footer border-0 pt-0 pb-4 px-4">
              <button type="button" className="btn btn-light rounded-3 px-4 fw-medium" onClick={onClose}>
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary rounded-3 px-4 fw-semibold" 
                disabled={guardando || ocrLoading}
                style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5' }}
              >
                {guardando ? 'Guardando...' : 'Guardar Registro'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};