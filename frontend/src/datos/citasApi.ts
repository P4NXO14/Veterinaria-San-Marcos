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

    export type NuevaCita = Omit<CitaServidor, "id" | "estado" | "fechaPropuesta" | "horaPropuesta">;

    const URL_CITAS = "http://localhost:8082/api/citas";



    export async function obtenerCitasServidor(propietario: string): Promise<CitaServidor[]> {
    const respuesta = await fetch(`${URL_CITAS}?propietario=${encodeURIComponent(propietario)}`);

    if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las citas. Comprueba que Reservas este iniciado");
    }

    return (await respuesta.json()) as CitaServidor[];
    }

    export async function crearCitaServidor(cita: NuevaCita): Promise<CitaServidor> {
    const respuesta = await fetch(URL_CITAS, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(cita)
    });

    if (!respuesta.ok) {
        throw new Error("No se pudo registrar la cita en el servidor");
    }

    return (await respuesta.json()) as CitaServidor;
    }