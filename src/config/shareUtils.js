/**
 * Función genérica para compartir contenido usando la Web Share API o el portapapeles.
 * @param {Object} data - { title, text, url }
 */
export const compartirContenido = async ({ title, text, url }) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: title || 'StudyMate',
        text: text || '¡Mira mi avance en StudyMate!',
        url: url || window.location.href,
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error al compartir:", error);
      }
    }
  } else {
    try {
      const textoCompleto = `${title}\n${text}\n${url || window.location.href}`;
      await navigator.clipboard.writeText(textoCompleto);
      alert("¡Enlace/Contenido copiado al portapapeles!");
    } catch (err) {
      console.error("No se pudo copiar", err);
    }
  }
};