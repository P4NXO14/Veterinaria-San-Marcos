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

const API_URL = "http://localhost:8081/api/usuarios";

async function procesarRespuesta(respuesta: Response): Promise<Sesion> {
    if (!respuesta.ok) {
        if (respuesta.status === 409) {
            throw new Error("El RUT o correo ya se encuentra registrado.");
        }

        if (respuesta.status === 401) {
            throw new Error("Correo o contraseña incorrectos.");
        }

        if (respuesta.status === 403) {
            throw new Error("Esta cuenta se encuentra desactivada.");
        }

        throw new Error("No se pudo completar la solicitud.");
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