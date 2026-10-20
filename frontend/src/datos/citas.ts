export interface Cita {
  id: string;
  propietario: string;
  propietarioNombre: string;
  servicio: string;
  mascota: string;
  especie: string;
  motivo: string;
  fecha: string;
  hora: string;
  estado: string;
  fechaPropuesta: string;
  horaPropuesta: string;
}

export function obtenerCitas(): Cita[] {
  const datos = localStorage.getItem("citasSanMarcos");

  if (!datos) {
    return [];
  }

  try {
    const citas = JSON.parse(datos);

    return Array.isArray(citas) ? citas as Cita[] : [];
  } catch {
    return [];
  }
}

export function guardarCitas(citas: Cita[]): void {
  localStorage.setItem(
    "citasSanMarcos",
    JSON.stringify(citas)
  );
}

export function crearCita(cita: Cita): void {
  const citas = obtenerCitas();

  citas.push(cita);

  guardarCitas(citas);
}

export function confirmarCita(id: string): boolean {
  const citas = obtenerCitas();

  const cita = citas.find((item) => item.id === id);

  if (!cita) {
    return false;
  }

  cita.estado = "Confirmada";

  guardarCitas(citas);

  return true;
}

export function proponerHorarioCita(
  id: string,
  fecha: string,
  hora: string
): boolean {
  const citas = obtenerCitas();

  const cita = citas.find((item) => item.id === id);

  if (!cita || !fecha || !hora) {
    return false;
  }

  cita.estado = "Horario propuesto";
  cita.fechaPropuesta = fecha;
  cita.horaPropuesta = hora;

  guardarCitas(citas);

  return true;
}