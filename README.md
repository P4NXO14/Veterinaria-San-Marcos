# Veterinaria San Marcos — Evaluación Parcial 2

El proyecto transforma el sitio original construido con HTML, CSS y JavaScript en una aplicación de una sola página (SPA) desarrollada con **React, TypeScript y Vite**, incorporando componentes reutilizables, navegación, formularios controlados, gestión de datos y pruebas automatizadas

## Objetivo del proyecto

Digitalizar funciones de la Veterinaria San Marcos, ubicada en Rancagua, permitiendo consultar servicios, solicitar citas veterinarias, revisar productos de farmacia y gestionar tareas internas según el rol de cada usuario

Esta entrega es un **prototipo funcional del frontend**, que utiliza datos simulados y almacenamiento local del navegador, sin backend ni base de datos remota

## Tecnologías utilizadas

| Tecnología | Uso en el proyecto |
| --- | --- |
| React | Construcción de la interfaz mediante componentes |
| TypeScript | Tipado de propiedades, datos y funciones |
| Vite | Entorno de desarrollo y compilación |
| React Router | Navegación entre páginas y rutas con parámetros |
| CSS Grid, Flexbox y media queries | Diseño responsivo |
| Bootstrap | Estilos y utilidades complementarias |
| LocalStorage y SessionStorage | Persistencia y selección temporal de datos simulados |
| Vitest | Ejecución de pruebas automatizadas |
| React Testing Library y jsdom | Pruebas de componentes e interacciones |
| Git y GitHub | Control de versiones y trabajo mediante ramas |

## Funcionalidades implementadas

### Acceso público

- Página de Inicio con información de la veterinaria y seis servicios destacados
- Página Nosotros con información de la clínica y video informativo
- Catálogo de **31 servicios veterinarios**, con búsqueda por nombre, código o especie y filtro por categoría
- Fichas de detalle con información, duración, precio, especie e imagen
- Catálogo de Farmacia con búsqueda, categorías, precios, descuentos y disponibilidad de productos
- Registro de clientes e inicio de sesión

Las páginas públicas pueden consultarse sin iniciar sesión, mientras que las operaciones que requieren identificación solicitan autenticación

### Cliente

- Solicitud de citas para servicios compatibles con la especie y el profesional
- Selección de fecha y hora según la disponibilidad
- Consulta del estado de sus propias citas
- Visualización de horarios alternativos propuestos por Recepción
- Envío de mensajes mediante el formulario de Contacto
- Carrito de farmacia y simulación de compra con actualización de stock
- Restricción de compra para productos que requieren receta veterinaria

### Recepcionista

- Visualización y gestión de solicitudes de citas
- Confirmación, cancelación y propuesta de nuevos horarios
- Consulta de mensajes enviados desde Contacto
- Consulta y mantenimiento del inventario de farmacia

### Administrador

- Acceso al panel de gestión de usuarios
- Creación, edición, activación, desactivación y eliminación de cuentas de personal, según las restricciones definidas
- Acceso a Recepción y al inventario de farmacia
- Restricciones de acceso a las operaciones exclusivas de clientes

## Organización del proyecto

```text
Veterinaria-San-Marcos/
├── README.md
└── frontend/
    ├── public/
    │   ├── img/
    │   └── video/
    ├── src/
    │   ├── componentes/
    │   │   ├── atomos/
    │   │   ├── moleculas/
    │   │   └── organismos/
    │   ├── datos/
    │   ├── estilos/
    │   ├── paginas/
    │   ├── tests/
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── package.json
    ├── package-lock.json
    ├── vite.config.ts
    ├── vitest.config.ts
    └── README.md
```

### Atomic Design

La interfaz está organizada de acuerdo con **Atomic Design**, mediante tres niveles de composición

- **Átomos:** elementos básicos como `Input`, `Logo` y `EnlaceNavegacion`
- **Moléculas:** combinaciones reutilizables como `CampoFormulario` y `TarjetaServicio`
- **Organismos:** conjuntos funcionales como `Encabezado`, `FormularioCita`, `SelectorHorario`, `ListadoCitas` y los formularios de usuarios

Las vistas se encuentran en `src/paginas` y reutilizan estos componentes mediante propiedades tipadas

### Manejo de estado y datos

- Los componentes utilizan `useState` para actualizar formularios, filtros, listas y mensajes
- La navegación se controla mediante React Router
- Los módulos de `src/datos` concentran las operaciones sobre usuarios, citas, servicios, profesionales, horarios, productos y mensajes
- Las operaciones CRUD se reflejan en la interfaz mediante actualizaciones de estado
- `LocalStorage` conserva datos simulados como usuarios, citas, mensajes e inventario
- `SessionStorage` se utiliza para conservar temporalmente el servicio seleccionado al iniciar una reserva

