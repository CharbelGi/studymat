# 📚 StudyMate PWA

> **Plataforma web progresiva diseñada para optimizar la organización, gestión y productividad académica de los estudiantes universitarios.**

---

## 🎯 Definición del Proyecto

**StudyMate** es una aplicación web moderna basada en la arquitectura **PWA (Progressive Web App)**, desarrollada con tecnologías de alto rendimiento como **React (Vite)** y respaldada por servicios en la nube mediante **Firebase**. 

El proyecto nace como una solución integral para los estudiantes que necesitan centralizar el control de sus obligaciones escolares en una sola interfaz limpia, rápida y accesible desde cualquier dispositivo (móvil o computadora), eliminando la fricción de las agendas tradicionales y permitiendo un seguimiento en tiempo real del rendimiento académico.

---

## 🔍 ¿De qué trata el proyecto?

StudyMate trata sobre la **automatización y simplificación de la vida universitaria**. La plataforma aborda los retos diarios a los que se enfrenta un estudiante —como el olvido de fechas límite, la desorganización de proyectos o la pérdida de apuntes— ofreciendo herramientas inteligentes:

1. **Gestión Académica Centralizada:** Permite registrar, clasificar y dar seguimiento a tres pilares fundamentales: **Tareas pendientes**, **Proyectos activos** y **Exámenes programados**.
2. **Escaneo Inteligente con IA (OCR):** Incorpora tecnología de Reconocimiento Óptico de Caracteres (vía *OCR.Space*) para que el usuario pueda fotografiar una hoja de apuntes o la descripción de una tarea con la cámara de su celular y autocompletar automáticamente los campos del sistema.
3. **Indicadores de Urgencia Inteligentes:** Cuenta con un sistema visual de alertas y códigos de color dinámicos que calculan los días restantes para cada entrega, advirtiendo al estudiante qué debe atender con prioridad.
4. **Clima y Contexto Estudiantil:** Integra un widget meteorológico conectado a geolocalización y a la API de *Open-Meteo* que no solo muestra la temperatura, sino que ofrece consejos y recomendaciones adaptados al clima para motivar la productividad (por ejemplo, sugerir estudiar en casa en días lluviosos o acudir a la biblioteca en días despejados).
5. **Enfoque Offline-First:** Gracias a su arquitectura PWA y almacenamiento local en caché, el estudiante puede consultar sus registros e ingresar a la plataforma incluso sin conexión a internet.

---

## 🛠️ Stack Tecnológico

* **Frontend:** React (Vite), Bootstrap 5 para el diseño responsivo, Lucide React para iconografía moderna.
* **Backend y Base de Datos:** Firebase Authentication (seguridad y sesiones) y Cloud Firestore (base de datos NoSQL en tiempo real).
* **APIs Externas:** Open-Meteo (pronóstico del clima) y OCR.Space (procesamiento de imágenes y extracción de texto).
* **Despliegue y Distribución:** Firebase Hosting / PWA Manifest.

---

## 📂 Estructura del Proyecto

```text
studymat/
├── public/                # Manifiesto de la PWA, service workers y recursos estáticos
├── src/
│   ├── components/        # Componentes modulares (Clima, ListaTareas, Modales, Navegación)
│   ├── config/            # Configuraciones globales (Firebase, utilidades de PWA/Share)
│   ├── views/             # Vistas principales del sistema (Dashboard, Errores 404)
│   ├── App.jsx            # Componente raíz y enrutamiento
│   └── main.jsx           # Punto de entrada de la aplicación React
├── package.json           # Dependencias y scripts de optimización
└── vite.config.js         # Configuración del empaquetador Vite y PWA
