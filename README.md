# Veterinaria San Marcos - Evaluación Parcial 3

Aplicación web para la gestión de una clínica veterinaria mediante React, TypeScript, Spring Boot, MySQL y Docker Compose

## 1. Tecnologías utilizadas

| Tecnología | Función |
|---|---|
| React, TypeScript y Vite | Desarrollo del frontend |
| Java 17 y Spring Boot 4 | Desarrollo de microservicios |
| Spring Security | Autenticación y permisos |
| Spring Data JPA | Persistencia de datos |
| MySQL 8 | Bases de datos |
| Flyway | Migraciones SQL |
| Swagger / OpenAPI | Documentación de API REST |
| Docker Compose | Ejecución integrada |
| Vitest y JUnit | Pruebas automatizadas |

## 2. Arquitectura

El proyecto contiene seis microservicios independientes, un frontend React y un servidor MySQL

| Componente | Puerto | Función |
|---|---|---|
| Frontend | 5173 | Interfaz web |
| Usuarios | 8081 | Cuentas, autenticación y roles |
| Reservas | 8082 | Gestión de citas veterinarias |
| Profesionales | 8083 | Veterinarios, técnicos y horarios |
| Contacto | 8084 | Mensajes de clientes |
| Servicios | 8085 | Catálogo y servicios destacados |
| Farmacia | 8086 | Productos, inventario y pedidos |
| MySQL | 3307 | Seis bases de datos |

Los roles del sistema son cliente, recepcionista y administrador

Cada microservicio utiliza su propia base de datos MySQL y sus tablas se administran mediante Flyway

## 3. Estructura del proyecto

```text
Veterinaria-San-Marcos-evaluacion-3-microservicios/
├── backend/
│   ├── usuarios/
│   ├── reservas/
│   ├── profesionales/
│   ├── contacto/
│   ├── servicios/
│   ├── farmacia/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── public/
│   └── Dockerfile
├── docker/
│   └── mysql/
│       └── 01-crear-bases.sql
├── compose.yaml
├── docker.env.example
├── .dockerignore
├── .gitignore
└── README.md
```

## 4. Instalación desde cero en otro computador

Estas instrucciones permiten descargar el proyecto directamente desde GitHub y ejecutarlo mediante Docker

No es necesario instalar Java, Maven, Node.js, Vite, MySQL ni Laragon en el computador

### Paso 1 - Instalar los requisitos

Se necesita lo siguiente

- Docker Desktop instalado y funcionando
- Git para descargar el repositorio o descargar el ZIP desde GitHub
- WSL2 y virtualización habilitados cuando Windows lo requiera
- Conexión a Internet durante la primera construcción

Enlaces de descarga

- Docker: https://www.docker.com/products/docker-desktop/
- Git: https://git-scm.com/downloads

Abrir Docker Desktop antes de comenzar

En PowerShell comprobar

```powershell
docker --version
docker compose version
docker info
```

### Paso 2 - Descargar el proyecto

Abrir PowerShell y ejecutar

```powershell
cd "$HOME\Downloads"
```

Descargar directamente la rama de Evaluación 3

```powershell
git clone --branch evaluacion-3-microservicios --single-branch https://github.com/P4NXO14/Veterinaria-San-Marcos.git Veterinaria-San-Marcos-evaluacion-3-microservicios
```

Entrar a la carpeta descargada

```powershell
cd Veterinaria-San-Marcos-evaluacion-3-microservicios
```

**Importante:** no clonar el repositorio dentro de otra copia del proyecto

Si se utiliza Download ZIP desde GitHub, extraerlo en una carpeta independiente y abrir PowerShell donde se encuentre `compose.yaml`

### Paso 3 - Crear la configuración de Docker

Desde la carpeta principal ejecutar

```powershell
Copy-Item .\docker.env.example .\.env.docker
```

Este comando crea el archivo `.env.docker` con las variables necesarias para MySQL y las cuentas de demostración

El archivo `docker.env.example` incluye las credenciales académicas utilizadas durante el desarrollo

Las contraseñas deben configurarse antes de inicializar MySQL por primera vez

El archivo `.env.docker` está excluido de Git mediante `.gitignore`

### Paso 4 - Verificar el archivo SQL

Comprobar que exista el archivo encargado de crear las seis bases de datos

```powershell
Test-Path .\docker\mysql\01-crear-bases.sql
```

El resultado esperado es

```text
True
```

Comprobar que el archivo no esté vacío

```powershell
(Get-Item .\docker\mysql\01-crear-bases.sql).Length
```

El resultado debe ser mayor que cero

### Paso 5 - Validar Docker Compose

```powershell
docker compose --env-file .env.docker config --quiet
```

Si no aparecen errores continuar con la instalación

### Paso 6 - Construir e iniciar la aplicación

En la primera ejecución utilizar

```powershell
docker compose --env-file .env.docker up -d --build
```

Docker realizará automáticamente las siguientes operaciones

- Descargar las imágenes necesarias
- Construir los seis microservicios Spring Boot
- Preparar el frontend React
- Crear e iniciar MySQL
- Crear las seis bases de datos
- Asignar los permisos correspondientes
- Ejecutar las migraciones Flyway
- Iniciar los ocho contenedores

La primera construcción puede tardar varios minutos dependiendo del computador y la conexión a Internet

### Paso 7 - Comprobar los contenedores

```powershell
docker compose --env-file .env.docker ps -a
```

Deben aparecer los siguientes servicios

- mysql
- usuarios
- reservas
- profesionales
- contacto
- servicios
- farmacia
- frontend

Todos deben permanecer en estado `Up`

MySQL debe aparecer como `Healthy`

