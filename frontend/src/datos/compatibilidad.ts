import { profesionales } from "./profesionales";
import type { Profesional } from "./profesionales";


const todosVeterinarios = [
  "VET001",
  "VET002",
  "VET003"
];


const profesionalesApoyo = [
  "VET001",
  "VET002",
  "VET003",
  "TEC001"
];

const compatibilidadPorServicio: Record<
  string,
  readonly string[]
> = {


  SV001: todosVeterinarios,
  SV002: todosVeterinarios,
  SV003: ["VET002"],
  SV004: ["VET003"],
  SV005: todosVeterinarios,

  VA001: todosVeterinarios,
  VA002: todosVeterinarios,
  VA003: todosVeterinarios,
  VA004: todosVeterinarios,
  VA005: todosVeterinarios,
  VA006: todosVeterinarios,

  CI001: ["VET002"],
  CI002: ["VET002"],
  CI003: ["VET002"],
  CI004: ["VET002"],
  CI005: ["VET002"],
  CI006: ["VET002"],

  DE001: todosVeterinarios,
  DE002: todosVeterinarios,
  DE003: todosVeterinarios,
  DE004: todosVeterinarios,
  DE005: profesionalesApoyo,

  EX001: ["VET001", "VET003"],
  EX002: ["VET001", "VET003"],
  EX003: ["VET003"],
  EX004: ["VET003"],
  EX005: ["VET001", "VET003"],

  OT001: profesionalesApoyo,
  OT002: ["VET002"],
  OT003: todosVeterinarios,


  OT004: []
};

export function esProfesionalCompatible(
  servicioId: string,
  profesionalId: string
): boolean {
  const permitidos =
    compatibilidadPorServicio[servicioId] ?? [];

  return permitidos.includes(profesionalId);
}

export function obtenerProfesionalesCompatibles(
  servicioId: string
): Profesional[] {
  return profesionales.filter((profesional) =>
    esProfesionalCompatible(
      servicioId,
      profesional.id
    )
  );
}