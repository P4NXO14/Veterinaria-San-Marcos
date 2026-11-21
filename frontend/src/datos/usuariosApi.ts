import type {Sesion} from "./usuarios";

interface DatosRegistro {
    rut: string;
    nombre: string;
    apellidos: string;
    correo: string;
    direccion: string;
    password: string;
}

interface DatosLogin {
    correo: string;
    password: string;
}

interface ErrorValidacion {
    defaultMessage?: string;
}

interface ErrorApi {
    detail?: string;
    message?: string;
    errors?: ErrorValidacion[];
}

const API_URL = "http://localhost:8081/api/usuarios";

async function obtenerDetalleError(respuesta: Response): Promise<string> {
    try {
        const datos: ErrorApi = await respuesta.json();

        if (Array.isArray(datos.errors) && datos.errors.length > 0) {
            return datos.errors
                .map(error => error.defaultMessage)
                .filter((mensaje): mensaje is string => Boolean(mensaje))
                .join(" - ");
        }

        const detalle = datos.detail || datos.message || "";

        if (detalle === "Bad Request" || detalle === "Internal Server Error") {
            return "";
        }

        return detalle.replace(/[.!?]+$/, "");
    } catch {
        return "";
    }
}

async function procesarRespuesta(respuesta: Response): Promise<Sesion> {
    if (!respuesta.ok) {
        const detalle = await obtenerDetalleError(respuesta);

        if (respuesta.status === 400) {
            throw new Error(detalle || "Los datos ingresados no son validos, revisa el RUT, correo y los campos obligatorios");
        }

        if (respuesta.status === 401) {
            throw new Error("Correo o contraseña incorrectos");
        }

        if (respuesta.status === 403) {
            throw new Error("No tienes permiso para realizar esta operacion o la cuenta esta desactivada");
        }

        if (respuesta.status === 409) {
            throw new Error(detalle || "El RUT o correo ya se encuentra registrado");
        }

        if (respuesta.status === 404) {
            throw new Error("No se encontro el servicio solicitado (HTTP 404)");
        }

        if (respuesta.status >= 500) {
            throw new Error(`El servidor no pudo completar la solicitud (HTTP ${respuesta.status})`);
        }

        throw new Error(detalle || `No se pudo completar la solicitud (HTTP ${respuesta.status})`);
    }

    const usuario = await respuesta.json();

    return {
        rut: usuario.rut,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        rol: usuario.rol
    };
}

export async function registrarCliente(datos: DatosRegistro): Promise<Sesion> {
    const respuesta = await fetch(`${API_URL}/registro`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    });

    return procesarRespuesta(respuesta);
}

export async function iniciarSesionUsuario(datos: DatosLogin): Promise<Sesion> {
    const respuesta = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    });

    return procesarRespuesta(respuesta);
}