Los microservicios Spring Boot pueden necesitar unos segundos adicionales para completar su inicialización

### Paso 8 - Abrir la aplicación

Ingresar en el navegador

http://localhost:5173

No es necesario ejecutar `npm run dev` ni iniciar manualmente los microservicios

## 5. Cuentas de demostración

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@sanmarcos.com | Admin123 |
| Recepcionista | personal@sanmarcos.com | Pers1234 |

Estas credenciales corresponden a la configuración académica de demostración

Las cuentas se generan automáticamente cuando MySQL se inicializa por primera vez

Los clientes pueden registrarse directamente desde la aplicación

Las contraseñas de demostración no deben utilizarse en producción

## 6. Swagger / OpenAPI

Los seis microservicios incorporan Springdoc OpenAPI para documentar sus operaciones REST mediante Swagger UI

### Direcciones de Swagger

| Microservicio | Swagger UI |
|---|---|
| Usuarios | http://localhost:8081/swagger-ui/index.html |
| Reservas | http://localhost:8082/swagger-ui/index.html |
| Profesionales | http://localhost:8083/swagger-ui/index.html |
| Contacto | http://localhost:8084/swagger-ui/index.html |
| Servicios | http://localhost:8085/swagger-ui/index.html |
| Farmacia | http://localhost:8086/swagger-ui/index.html |

Cada microservicio también permite consultar su documentación OpenAPI en formato JSON mediante

```text
http://localhost:PUERTO/v3/api-docs
```

Reemplazar `PUERTO` por el puerto correspondiente al microservicio

### Cómo utilizar Swagger

1. Abrir Swagger desde el navegador
2. Seleccionar el endpoint que se desea probar
3. Presionar `Try it out`
4. Completar los parámetros o el JSON solicitado
5. Presionar `Execute`
6. Revisar `Response code` y `Response body`

### Métodos HTTP utilizados

| Método | Función |
|---|---|
| GET | Consultar información |
| POST | Crear registros o ejecutar operaciones |
| PUT | Actualizar información |
| PATCH | Modificar parcialmente un registro |
| DELETE | Eliminar registros |

Las operaciones protegidas mantienen los permisos definidos mediante Spring Security

Algunos endpoints requieren autenticación HTTP Basic

Las respuestas HTTP 401 o 403 pueden ser esperadas cuando no se proporcionan credenciales válidas o el usuario no dispone de los permisos necesarios

## 7. Comprobación rápida de las API

Con Docker funcionando ejecutar los siguientes comandos desde PowerShell

### Reservas

```powershell
curl.exe -i http://localhost:8082/api/citas/ocupaciones
```

### Profesionales

```powershell
curl.exe -i http://localhost:8083/api/profesionales
```

### Servicios destacados

```powershell
curl.exe -i http://localhost:8085/api/servicios/destacados
```

Los tres endpoints deben responder con HTTP 200

Si Reservas devuelve `[]`, significa que todavía no existen ocupaciones registradas

## 8. Comandos Docker

Ejecutar siempre desde la carpeta principal del proyecto

### Iniciar el proyecto

```powershell
docker compose --env-file .env.docker up -d
```

### Comprobar los contenedores

```powershell
docker compose --env-file .env.docker ps -a
```

### Consultar los registros

```powershell
docker compose --env-file .env.docker logs --tail=50
```

### Detener sin perder datos

```powershell
docker compose --env-file .env.docker down
```

### Reconstruir después de modificar código

```powershell
docker compose --env-file .env.docker up -d --build
```

### Reiniciar completamente las bases de datos

**Advertencia:** el siguiente comando elimina todos los registros almacenados en el volumen MySQL de este proyecto

```powershell
docker compose --env-file .env.docker down -v
```

Para volver a inicializar desde cero

```powershell
docker compose --env-file .env.docker up -d
```

No utilizar `down -v` para reinicios normales

## 9. Errores frecuentes

| Error | Posible causa |
|---|---|
| Port is already allocated | Otro programa o contenedor utiliza el puerto |
| MySQL unhealthy | Problema de inicialización o credenciales |
| MySQL 1044 | Faltan permisos sobre alguna base de datos |
| MySQL 1045 | Contraseña incorrecta |
| Empty reply from server | Spring Boot todavía está iniciando o se detuvo |
| HTTP 401 | Falta autenticación |
| HTTP 403 | El usuario no tiene permisos |
| HTTP 404 | Dirección o recurso inexistente |
| Vite no reconocido | Faltan dependencias locales y debe utilizarse Docker |

Para revisar MySQL

```powershell
docker compose --env-file .env.docker logs --tail=50 mysql
```

Para revisar un microservicio específico

```powershell
docker compose --env-file .env.docker logs --tail=50 reservas
```

No eliminar los volúmenes sin comprobar si contienen información importante

## 10. Pruebas realizadas

Durante el desarrollo se realizaron las siguientes comprobaciones

- Compilación del frontend React
- 21 pruebas automatizadas del frontend aprobadas
- Pruebas de los seis microservicios
- Autenticación y permisos según rol
- Gestión de reservas veterinarias
- Consulta de profesionales
- Gestión de mensajes de contacto
- Catálogo de servicios
- Inventario y pedidos de farmacia
- Consultas HTTP de las API REST
- Migraciones Flyway
- Persistencia de datos en MySQL
- Inicialización de la aplicación mediante Docker Compose
- Integración de Swagger/OpenAPI en los seis microservicios

Las compras de farmacia son simuladas y no procesan pagos reales

## 11. Repositorio

**GitHub:** https://github.com/P4NXO14/Veterinaria-San-Marcos

**Rama:** `evaluacion-3-microservicios`

**Autor:** Francisco Osorio