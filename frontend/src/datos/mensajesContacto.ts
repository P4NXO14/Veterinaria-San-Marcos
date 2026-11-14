export interface MensajeContacto {
    id: number;
    nombre: string;
    correo: string;
    comentario: string;
    correoCuenta: string;
    fechaEnvio: string;
    estado: string;
}

interface ContactoApi {
    id: number;
    nombreCompleto: string;
    correo: string;
    correoCuenta: string | null;
    mensaje: string;
    fechaCreacion: string;
    estado: string;
}

type NuevoMensaje = Pick<MensajeContacto, "nombre" | "correo" | "comentario" | "correoCuenta">;

const API_URL = "http://localhost:8084/api/contactos";

function convertirMensaje(contacto: ContactoApi): MensajeContacto {
    return {
        id: contacto.id,
        nombre: contacto.nombreCompleto,
        correo: contacto.correo,
        comentario: contacto.mensaje,
        correoCuenta: contacto.correoCuenta ?? "",
        fechaEnvio: contacto.fechaCreacion,
        estado: contacto.estado
    };
}

export async function obtenerMensajesContacto(): Promise<MensajeContacto[]> {
    const respuesta = await fetch(API_URL);

    if (!respuesta.ok) {
        throw new Error("No se pudieron obtener los mensajes.");
    }

    const contactos: ContactoApi[] = await respuesta.json();

    return contactos.map(convertirMensaje);
}

export async function guardarMensajeContacto(datos: NuevoMensaje): Promise<MensajeContacto> {
    const respuesta = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nombreCompleto: datos.nombre,
            correo: datos.correo,
            mensaje: datos.comentario,
            correoCuenta: datos.correoCuenta
        })
    });

    if (!respuesta.ok) {
        throw new Error("No se pudo guardar el mensaje.");
    }

    const contacto: ContactoApi = await respuesta.json();

    return convertirMensaje(contacto);
}

export async function atenderMensajeContacto(id: number): Promise<MensajeContacto> {
    const respuesta = await fetch(`${API_URL}/${id}`, {
        method: "PUT"
    });

    if (!respuesta.ok) {
        throw new Error("No se pudo actualizar el mensaje.");
    }

    const contacto: ContactoApi = await respuesta.json();

    return convertirMensaje(contacto);
}

export async function eliminarMensajeContacto(id: number): Promise<void> {
    const respuesta = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    if (!respuesta.ok) {
        throw new Error("No se pudo eliminar el mensaje.");
    }
}