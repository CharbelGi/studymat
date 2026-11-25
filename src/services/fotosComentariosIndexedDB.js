import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const DB_NAME = 'StudyMateReportesDB';
const DB_VERSION = 1;
const STORE_NAME = 'reportes';
const COLECCION_FIRESTORE = 'reportes_clima';

function abrirDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('sincronizado', 'sincronizado', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

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
  const database = await abrirDB();

  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const ahoraISO = new Date().toISOString();
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
      creadoEn: ahoraISO,
    };

    const req = store.add(registro);
    req.onsuccess = () => resolve({ ...registro, id: req.result });
    req.onerror = () => reject(req.error);
  });
}

export async function obtenerReportesLocales() {
  const database = await abrirDB();

  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => {
      const lista = req.result || [];
      lista.sort((a, b) => (b.creadoEn || '').localeCompare(a.creadoEn || ''));
      resolve(lista);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function marcarReporteSincronizado(idLocal, firestoreId) {
  const database = await abrirDB();

  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(idLocal);

    getReq.onsuccess = () => {
      const actual = getReq.result;
      if (!actual) {
        resolve(null);
        return;
      }

      actual.sincronizado = true;
      actual.firestoreId = firestoreId;
      actual.usuarioEmail = auth.currentUser?.email || actual.usuarioEmail || 'Invitado';
      actual.usuarioUid = auth.currentUser?.uid || actual.usuarioUid || null;

      const putReq = store.put(actual);
      putReq.onsuccess = () => resolve(actual);
      putReq.onerror = () => reject(putReq.error);
    };

    getReq.onerror = () => reject(getReq.error);
  });
}

export async function sincronizarFotosYComentariosConFirebase() {
  const usuario = auth.currentUser;
  if (!usuario) {
    return { sincronizados: 0, motivo: 'sin_sesion' };
  }

  if (!navigator.onLine) {
    return { sincronizados: 0, motivo: 'sin_conexion' };
  }

  const locales = await obtenerReportesLocales();
  const pendientes = locales.filter((item) => !item.sincronizado);

  let sincronizados = 0;

  for (const item of pendientes) {
    try {
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

      await marcarReporteSincronizado(item.id, docRef.id);
      sincronizados += 1;
    } catch (error) {
      console.error('Error al sincronizar reporte con Firestore:', error);
    }
  }

  return { sincronizados, motivo: 'ok' };
}