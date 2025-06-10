# TempusUGR - Frontend

Este repositorio contiene el código fuente de la interfaz de usuario para el proyecto **TempusUGR**. La aplicación está desarrollada con **Angular** y proporciona una interfaz limpia, intuitiva y accesible para que los estudiantes y profesores de la Universidad de Granada puedan gestionar sus horarios académicos de manera personalizada.

La aplicación se comunica con el backend de TempusUGR a través de una API REST para obtener horarios, gestionar suscripciones, autenticar usuarios y sincronizar calendarios.

---

## 🖼️ Vistas de la Aplicación

| Inicio de Sesión | Vista del Calendario |
| :---: | :---: |
| ![Image](https://github.com/user-attachments/assets/ff784cc2-e364-4304-9bd4-cdf427a65c11) | ![Image](https://github.com/user-attachments/assets/0bd4a2f0-6060-40e7-8b97-85fca9be3828) |

| Página de Sincronización | Página de Suscripciones |
| :---: | :---: |
| ![Image](https://github.com/user-attachments/assets/bea4afa6-e0dc-4540-9782-577407cb00fb) | ![Image](https://github.com/user-attachments/assets/9e1c9a4b-930c-484e-969f-ab5d422d369b) |

---

## ✨ Características Principales

* **Autenticación de Usuarios**: Sistema completo de registro, inicio de sesión y cierre de sesión utilizando tokens JWT.
* **Gestión de Sesión**: Manejo automático de la renovación de tokens para mantener al usuario conectado de forma segura.
* **Calendario Personalizado**: Visualización de los horarios de clase y eventos en una interfaz de calendario interactiva (vistas de semana y día).
* **Gestión de Suscripciones**: Permite a los usuarios (alumnos y profesores) suscribirse a los grupos de las asignaturas que cursan o imparten.
* **Creación de Eventos**: Funcionalidad para que profesores y administradores creen eventos extra a nivel de grupo o de facultad.
* **Sincronización y Exportación**: Proporciona una URL única para sincronizar el calendario con servicios externos (como Google Calendar) y permite la descarga del horario en formato `.ics`.
* **Diseño Responsivo**: Interfaz adaptada para funcionar correctamente en diferentes tamaños de pantalla.

---

## 🛠️ Tecnologías Utilizadas

* **[Angular](https://angular.io/) (v19.0.2)**: Framework principal para el desarrollo de la Single Page Application (SPA).
* **[TypeScript](https://www.typescriptlang.org/)**: Lenguaje de programación principal.
* **[Tailwind CSS](https://tailwindcss.com/)**: Framework de CSS para un diseño rápido y moderno.
* **[RxJS](https://rxjs.dev/)**: Para la gestión de la programación reactiva y las operaciones asíncronas.
* **HTML5 y CSS3**: Para la estructura y el estilo de la aplicación.

---

## 🚀 Instalación y Puesta en Marcha

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno de desarrollo local.

### **Prerrequisitos**

Asegúrate de tener instalado lo siguiente:
* [Node.js](https://nodejs.org/) (versión 18.x o superior)
* [Angular CLI](https://angular.io/cli) (versión 17.x o superior)

### **Instalación**

1.  **Clona el repositorio:**
    ```bash
    git clone [https://github.com/TempusUGR/frontend-repo.git](https://github.com/TempusUGR/frontend-repo.git)
    cd frontend-repo
    ```

2.  **Instala las dependencias del proyecto:**
    ```bash
    npm install
    ```
    
### **Ejecutar la Aplicación**

1.  **Servidor de desarrollo:**
    Ejecuta el siguiente comando para iniciar el servidor de desarrollo de Angular.
    ```bash
    ng serve
    ```
    La aplicación estará disponible en `http://localhost:4200/`. El servidor se recargará automáticamente cada vez que se detecte un cambio en el código fuente.

2.  **Compilar para producción:**
    Para generar una versión optimizada para producción, ejecuta:
    ```bash
    ng build --configuration production
    ```
    Los archivos compilados se guardarán en el directorio `dist/`, listos para ser desplegados en un servidor web.