## Requisitos para ejecutar

En otro computador se necesitan las siguientes herramientas

| Herramienta | Requisito | Descarga |
| --- | --- | --- |
| Node.js | Obligatorio, versión compatible con Vite; se recomienda una versión LTS actual | https://nodejs.org/ |
| npm | Obligatorio, se incluye al instalar Node.js | Incluido con Node.js |
| Git | Necesario para clonar el repositorio desde GitHub | https://git-scm.com/ |
| Navegador web | Necesario para visualizar la aplicación | Chrome, Edge, Firefox u otro navegador moderno |
| Visual Studio Code | Opcional, para revisar o modificar el código | https://code.visualstudio.com/ |

Para comprobar que Node.js, npm y Git están instalados, abrir PowerShell o una terminal y ejecutar

```bash
node --version
npm --version
git --version
```

**No es necesario instalar React, TypeScript, Bootstrap, Vitest o React Router por separado**, ya que se incluyen en las dependencias del proyecto y se instalan mediante npm

Tampoco se requiere instalar Java, Spring Boot, MySQL o Docker para ejecutar esta versión del frontend

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone -b evaluacion-2-react https://github.com/P4NXO14/Veterinaria-San-Marcos.git
```

### 2. Entrar a la carpeta del frontend

```bash
cd Veterinaria-San-Marcos/frontend
```

### 3. Instalar las dependencias

```bash
npm install
```

Este comando instala las dependencias definidas en `package.json`, por lo que no se debe copiar la carpeta `node_modules` desde otro computador

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abrir en el navegador la dirección indicada por Vite, normalmente `http://localhost:5173/`

Para detener el servidor, presionar `Ctrl + C` en la terminal

## Comandos disponibles

Los siguientes comandos se ejecutan dentro de la carpeta `frontend`

| Comando | Función |
| --- | --- |
| `npm run dev` | Iniciar el servidor de desarrollo |
| `npm run build` | Verificar TypeScript y generar la compilación de producción |
| `npm run preview` | Previsualizar la compilación generada |
| `npm run lint` | Ejecutar ESLint |
| `npm run test` | Ejecutar Vitest en modo interactivo |
| `npm run test:run` | Ejecutar la suite de pruebas una sola vez |
| `npm run test:coverage` | Ejecutar las pruebas y generar la cobertura |

## Pruebas automatizadas

Se utiliza **Vitest + React Testing Library + jsdom** para comprobar el comportamiento de los componentes y de los módulos de datos

Las pruebas se ubican en `frontend/src/tests` y contemplan, entre otros aspectos

- Renderizado de componentes y contenido de las páginas
- Navegación, sesiones y permisos por rol
- Validación de RUN, correo, contraseñas y campos obligatorios
- Registro e inicio de sesión
- Creación, consulta, actualización y eliminación de usuarios y productos
- Búsqueda y filtros de servicios y farmacia
- Solicitudes de citas, disponibilidad horaria, cambios de estado y propuestas de horario
- Manejo de mensajes de Contacto
- Interacciones del carrito y compras simuladas
- Casos límite, estados vacíos y manejo de errores

Para ejecutar todas las pruebas

```bash
npm run test:run
```

Para generar el reporte de cobertura

```bash
npm run test:coverage
```

El resultado aparece en la terminal y el reporte HTML puede abrirse en `frontend/coverage/index.html`

## Diseño responsivo

La interfaz conserva la organización mediante CSS Grid, Flexbox y media queries, complementada con utilidades de Bootstrap

El diseño contempla navegación, tarjetas, formularios y tablas adaptables a teléfonos móviles, tabletas y computadores

## Ramas y control de versiones

- `main`: versión original del proyecto de la primera evaluación
- `evaluacion-2-react`: versión migrada a React, TypeScript y Vite para la segunda evaluación

Los cambios del frontend se desarrollan y registran en la rama `evaluacion-2-react`, manteniendo separada la versión inicial

## Alcance y limitaciones

- **Datos simulados:** se almacenan en el navegador y no se comparten entre dispositivos
- **Autenticación de demostración:** el control de sesión y roles es del frontend, no sustituye la autenticación segura de un backend
- **Compras de farmacia:** no se realizan pagos reales
- **Citas:** se gestionan en el entorno de demostración, sin integración con un calendario externo
- **Backend y base de datos remota:** no forman parte de esta implementación del frontend
- **Cobertura:** pueden permanecer condiciones poco frecuentes sin ejecutar, identificables en el reporte de Vitest

Las cuentas precargadas por el sistema se destinan exclusivamente a la demostración académica y no deben utilizarse como mecanismo de autenticación en producción

## Autor

**Francisco Osorio**