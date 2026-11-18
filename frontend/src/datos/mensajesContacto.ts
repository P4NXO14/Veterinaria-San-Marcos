export interface MensajeContacto {
    id: number;
    nombre: string;
    correo: string;
    comentario: string;
    correoCuenta: string;
    fechaEnvio: string;
    estado: string;
    respuesta: string;
    respondidoPor: string;
    fechaRespuesta: string | null;
}

export interface CredencialesContacto {
    correo: string;
    password: string;
}

interface ContactoApi {
    id: number;
    nombreCompleto: string;
    correo: string;
    correoCuenta: string | null;
    mensaje: string;
    fechaCreacion: string;
    estado: string;
    respuesta: string | null;
    respondidoPor: string | null;
    fechaRespuesta: string | null;
}

type NuevoMensaje = Pick<MensajeContacto,"nombre" | "correo" | "comentario">;

const API_URL = "http://localhost:8084/api/contactos";

function convertirMensaje(contacto: ContactoApi): MensajeContacto {
    return {
        id: contacto.id,
        nombre: contacto.nombreCompleto,
        correo: contacto.correo,
        comentario: contacto.mensaje,
        correoCuenta: contacto.correoCuenta ?? "",
        fechaEnvio: contacto.fechaCreacion,
        estado: contacto.estado,
        respuesta: contacto.respuesta ?? "",
        respondidoPor: contacto.respondidoPor ?? "",
        fechaRespuesta: contacto.fechaRespuesta ?? null
    };
}

function obtenerAutorizacion(credenciales: CredencialesContacto): string {
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
        401: "Correo o contraseña incorrectos",
        403: "No tienes permisos para realizar esta operacion",
        404: "El mensaje solicitado no existe",
        500: "Ocurrio un error interno en Contacto",
        503: "El microservicio Usuarios no esta disponible"
    };

    throw new Error(mensajes[respuesta.status] ?? `Error HTTP ${respuesta.status}`);
}

export async function obtenerMensajesContacto(credenciales: CredencialesContacto): Promise<MensajeContacto[]> {
    const respuesta = await fetch(API_URL,{
        headers: {
            Authorization: obtenerAutorizacion(credenciales)
        },
        cache: "no-store"
    });

    await verificarRespuesta(respuesta);
    const contactos = (await respuesta.json()) as ContactoApi[];
    return contactos.map(convertirMensaje);
}

export async function obtenerMisMensajesContacto(credenciales: CredencialesContacto): Promise<MensajeContacto[]> {
    const respuesta = await fetch(`${API_URL}/mis-mensajes`,{
        headers: {
            Authorization: obtenerAutorizacion(credenciales)
        },
        cache: "no-store"
    });

    await verificarRespuesta(respuesta);
    const contactos = (await respuesta.json()) as ContactoApi[];
    return contactos.map(convertirMensaje);
}

export async function guardarMensajeContacto(
    datos: NuevoMensaje,
    credenciales: CredencialesContacto
): Promise<MensajeContacto> {
    const respuesta = await fetch(API_URL,{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: obtenerAutorizacion(credenciales)
        },
        body: JSON.stringify({
            nombreCompleto: datos.nombre,
            correo: datos.correo,
            mensaje: datos.comentario
        })
    });

    await verificarRespuesta(respuesta);
    return convertirMensaje((await respuesta.json()) as ContactoApi);
}

export async function atenderMensajeContacto(
    id: number,
    credenciales: CredencialesContacto
): Promise<MensajeContacto> {
    const respuesta = await fetch(`${API_URL}/${id}`,{
        method: "PUT",
        headers: {
            Authorization: obtenerAutorizacion(credenciales)
        }
    });

    await verificarRespuesta(respuesta);
    return convertirMensaje((await respuesta.json()) as ContactoApi);
}

export async function responderMensajeContacto(
    id: number,
    texto: string,
    credenciales: CredencialesContacto
): Promise<MensajeContacto> {
    const respuesta = await fetch(`${API_URL}/${id}/respuesta`,{
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: obtenerAutorizacion(credenciales)
        },
        body: JSON.stringify({
            respuesta: texto
        })
    });

    await verificarRespuesta(respuesta);
    return convertirMensaje((await respuesta.json()) as ContactoApi);
}

export async function eliminarMensajeContacto(
    id: number,
    credenciales: CredencialesContacto
): Promise<void> {
    const respuesta = await fetch(`${API_URL}/${id}`,{
        method: "DELETE",
        headers: {
            Authorization: obtenerAutorizacion(credenciales)
        }
    });

    await verificarRespuesta(respuesta);
}