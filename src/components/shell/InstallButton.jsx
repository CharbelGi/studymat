import { useState } from 'react'
import { useInstalacion } from '../../hooks/useInstalacion.js'

const yaInstalada = 
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true // iPhone / iPad

const esIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent)

export default function InstallButton() {
  const { puedeInstalar, instalar } = useInstalacion()
  const [ayuda, setAyuda] = useState(false)

  if (yaInstalada) return null // abierta como app: no hay nada que instalar

  if (puedeInstalar) {
    return (
      <button className="btn btn-light btn-sm text-nowrap" onClick={instalar}>
        <i className="bi bi-download me-1" aria-hidden="true"></i>
        Instalar
      </button>
    )
  }

  if (!esIOS) return null // navegador sin soporte: no mostramos nada

  // iOS no tiene beforeinstallprompt: damos instrucciones
  return (
    <>
      <button 
        className="btn btn-light btn-sm text-nowrap"
        onClick={() => setAyuda(!ayuda)}
      >
        <i className="bi bi-download me-1" aria-hidden="true"></i>
        Instalar
      </button>
      {ayuda && (
        <div className="ayuda-ios alert alert-light shadow small mb-0">
          Toca <i className="bi bi-box-arrow-up"></i> <b>Compartir</b> y
          luego <b>Agregar a pantalla de inicio</b>.
        </div>
      )}
    </>
  )
}