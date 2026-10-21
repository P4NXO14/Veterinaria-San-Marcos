
export interface Turno {
  inicio: string;
  fin: string;
}

export interface Profesional {
  id: string;
  nombre: string;
  tipo: "veterinario" | "tecnico";
  especialidad: string;
  turnos: Record<number, Turno | null>;
}

export const profesionales: Profesional[] = [
  {
    id: "VET001",
    nombre: "Medico Veterinario 1",
    tipo: "veterinario",
    especialidad: "Medicina general y preventiva",
    turnos: {
      0: null,
      1: { inicio: "08:30", fin: "15:30" },
      2: { inicio: "08:30", fin: "15:30" },
      3: { inicio: "08:30", fin: "15:30" },
      4: { inicio: "08:30", fin: "15:30" },
      5: { inicio: "08:30", fin: "15:30" },
      6: { inicio: "10:00", fin: "16:00" }
    }
  },
  {
    id: "VET002",
    nombre: "Medico Veterinario 2",
    tipo: "veterinario",
    especialidad: "Cirugia y cuidados postoperatorios",
    turnos: {
      0: { inicio: "10:00", fin: "16:00" },
      1: { inicio: "14:00", fin: "22:00" },
      2: { inicio: "14:00", fin: "22:00" },
      3: { inicio: "14:00", fin: "22:00" },
      4: { inicio: "14:00", fin: "22:00" },
      5: { inicio: "14:00", fin: "22:00" },
      6: null
    }
  },
  {
    id: "VET003",
    nombre: "Medico Veterinario 3",
    tipo: "veterinario",
    especialidad: "Animales exoticos y diagnostico",
    turnos: {
      0: { inicio: "14:00", fin: "20:00" },
      1: { inicio: "10:00", fin: "18:00" },
      2: { inicio: "12:00", fin: "20:00" },
      3: { inicio: "10:00", fin: "18:00" },
      4: { inicio: "12:00", fin: "20:00" },
      5: { inicio: "10:00", fin: "18:00" },
      6: { inicio: "14:00", fin: "20:00" }
    }
  },
  {
    id: "TEC001",
    nombre: "Tecnico Veterinario",
    tipo: "tecnico",
    especialidad: "Enfermeria y apoyo clinico",
    turnos: {
      0: null,
      1: { inicio: "09:00", fin: "17:00" },
      2: { inicio: "09:00", fin: "17:00" },
      3: { inicio: "09:00", fin: "17:00" },
      4: { inicio: "09:00", fin: "17:00" },
      5: { inicio: "09:00", fin: "17:00" },
      6: { inicio: "10:00", fin: "14:00" }
    }
  }
];

export function obtenerDescripcionProfesional(
  id?: string
): string {
  const profesional = profesionales.find(
    (item) => item.id === id
  );

  if (!profesional) {
    return "Sin profesional asignado";
  }

  return `${profesional.nombre} - ${profesional.especialidad}`;
}