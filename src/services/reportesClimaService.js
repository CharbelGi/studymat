import { auth } from '../config/firebase';
import {
  guardarReporteEnIndexedDB,
  obtenerReportesLocales,
  sincronizarFotosYComentariosConFirebase,
} from './fotosComentariosIndexedDB';

export async function crearReporteClima({
  estadoClima = 'mal',
  comentario = '',
  archivoFoto = null,
  usuario = null,
}) {
  const usuarioActual = usuario || auth.currentUser;

  // 1. Guardar siempre primero en IndexedDB (caché local)
  const guardadoLocal = await guardarReporteEnIndexedDB({
    estadoClima,
    comentario,
    archivoFoto,
    usuarioEmail: usuarioActual?.email || usuarioActual?.displayName || 'Invitado',
    usuarioUid: usuarioActual?.uid || null,
  });

  // 2. Si hay sesión activa y conexión, mandar a Firestore desde lo local
  let sincronizado = false;
  if (usuarioActual && navigator.onLine) {
    const resSync = await sincronizarFotosYComentariosConFirebase();
    sincronizado = (resSync?.sincronizados || 0) > 0;
  }

  return {
    ...guardadoLocal,
    sincronizado,
  };
}

export async function listarReportesClima() {
  return await obtenerReportesLocales();
}