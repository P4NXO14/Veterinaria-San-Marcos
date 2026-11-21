import type {Servicio} from "./servicios";
import type {Profesional,Turno} from "./profesionales";

interface ServicioServidor {
id: number;
codigo: string;
categoria: string;
nombre: string;
especie: string;
duracion: string;
duracionMinutos: number;
precio: number;
obs: string;
imagen: string;
}

interface ProfesionalServidor {
id: number;
codigo: string;
nombre: string;
tipo: "veterinario" | "tecnico";
especialidad: string;
turnos: Record<string,Turno | null>;
}

const URL_SERVICIOS = "http://localhost:8085/api/servicios";
const URL_PROFESIONALES = "http://localhost:8083/api/profesionales";

async function verificarRespuesta(respuesta: Response,nombre: string): Promise<void> {
if (respuesta.ok) {
    return;
}

if (respuesta.status === 404) {
    throw new Error(`${nombre} no encontrado`);
}

throw new Error(`No se pudo consultar ${nombre}, error HTTP ${respuesta.status}`);
}

function convertirServicio(datos: ServicioServidor): Servicio {
return {
    id: datos.codigo,
    categoria: datos.categoria,
    nombre: datos.nombre,
    especie: datos.especie,
    duracion: datos.duracion,
    precio: datos.precio,
    obs: datos.obs,
    imagen: datos.imagen
};
}

function convertirProfesional(datos: ProfesionalServidor): Profesional {
const turnos: Record<number,Turno | null> = {};

for (let dia = 0; dia <= 6; dia++) {
    turnos[dia] = datos.turnos[String(dia)] ?? null;
}

return {
    id: datos.codigo,
    nombre: datos.nombre,
    tipo: datos.tipo,
    especialidad: datos.especialidad,
    turnos
};
}

export async function obtenerServiciosServidor(): Promise<Servicio[]> {
const respuesta = await fetch(URL_SERVICIOS,{cache: "no-store"});
await verificarRespuesta(respuesta,"Servicios");

const datos = (await respuesta.json()) as ServicioServidor[];
return datos.map(convertirServicio);
}

export async function obtenerServicioServidor(codigo: string): Promise<Servicio> {
const respuesta = await fetch(
    `${URL_SERVICIOS}/codigo/${encodeURIComponent(codigo)}`,
    {cache: "no-store"}
);

await verificarRespuesta(respuesta,"Servicio");

const datos = (await respuesta.json()) as ServicioServidor;
return convertirServicio(datos);
}

export async function obtenerProfesionalesServidor(): Promise<Profesional[]> {
const respuesta = await fetch(URL_PROFESIONALES,{cache: "no-store"});
await verificarRespuesta(respuesta,"Profesionales");

const datos = (await respuesta.json()) as ProfesionalServidor[];
return datos.map(convertirProfesional);
}

export async function obtenerCompatiblesServidor(codigo: string): Promise<string[]> {
const respuesta = await fetch(
    `${URL_SERVICIOS}/codigo/${encodeURIComponent(codigo)}/profesionales`,
    {cache: "no-store"}
);

await verificarRespuesta(respuesta,"Compatibilidad de profesionales");

return (await respuesta.json()) as string[];
}

export async function obtenerServiciosDestacadosServidor(): Promise<Servicio[]> {
const respuesta = await fetch(`${URL_SERVICIOS}/destacados`,{cache: "no-store"});
await verificarRespuesta(respuesta,"Servicios destacados");

const datos = (await respuesta.json()) as ServicioServidor[];
return datos.map(convertirServicio);
}

export async function cambiarServicioDestacadoServidor(
    codigo: string,
    destacado: boolean,
    credenciales: {correo: string;password: string}
): Promise<void> {
const bytes = new TextEncoder().encode(`${credenciales.correo}:${credenciales.password}`);
const base64 = btoa(Array.from(bytes,(byte) => String.fromCharCode(byte)).join(""));

const respuesta = await fetch(`${URL_SERVICIOS}/codigo/${encodeURIComponent(codigo)}/destacado`,{
    method: "PATCH",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${base64}`
    },
    body: JSON.stringify({destacado})
});

if (respuesta.ok) {
    return;
}

const mensajes: Record<number,string> = {
    400: "La solicitud no es valida",
    401: "Correo o contraseña incorrectos",
    403: "Solo el administrador puede modificar los destacados",
    404: "El servicio no existe",
    409: "Solo puedes destacar hasta 6 servicios",
    503: "El microservicio Usuarios no esta disponible"
};

throw new Error(mensajes[respuesta.status] ?? `No se pudo actualizar el servicio (HTTP ${respuesta.status})`);
}