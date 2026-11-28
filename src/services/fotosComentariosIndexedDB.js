import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { dbLocal } from '../db/local';

const STORE_REPORTES = 'reportes';
const COLECCION_FIRESTORE = 'reportes_clima';

function archivoADataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function guardarReporteEnIndexedDB({
  estadoClima = 'mal',
  comentario = '',
  archivoFoto = null,
  usuarioEmail = 'Invitado',
  usuarioUid = null,
}) {
  const previewLocalUrl = await archivoADataUrl(archivoFoto);
  const database = await dbLocal;

  const registro = {
    keyUnica: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    estadoClima,
    comentario: (comentario || '').trim(),
    tieneFotoLocal: Boolean(archivoFoto),
    nombreFotoLocal: archivoFoto?.name || null,
    previewLocalUrl,
    usuarioEmail,
    usuarioUid,
    sincronizado: false,
    firestoreId: null,
    creadoEn: new Date().toISOString(),
  };

  const id = await database.add(STORE_REPORTES, registro);
  return { ...registro, id };
}

export async function obtenerReportesLocales() {
  const database = await dbLocal;
  const lista = await database.getAll(STORE_REPORTES);
  return lista.sort((a, b) => (b.creadoEn || '').localeCompare(a.creadoEn || ''));
}

export async function marcarReporteSincronizado(idLocal, firestoreId) {
  const database = await dbLocal;
  const actual = await database.get(STORE_REPORTES, idLocal);
  if (!actual) return null;

  const actualizado = {
    ...actual,
    sincronizado: true,
    firestoreId,
    usuarioEmail: auth.currentUser?.email || actual.usuarioEmail || 'Invitado',
    usuarioUid: auth.currentUser?.uid || actual.usuarioUid || null,
  };

  await database.put(STORE_REPORTES, actualizado);
  return actualizado;
}

export async function sincronizarFotosYComentariosConFirebase() {
  const usuario = auth.currentUser;
  if (!usuario) return { sincronizados: 0, motivo: 'sin_sesion' };
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { sincronizados: 0, motivo: 'sin_conexion' };
  }

  const locales = await obtenerReportesLocales();
  const pendientes = locales.filter((item) => !item.sincronizado);
  let sincronizados = 0;

  for (const item of pendientes) {
    try {
      let firestoreId = item.firestoreId || null;

      if (!firestoreId) {
        const docRef = await addDoc(collection(db, COLECCION_FIRESTORE), {
          estadoClima: item.estadoClima === 'bien' ? 'bien' : 'mal',
          comentario: item.comentario || '',
          tieneFotoLocal: Boolean(item.tieneFotoLocal),
          nombreFotoLocal: item.nombreFotoLocal || null,
          autorUid: usuario.uid,
          autorEmail: usuario.email || null,
          autorNombre: usuario.displayName || usuario.email || 'Usuario',
          idLocal: item.id,
          keyUnica: item.keyUnica,
          creadoEnLocal: item.creadoEn,
          creadoEnFirestore: serverTimestamp(),
        });
        firestoreId = docRef.id;
      }

      await marcarReporteSincronizado(item.id, firestoreId);
      sincronizados += 1;
    } catch (error) {
      console.error('Error al sincronizar reporte con Firestore:', error);
    }
  }

  return { sincronizados, motivo: 'ok' };
}