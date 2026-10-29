import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { auth, db } from './config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { Header } from './components/shell/Header';
import { DashboardHeader, DashboardHeaderSkeleton } from './views/DashboardHeader';
import { RegistroModal } from './components/RegistroModal';
import NotificationFloating from './components/NotificationFloating';
import Login from './components/login';
import NotFound from './views/NotFound';

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [estado, setEstado] = useState({ fase: 'cargando' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
      if (currentUser) {
        cargarDatosDesdeNube();
      }
    });

    return () => unsubscribe();
  }, []);

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
      setEstado({ fase: 'error', mensaje: "No se pudieron sincronizar los datos de Firebase." });
    }
  };

  if (checkingAuth) {
    return <div className="text-center mt-5">Cargando StudyMate...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div className="w-100 min-vh-100 bg-light text-dark m-0 p-0 position-relative">
        
        <Header 
          onOpenModal={() => setIsModalOpen(true)} 
          onLogout={() => signOut(auth)} 
          userName={user.email} 
          userRole="Estudiante"
        />

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

          <Route path="*" element={<NotFound />} />
        </Routes>

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