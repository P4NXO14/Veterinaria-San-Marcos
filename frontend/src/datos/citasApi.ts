export interface CitaServidor {
    id: number;
    propietario: string;
    propietarioNombre: string;
    servicio: string;
    profesional: string;
    mascota: string;
    especie: string;
    motivo: string;
    fecha: string;
    hora: string;
    estado: string;
    fechaPropuesta: string;
    horaPropuesta: string;
}

export type NuevaCita = Omit<CitaServidor,"id" | "estado" | "fechaPropuesta" | "horaPropuesta">;

interface CredencialesReservas {
    correo: string;
    password: string;
}

interface OcupacionServidor {
    servicio: string;
    profesional: string;
    fecha: string;
    hora: string;
    estado: string;
    fechaPropuesta: string;
    horaPropuesta: string;
}

interface SesionGuardada {
    correo: string;
    rol: string;
}

const URL_CITAS = "http://localhost:8082/api/citas";
let credenciales: CredencialesReservas | null = null;

export function guardarCredencialesReservas(correo: string,password: string): void {
    credenciales = {correo: correo.trim().toLowerCase(),password};
}

export function limpiarCredencialesReservas(): void {
    credenciales = null;
}

function obtenerSesion(): SesionGuardada | null {
    const datos = localStorage.getItem("sesionSanMarcos");

    if (!datos) {
        return null;
    }

    try {
        const sesion = JSON.parse(datos) as SesionGuardada;
        return sesion.correo && sesion.rol ? sesion : null;
    } catch {
        return null;
    }
}

async function obtenerAutorizacion(): Promise<string> {
    const sesion = obtenerSesion();

    if (!sesion) {
        limpiarCredencialesReservas();
        throw new Error("Debes iniciar sesion para consultar o modificar tus citas");
    }

    const correo = sesion.correo.trim().toLowerCase();

    if (!credenciales || credenciales.correo !== correo) {
        limpiarCredencialesReservas();
        throw new Error("Debes ingresar tu contraseña en la seccion de Reservas para continuar");
    }

    const bytes = new TextEncoder().encode(`${credenciales.correo}:${credenciales.password}`);
    const contenido = Array.from(bytes,(byte) => String.fromCharCode(byte)).join("");

    return `Basic ${btoa(contenido)}`;
}

async function verificarRespuesta(respuesta: Response): Promise<void> {
    if (respuesta.ok) {
        return;
    }

    if (respuesta.status === 401) {
        limpiarCredencialesReservas();
    }

    const mensajes: Record<number,string> = {
        400: "Los datos de la cita no son validos",
        401: "Correo o contraseña incorrectos, vuelve a autorizar Reservas",
        403: "No tienes permisos para realizar esta operacion",
        404: "La cita solicitada ya no existe",
        409: "Existe un conflicto de horario o el estado de la cita cambio, actualiza el listado",
        500: "Ocurrio un error interno en Reservas",
        503: "Usuarios o un microservicio necesario para Reservas no esta disponible"
    };

    throw new Error(mensajes[respuesta.status] || `Error HTTP ${respuesta.status} al consultar Reservas`);
}

export async function obtenerTodasCitasServidor(): Promise<CitaServidor[]> {
    const sesion = obtenerSesion();
    const esPersonal = sesion?.rol === "admin" || sesion?.rol === "recepcionista";

    if (esPersonal) {
        const respuesta = await fetch(URL_CITAS,{
            headers: {Authorization: await obtenerAutorizacion()},
            cache: "no-store"
        });

        await verificarRespuesta(respuesta);
        return (await respuesta.json()) as CitaServidor[];
    }

    const respuesta = await fetch(`${URL_CITAS}/ocupaciones`,{cache: "no-store"});
    await verificarRespuesta(respuesta);
    const ocupaciones = (await respuesta.json()) as OcupacionServidor[];

    return ocupaciones.map((ocupacion,indice) => ({
        ...ocupacion,
        id: -(indice + 1),
        propietario: "",
        propietarioNombre: "",
        mascota: "",
        especie: "",
        motivo: ""
    }));
}

export async function obtenerCitasServidor(propietario: string): Promise<CitaServidor[]> {
    const respuesta = await fetch(`${URL_CITAS}?propietario=${encodeURIComponent(propietario)}`,{
        headers: {Authorization: await obtenerAutorizacion()},
        cache: "no-store"
    });

    await verificarRespuesta(respuesta);
    return (await respuesta.json()) as CitaServidor[];
}

export async function crearCitaServidor(cita: NuevaCita): Promise<CitaServidor> {
    const respuesta = await fetch(URL_CITAS,{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: await obtenerAutorizacion()
        },
        body: JSON.stringify(cita)
    });

    await verificarRespuesta(respuesta);
    return (await respuesta.json()) as CitaServidor;
}

export async function actualizarCitaServidor(id: number,cita: CitaServidor): Promise<CitaServidor> {
    const respuesta = await fetch(`${URL_CITAS}/${id}`,{
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: await obtenerAutorizacion()
        },
        body: JSON.stringify(cita)
    });

    await verificarRespuesta(respuesta);
    return (await respuesta.json()) as CitaServidor;
}

export async function eliminarCitaServidor(id: number): Promise<void> {
    const respuesta = await fetch(`${URL_CITAS}/${id}`,{
        method: "DELETE",
        headers: {Authorization: await obtenerAutorizacion()}
    });

    await verificarRespuesta(respuesta);
}