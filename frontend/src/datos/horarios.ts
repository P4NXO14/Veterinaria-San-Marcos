
import { profesionales } from "./profesionales";
import { servicios } from "./servicios";
import { obtenerCitas } from "./citas";
import type { Cita } from "./citas";

function convertirAMinutos(hora: string): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
    return null;
  }

  const [horas, minutos] = hora.split(":").map(Number);

  return horas * 60 + minutos;
}

function convertirAHora(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;

  return `${String(horas).padStart(2, "0")}:${String(resto).padStart(2, "0")}`;
}

function obtenerFechaActual(): string {
  const hoy = new Date();

  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${año}-${mes}-${dia}`;
}

function convertirFecha(fecha: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return null;
  }

  const [año, mes, dia] = fecha.split("-").map(Number);
  const resultado = new Date(año, mes - 1, dia);

  if (
    resultado.getFullYear() !== año ||
    resultado.getMonth() !== mes - 1 ||
    resultado.getDate() !== dia
  ) {
    return null;
  }

  return resultado;
}

export function obtenerDuracionMinutos(
  duracion: string
): number | null {
  const minutos = duracion.match(/^(\d+)\s*min$/i);

  if (minutos) {
    return Number(minutos[1]);
  }

  const horas = duracion.match(/^(\d+)\s*h$/i);

  if (horas) {
    return Number(horas[1]) * 60;
  }

  return null;
}

export function obtenerHorasDisponibles(
  fecha: string,
  profesionalId: string,
  servicioId: string,
  citas: Cita[] = obtenerCitas()
): string[] {

  const fechaElegida = convertirFecha(fecha);

  if (!fechaElegida || fecha < obtenerFechaActual()) {
    return [];
  }

  const profesional = profesionales.find(
    (item) => item.id === profesionalId
  );

  const servicio = servicios.find(
    (item) => item.id === servicioId
  );

  if (!profesional || !servicio) {
    return [];
  }

  const duracion = obtenerDuracionMinutos(servicio.duracion);

  if (duracion === null || duracion <= 0) {
    return [];
  }

  const diaSemana = fechaElegida.getDay();
  const turno = profesional.turnos[diaSemana];

  if (!turno) {
    return [];
  }

  const esFinDeSemana = diaSemana === 0 || diaSemana === 6;

  const apertura = esFinDeSemana ? "10:00" : "08:30";
  const cierre = esFinDeSemana ? "20:00" : "22:00";

  const inicioTurno = convertirAMinutos(turno.inicio);
  const finTurno = convertirAMinutos(turno.fin);
  const inicioClinica = convertirAMinutos(apertura);
  const finClinica = convertirAMinutos(cierre);

  if (
    inicioTurno === null ||
    finTurno === null ||
    inicioClinica === null ||
    finClinica === null
  ) {
    return [];
  }

  const inicio = Math.max(inicioTurno, inicioClinica);
  const fin = Math.min(finTurno, finClinica);

  const ocupaciones: Array<{ inicio: number; fin: number }> = [];

  for (const cita of citas) {
    if (cita.profesional !== profesionalId) {
      continue;
    }

    if (cita.estado === "Cancelada" || cita.estado === "Rechazada") {
      continue;
    }

    const servicioOcupado = servicios.find(
      (item) => item.id === cita.servicio
    );

    const duracionOcupada = servicioOcupado
      ? obtenerDuracionMinutos(servicioOcupado.duracion)
      : null;

    const fechasOcupadas = [
      { fecha: cita.fecha, hora: cita.hora }
    ];

    if (cita.fechaPropuesta && cita.horaPropuesta) {
      fechasOcupadas.push({
        fecha: cita.fechaPropuesta,
        hora: cita.horaPropuesta
      });
    }

    for (const ocupacion of fechasOcupadas) {
      if (ocupacion.fecha !== fecha) {
        continue;
      }

      const inicioOcupado = convertirAMinutos(ocupacion.hora);

      if (inicioOcupado === null || duracionOcupada === null) {
        ocupaciones.push({ inicio: 0, fin: 1440 });
        continue;
      }

      ocupaciones.push({
        inicio: inicioOcupado,
        fin: inicioOcupado + duracionOcupada
      });
    }
  }

  const horasDisponibles: string[] = [];
  const intervalo = 30;

  const primerHorario = Math.ceil(inicio / intervalo) * intervalo;
  const hoy = new Date();

  for (
    let minutos = primerHorario;
    minutos + duracion <= fin;
    minutos += intervalo
  ) {

    if (fecha === obtenerFechaActual()) {
      const minutosActuales =
        hoy.getHours() * 60 + hoy.getMinutes();

      if (minutos <= minutosActuales) {
        continue;
      }
    }

    const finAtencion = minutos + duracion;

    const existeCruce = ocupaciones.some(
      (ocupacion) =>
        minutos < ocupacion.fin &&
        finAtencion > ocupacion.inicio
    );

    if (!existeCruce) {
      horasDisponibles.push(convertirAHora(minutos));
    }
  }

  return horasDisponibles;
}