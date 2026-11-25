import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db, googleProvider } from './config/firebase';
import { Header } from './components/shell/Header';
import { DashboardHeader, DashboardHeaderSkeleton } from './views/DashboardHeader';
import { RegistroModal } from './components/RegistroModal';
import NotificationFloating from './components/NotificationFloating';
import NotFound from './views/NotFound';
import { Cargando } from './components/Estados';

const ListaRecursos = lazy(() => import('./views/ListaRecursos'));
const DetalleRecurso = lazy(() => import('./views/DetalleRecurso'));

export default function App() {
  const [usuarioAuth, setUsuarioAuth] = useState(null);
  const [estado, setEstado] = useState({ fase: 'cargando' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = {
    uid: usuarioAuth?.uid || null,
    email: usuarioAuth?.displayName || usuarioAuth?.email || 'Invitado',
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUsuarioAuth(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLoginGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUsuarioAuth(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const cargarDatosDesdeNube = async () => {
    setEstado({ fase: 'cargando' });

    try {
      const querySnapshot = await getDocs(collection(db, "actividades"));
      const actividades = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const tareas = actividades.filter(a => a.tipo === 'tarea').length;
      const examenes = actividades.filter(a => a.tipo === 'examen').length;
      const proyectos = actividades.filter(a => a.tipo === 'proyecto').length;

      setEstado({ 
        fase: 'listo', 
        datos: { 
          urgentCount: examenes + tareas, 
          pendingTasks: tareas, 
          upcomingExams: examenes, 
          activeProjects: proyectos,
          listaActividades: actividades
        } 
      });
    } catch (error) {
      console.error("Error al conectar con Firestore:", error);
      setEstado({ 
        fase: 'listo', 
        datos: { 
          urgentCount: 0, 
          pendingTasks: 0, 
          upcomingExams: 0, 
          activeProjects: 0,
          listaActividades: []
        } 
      });
    }
  };

  useEffect(() => {
    cargarDatosDesdeNube();
  }, []);

  return (
    <BrowserRouter>
      <div className="w-100 min-vh-100 bg-light text-dark m-0 p-0 position-relative">
        
        <Header 
          onOpenModal={() => setIsModalOpen(true)}
          onLogout={handleLogout}
          onLoginGoogle={handleLoginGoogle}
          isAuthenticated={Boolean(usuarioAuth)}
          userName={user.email} 
          userRole="Estudiante"
        />

        <Suspense fallback={<Cargando />}>
          <Routes>
            <Route path="/" element={
              <main className="container-fluid py-4 px-4" aria-live="polite">
                {estado.fase === 'cargando' && <DashboardHeaderSkeleton />}

                {estado.fase === 'listo' && (
                  <DashboardHeader 
                    userName={user.email}
                    urgentCount={estado.datos.urgentCount}
                    pendingTasks={estado.datos.pendingTasks}
                    upcomingExams={estado.datos.upcomingExams}
                    activeProjects={estado.datos.activeProjects}
                  />
                )}
              </main>
            } />

            <Route path="/recursos" element={
              <main className="container-fluid py-4 px-4">
                <ListaRecursos />
              </main>
            } />

            <Route path="/recursos/:id" element={
              <main className="container-fluid py-4 px-4">
                <DetalleRecurso />
              </main>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        <NotificationFloating 
          pendingUrgentCount={estado.datos?.urgentCount || 0} 
        />

        <RegistroModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onGuardadoExitoso={cargarDatosDesdeNube} 
        />
      </div>
    </BrowserRouter>
  );
}