import React, { useState } from 'react';
import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Campos del formulario organizados
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        // 1. Crear usuario en Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Guardar información adicional ordenada en Firestore
        await setDoc(doc(db, "usuarios", user.uid), {
          uid: user.uid,
          nombre: nombre,
          apellido: apellido,
          usuario: usuario,
          email: email,
          creadoEn: new Date()
        });
      } else {
        // Iniciar sesión
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error. Verifica tus datos o contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light p-3">
      
      {/* Tarjeta contenedora principal fija y simétrica */}
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden w-100" style={{ maxWidth: '950px' }}>
        <div className="row g-0 align-items-stretch">
          
          {/* ========================================================
              COLUMNA DE LA IMAGEN REAL (Cambia de lado de forma limpia)
             ======================================================== */}
          <div className={`col-lg-6 d-none d-lg-flex flex-column justify-content-between p-5 text-white position-relative ${isRegistering ? 'order-lg-2' : 'order-lg-1'}`}
               style={{ 
                 backgroundImage: 'linear-gradient(rgba(13, 110, 253, 0.75), rgba(111, 66, 193, 0.85)), url("https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop")',
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 minHeight: '550px'
               }}>
            <div>
              <span className="badge bg-white text-primary px-3 py-2 rounded-pill fw-bold shadow-sm">StudyMate Platform</span>
            </div>
            <div>
              <h2 className="fw-bold mb-3 display-6">Organiza tu éxito académico</h2>
              <p className="lead fs-6 text-white-50 mb-0">
                {isRegistering 
                  ? 'Crea tu cuenta hoy y mantén el control absoluto de tus exámenes, tareas y proyectos universitarios.' 
                  : 'Accede a tu panel personalizado y continúa con tus metas académicas sin distracciones.'}
              </p>
            </div>
            <div className="small text-white-50">
              <span>Desarrollado para estudiantes exigentes 🚀</span>
            </div>
          </div>

          {/* ========================================================
              COLUMNA DEL FORMULARIO (Mismo tamaño y altura)
             ======================================================== */}
          <div className={`col-lg-6 d-flex flex-column justify-content-center p-4 p-md-5 bg-white ${isRegistering ? 'order-lg-1' : 'order-lg-2'}`}
               style={{ minHeight: '550px' }}>
            
            <div className="text-center mb-3">
              <h4 className="fw-bold text-dark">{isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}</h4>
              <p className="text-muted small mb-3">
                {isRegistering ? 'Completa tus datos para registrarte' : 'Ingresa tus credenciales para acceder'}
              </p>
            </div>

            {error && <div className="alert alert-danger py-2 small mb-3 text-center">{error}</div>}

            <form onSubmit={handleSubmit}>
              
              {/* Campos de Registro ordenados */}
              {isRegistering && (
                <>
                  <div className="mb-2">
                    <label className="form-label fw-semibold small mb-1">Nombre</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      value={nombre} 
                      onChange={(e) => setNombre(e.target.value)} 
                      placeholder="Ej. Fernando David" 
                      required 
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label fw-semibold small mb-1">Apellido</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      value={apellido} 
                      onChange={(e) => setApellido(e.target.value)} 
                      placeholder="Ej. Vázquez" 
                      required 
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label fw-semibold small mb-1">Nombre de fernando</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      value={usuario} 
                      onChange={(e) => setUsuario(e.target.value)} 
                      placeholder="Ej. fernyGlow" 
                      required 
                    />
                  </div>
                </>
              )}

              {/* Campos comunes */}
              <div className="mb-2">
                <label className="form-label fw-semibold small mb-1">Correo electrónico</label>
                <input 
                  type="email" 
                  className="form-control form-control-sm" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="tu@correo.com" 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small mb-1">Contraseña</label>
                <input 
                  type="password" 
                  className="form-control form-control-sm" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
              </div>

              <button type="submit" className="w-100 btn btn-primary py-2 fw-semibold shadow-sm mb-3" disabled={loading}>
                {loading ? 'Procesando...' : (isRegistering ? 'Completar Registro' : 'Iniciar Sesión')}
              </button>
            </form>

            <div className="text-center">
              <button 
                type="button" 
                className="btn btn-link text-decoration-none p-0 text-muted small"
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}