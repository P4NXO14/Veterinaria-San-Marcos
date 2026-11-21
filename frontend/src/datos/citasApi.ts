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

let solicitudClave: Promise<string | null> | null = null;

function solicitarClaveReservas(): Promise<string | null> {
    if (solicitudClave) {
        return solicitudClave;
    }

    solicitudClave = new Promise<string | null>((resolver) => {
        const fondo = document.createElement("div");
        fondo.style.cssText = "position:fixed;inset:0;z-index:9999;display:flex;justify-content:center;align-items:flex-start;padding:75px 16px 16px;box-sizing:border-box;background:#0009";

        const ventana = document.createElement("section");
        ventana.setAttribute("role","dialog");
        ventana.setAttribute("aria-modal","true");
        ventana.setAttribute("aria-labelledby","tituloClaveReservas");
        ventana.style.cssText = "width:100%;max-width:430px;padding:20px;border:1px solid #454857;border-radius:12px;background:#202127;color:#fff;box-shadow:0 12px 35px #0008;box-sizing:border-box";

        const titulo = document.createElement("h2");
        titulo.id = "tituloClaveReservas";
        titulo.textContent = "Autorizacion de Reservas";
        titulo.style.cssText = "margin:0 0 12px;font-size:16px;font-weight:600;color:#fff";

        const formulario = document.createElement("form");
        formulario.noValidate = true;

        const etiqueta = document.createElement("label");
        etiqueta.htmlFor = "claveAutorizacionReservas";
        etiqueta.textContent = "Ingresa tu contraseña para autorizar la consulta de Reservas";
        etiqueta.style.cssText = "display:block;margin-bottom:10px;font-size:13px;color:#fff";

        const entrada = document.createElement("input");
        entrada.id = "claveAutorizacionReservas";
        entrada.type = "password";
        entrada.autocomplete = "current-password";
        entrada.style.cssText = "display:block;width:100%;height:36px;padding:7px 10px;box-sizing:border-box;border:1px solid #a9b4df;border-radius:6px;background:#181a20;color:#fff;font-size:14px";

        const error = document.createElement("p");
        error.setAttribute("role","alert");
        error.style.cssText = "display:none;margin:8px 0 0;font-size:13px;color:#ffb4b4";
        error.textContent = "Debes ingresar tu contraseña para continuar";

        const acciones = document.createElement("div");
        acciones.style.cssText = "display:flex;justify-content:flex-end;gap:8px;margin-top:18px";

        const cancelar = document.createElement("button");
        cancelar.type = "button";
        cancelar.textContent = "Cancelar";
        cancelar.style.cssText = "padding:8px 16px;border:1px solid #454b75;border-radius:20px;background:transparent;color:#fff;cursor:pointer";

        const aceptar = document.createElement("button");
        aceptar.type = "submit";
        aceptar.textContent = "Aceptar";
        aceptar.style.cssText = "padding:8px 16px;border:1px solid #adbdf4;border-radius:20px;background:#b4c4ff;color:#101420;cursor:pointer";

        function finalizar(clave: string | null) {
            document.removeEventListener("keydown",teclaEscape);
            fondo.remove();
            resolver(clave);
        }

        function teclaEscape(evento: KeyboardEvent) {
            if (evento.key === "Escape") {
                evento.preventDefault();
                finalizar(null);
            }
        }

        formulario.addEventListener("submit",(evento) => {
            evento.preventDefault();

            if (!entrada.value) {
                error.style.display = "block";
                entrada.focus();
                return;
            }

            finalizar(entrada.value);
        });

        entrada.addEventListener("input",() => {
            error.style.display = "none";
        });

        cancelar.addEventListener("click",() => finalizar(null));
        document.addEventListener("keydown",teclaEscape);

        acciones.append(cancelar,aceptar);
        formulario.append(etiqueta,entrada,error,acciones);
        ventana.append(titulo,formulario);
        fondo.append(ventana);
        document.body.append(fondo);
        entrada.focus();
    });

    void solicitudClave.then(() => {
        solicitudClave = null;
    });

    return solicitudClave;
}

async function obtenerAutorizacion(): Promise<string> {
    const sesion = obtenerSesion();

    if (!sesion) {
        limpiarCredencialesReservas();
        throw new Error("Debes iniciar sesion para consultar o modificar tus citas");
    }

    const correo = sesion.correo.trim().toLowerCase();

    if (!credenciales || credenciales.correo !== correo) {
        const clave = await solicitarClaveReservas();

        if (!clave) {
            throw new Error("Debes ingresar tu contraseña para continuar");
        }

        guardarCredencialesReservas(correo,clave);
    }

    const actual = credenciales!;
    const bytes = new TextEncoder().encode(`${actual.correo}:${actual.password}`);
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