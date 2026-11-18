import {servicios as serviciosLocales} from "./servicios";
import type {Servicio} from "./servicios";

export const ESPECIES_MASCOTAS = [
  "Perro",
  "Gato",
  "Ave",
  "Conejo"
] as const;

export type EspecieMascota =
  (typeof ESPECIES_MASCOTAS)[number];

const equivalencias: Record<string,EspecieMascota> = {
  Perro: "Perro",
  Perra: "Perro",
  Gato: "Gato",
  Gata: "Gato",
  Ave: "Ave",
  Conejo: "Conejo"
};

export function obtenerEspeciesPermitidas(
  servicioId: string,
  catalogo: Servicio[] = serviciosLocales
): EspecieMascota[] {
  const servicio = catalogo.find(
    (item) => item.id === servicioId
  );

  if (!servicio) {
    return [];
  }

  if (servicio.especie === "Todas") {
    return [...ESPECIES_MASCOTAS];
  }

  const permitidas = new Set<EspecieMascota>();

  for (const nombre of servicio.especie.split("/")) {
    const especie = equivalencias[nombre.trim()];

    if (especie) {
      permitidas.add(especie);
    }
  }

  return [...permitidas];
}

export function esEspecieCompatible(
  servicioId: string,
  especie: string,
  catalogo: Servicio[] = serviciosLocales
): boolean {
  return obtenerEspeciesPermitidas(servicioId,catalogo).some(
    (permitida) => permitida === especie
  );
}