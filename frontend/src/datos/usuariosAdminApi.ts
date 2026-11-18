import type {DatosEdicionPersonal,DatosNuevoPersonal} from "./usuarios";

export interface UsuarioAdministracion {
id: number;
rut: string;
nombre: string;
apellidos: string;
correo: string;
direccion: string;
rol: string;
activo: boolean;
}

export interface CredencialesAdministrador {
correo: string;
password: string;
}

const API_URL = "http://localhost:8081/api/usuarios/admin";

function obtenerAutorizacion(credenciales: CredencialesAdministrador): string {
const bytes = new TextEncoder().encode(`${credenciales.correo}:${credenciales.password}`);
const base64 = btoa(Array.from(bytes,(byte) => String.fromCharCode(byte)).join(""));
return `Basic ${base64}`;
}

async function verificarRespuesta(respuesta: Response): Promise<void> {
if (respuesta.ok) {
    return;
}

const mensajes: Record<number,string> = {
    400: "Los datos enviados no son validos",
    401: "La contraseña del administrador es incorrecta",
    403: "Esta cuenta no tiene permisos de administrador",
    404: "El usuario solicitado no existe",
    409: "El RUT o correo ya se encuentra registrado",
    500: "Ocurrio un error interno en Usuarios",
    503: "El microservicio Usuarios no esta disponible"
};

throw new Error(mensajes[respuesta.status] || `Error HTTP ${respuesta.status}`);
}

export async function listarUsuariosAdministrador(credenciales: CredencialesAdministrador): Promise<UsuarioAdministracion[]> {
const respuesta = await fetch(`${API_URL}/usuarios`,{
    headers: {Authorization: obtenerAutorizacion(credenciales)},
    cache: "no-store"
});

await verificarRespuesta(respuesta);
return (await respuesta.json()) as UsuarioAdministracion[];
}

export async function crearPersonalAdministrador(datos: DatosNuevoPersonal,credenciales: CredencialesAdministrador): Promise<UsuarioAdministracion> {
const respuesta = await fetch(`${API_URL}/personal`,{
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    Authorization: obtenerAutorizacion(credenciales)
    },
    body: JSON.stringify(datos)
});

await verificarRespuesta(respuesta);
return (await respuesta.json()) as UsuarioAdministracion;
}

export async function editarPersonalAdministrador(id: number,datos: DatosEdicionPersonal,credenciales: CredencialesAdministrador): Promise<UsuarioAdministracion> {
const respuesta = await fetch(`${API_URL}/personal/${id}`,{
    method: "PUT",
    headers: {
    "Content-Type": "application/json",
    Authorization: obtenerAutorizacion(credenciales)
    },
    body: JSON.stringify(datos)
});

await verificarRespuesta(respuesta);
return (await respuesta.json()) as UsuarioAdministracion;
}

export async function cambiarEstadoPersonalAdministrador(id: number,activo: boolean,credenciales: CredencialesAdministrador): Promise<UsuarioAdministracion> {
const respuesta = await fetch(`${API_URL}/personal/${id}/estado`,{
    method: "PATCH",
    headers: {
    "Content-Type": "application/json",
    Authorization: obtenerAutorizacion(credenciales)
    },
    body: JSON.stringify({activo})
});

await verificarRespuesta(respuesta);
return (await respuesta.json()) as UsuarioAdministracion;
}

export async function eliminarPersonalAdministrador(id: number,credenciales: CredencialesAdministrador): Promise<void> {
const respuesta = await fetch(`${API_URL}/personal/${id}`,{
    method: "DELETE",
    headers: {Authorization: obtenerAutorizacion(credenciales)}
});

await verificarRespuesta(respuesta);
}