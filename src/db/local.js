import { openDB } from 'idb';

export const dbLocal = openDB('clima-pwa-db', 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('climas')) {
      db.createObjectStore('climas', { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('reportes')) {
      const store = db.createObjectStore('reportes', {
        keyPath: 'id',
        autoIncrement: true,
      });
      store.createIndex('sincronizado', 'sincronizado', { unique: false });
    }

    if (!db.objectStoreNames.contains('ciudades')) {
      db.createObjectStore('ciudades', { keyPath: 'id' });
    }
  },
});