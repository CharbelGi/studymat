# 📚 StudyMate PWA

> **Plataforma web progresiva para la gestión, organización y optimización de la productividad académica de estudiantes universitarios.**

---

## 🎯 Definición del Proyecto

**StudyMate** es una aplicación web de alto rendimiento construida con la arquitectura **Progressive Web App (PWA)** utilizando **React** sobre **Vite** y respaldada por los servicios en la nube de **Firebase**.

El proyecto nace con el objetivo de centralizar el control de las actividades académicas en una sola plataforma rápida, intuitiva y accesible desde cualquier dispositivo (móvil o escritorio). Elimina la desorganización de las agendas tradicionales mediante el seguimiento de tareas en tiempo real, escaneo inteligente de apuntes y alertas contextuales.

---

## 🔍 ¿De qué trata el proyecto?

StudyMate simplifica y automatiza el flujo de trabajo diario de los estudiantes universitarios a través de las siguientes funcionalidades clave:

1. **Gestión Académica Centralizada**: Registro, clasificación y seguimiento de tres pilares fundamentales: **Tareas pendientes**, **Proyectos activos** y **Exámenes programados**.
2. **Escaneo Inteligente con IA (OCR)**: Integración con la API de *OCR.Space* para fotografiar apuntes o capturas de tareas desde la cámara y autocompletar automáticamente la materia y la descripción.
3. **Indicadores de Urgencia Dinámicos**: Sistema visual de alertas con códigos de color inteligentes que calculan los días restantes para cada fecha límite de entrega.
4. **Widget de Clima Estudiantil**: Detección de ubicación con *Open-Meteo* para ofrecer el pronóstico actual y recomendaciones enfocadas en el entorno de estudio.
5. **Soporte PWA y Modo Offline**: Totalmente instalable en dispositivos móviles y de escritorio, con caché local para consulta sin conexión a internet.
6. **Autenticación Segura**: Registro e inicio de sesión integrados con Firebase Authentication y Cloud Firestore.

---

## 🛠️ Stack Tecnológico

* **Core & Build Tool**: React, Vite (HMR), JavaScript (92.1%).
* **UI & Estilos**: Bootstrap 5, Lucide React (Iconografía).
* **Backend & Base de Datos**: Firebase Authentication y Cloud Firestore.
* **APIs Externas**: Open-Meteo (Clima) y OCR.Space (Reconocimiento óptico de caracteres).
* **Despliegue**: Firebase Hosting.

---

## 📂 Estructura del Código

```text
studymat/
├── public/                # Manifiesto PWA, service workers y activos
├── src/
│   ├── components/        # Componentes modulares (ClimaCompacto, ListaTareas, Modales, Header)
│   ├── config/            # Configuraciones globales (Firebase, utilidades PWA)
│   ├── views/             # Vistas de la aplicación (DashboardHeader, NotFound)
│   ├── App.jsx            # Enrutamiento y componente principal
│   └── main.jsx           # Punto de entrada de React
├── package.json           # Dependencias y scripts de construcción
└── vite.config.js         # Configuración del entorno Vite y PWA
