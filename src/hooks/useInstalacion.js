import { useSyncExternalStore } from 'react'

// Se registra al cargar el módulo: así no perdemos el evento
// aunque Chrome lo dispare antes de que React termine de montar.
let aviso = null
const oyentes = new Set()
const notificar = () => oyentes.forEach((fn) => fn())

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault() // evita el aviso automático del navegador
  aviso = e // lo guardamos para usarlo con NUESTRO botón
  notificar()
})

window.addEventListener('appinstalled', () => {
  aviso = null // ya se instaló: ocultamos el botón
  notificar()
})

function suscribir(fn) {
  oyentes.add(fn)
  return () => oyentes.delete(fn)
}

export function useInstalacion() {
  const evento = useSyncExternalStore(suscribir, () => aviso)

  async function instalar() {
    if (!evento) return
    evento.prompt() // muestra el diálogo del navegador
    const { outcome } = await evento.userChoice
    console.log('Instalación:', outcome) // accepted | dismissed
    aviso = null // prompt() solo se puede usar una vez
    notificar()
  }

  return { puedeInstalar: evento !== null, instalar }
}