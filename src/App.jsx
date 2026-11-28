import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { auth, db } from './config/firebase';
import { Header } from './components/shell/Header';
import { DashboardHeader, DashboardHeaderSkeleton } from './views/DashboardHeader';
import { RegistroModal } from './components/RegistroModal';
import NotificationFloating from './components/NotificationFloating';
import NotFound from './views/NotFound';
import { Cargando } from './components/Estados';

const ListaRecursos = lazy(() => import('./views/ListaRecursos'));
const DetalleRecurso = lazy(() => import('./views/DetalleRecurso'));
const CiudadesClima = lazy(() => import('./views/CiudadesClima'));

const DATOS_VACIOS = {
  urgentCount: 0,
  pendingTasks: 0,
  upcomingExams: 0,
  activeProjects: 0,
  listaActividades: [],
};

export default function App() {
  const [estado, setEstado] = useState({ fase: 'cargando', datos: DATOS_VACIOS });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuario, setUsuario] = useState(() => auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user || null);
    });
    return () => unsubscribe();
  }, []);

  const handleLoginGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const cred = await signInWithPopup(auth, provider);
      setUsuario(cred.user);
    } catch (error) {
      if (error?.code === 'auth/popup-closed-by-user') {
        return;
      }

      if (
        error?.code === 'auth/popup-blocked' ||
        error?.code === 'auth/cancelled-popup-request'
      ) {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError) {
          console.error('Error al redirigir a Google:', redirectError);
        }
      }

      console.error('Error al iniciar sesión con Google:', error);
      alert(error?.message || 'No se pudo iniciar sesión con Google.');
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      setUsuario(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }, []);

  const cargarDatosDesdeNube = useCallback(async () => {
    setEstado((prev) => ({ ...prev, fase: 'cargando' }));

    try {
      const querySnapshot = await getDocs(collection(db, 'actividades'));
      const actividades = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const tareas = actividades.filter((a) => a.tipo === 'tarea').length;
      const examenes = actividades.filter((a) => a.tipo === 'examen').length;
      const proyectos = actividades.filter((a) => a.tipo === 'proyecto').length;

      setEstado({
        fase: 'listo',
        datos: {
          urgentCount: examenes + tareas,
          pendingTasks: tareas,
          upcomingExams: examenes,
          activeProjects: proyectos,
          listaActividades: actividades,
        },
      });
    } catch (error) {
      console.error('Error al conectar con Firestore:', error);
      setEstado({
        fase: 'listo',
        datos: DATOS_VACIOS,
      });
    }
  }, []);

  useEffect(() => {
    cargarDatosDesdeNube();
  }, [cargarDatosDesdeNube]);

  const nombreUsuario = usuario?.displayName || usuario?.email || 'Invitado';

  return (
    <div className="w-100 min-vh-100 bg-light text-dark m-0 p-0 position-relative">
      <Header
        onOpenModal={() => setIsModalOpen(true)}
        onLoginGoogle={handleLoginGoogle}
        onLogout={handleLogout}
        isAuthenticated={Boolean(usuario)}
        userName={nombreUsuario}
        userRole="Estudiante"
      />

      <Suspense fallback={<Cargando />}>
        <Routes>
          <Route
            path="/"
            element={
              <main className="container-fluid py-4 px-4" aria-live="polite">
                <ListaRecursos />
              </main>
            }
          />

          <Route
            path="/panel"
            element={
              <main className="container-fluid py-4 px-4" aria-live="polite">
                {estado.fase === 'cargando' && <DashboardHeaderSkeleton />}

                {estado.fase === 'listo' && (
                  <DashboardHeader
                    userName={nombreUsuario}
                    urgentCount={estado.datos.urgentCount}
                    pendingTasks={estado.datos.pendingTasks}
                    upcomingExams={estado.datos.upcomingExams}
                    activeProjects={estado.datos.activeProjects}
                  />
                )}
              </main>
            }
          />

          <Route
            path="/ciudades"
            element={
              <main className="container-fluid py-4 px-4">
                <CiudadesClima />
              </main>
            }
          />

          <Route
            path="/recursos"
            element={
              <main className="container-fluid py-4 px-4">
                <ListaRecursos />
              </main>
            }
          />

          <Route
            path="/recursos/:id"
            element={
              <main className="container-fluid py-4 px-4">
                <DetalleRecurso />
              </main>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <NotificationFloating pendingUrgentCount={estado.datos?.urgentCount || 0} />

      <RegistroModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGuardadoExitoso={cargarDatosDesdeNube}
      />
    </div>
  );
}