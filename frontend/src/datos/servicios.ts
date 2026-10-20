export interface Servicio {
  id: string;
  categoria: string;
  nombre: string;
  especie: string;
  duracion: string;
  precio: number;
  obs: string;
  imagen: string;
}

export const servicios: Servicio[] = [
  {
    id: "SV001",
    categoria: "Consultas",
    nombre: "Consulta general",
    especie: "Perro / Gato",
    duracion: "30 min",
    precio: 15000,
    obs: "Sin observaciones adicionales",
    imagen: "/img/gato.jpg"
  },
  {
    id: "SV002",
    categoria: "Consultas",
    nombre: "Consulta urgencia",
    especie: "Perro / Gato",
    duracion: "30 min",
    precio: 25000,
    obs: "Fuera de horario +$10.000",
    imagen: "/img/gato.jpg"
  },
  {
    id: "SV003",
    categoria: "Consultas",
    nombre: "Control postoperatorio",
    especie: "Perro / Gato",
    duracion: "20 min",
    precio: 10000,
    obs: "Sin observaciones adicionales",
    imagen: "/img/gato.jpg"
  },
  {
    id: "SV004",
    categoria: "Consultas",
    nombre: "Consulta ave / conejo",
    especie: "Ave / Conejo",
    duracion: "30 min",
    precio: 18000,
    obs: "Sin observaciones adicionales",
    imagen: "/img/gato.jpg"
  },
  {
    id: "SV005",
    categoria: "Consultas",
    nombre: "Segunda opinion medica",
    especie: "Todas",
    duracion: "40 min",
    precio: 20000,
    obs: "Requiere ficha previa",
    imagen: "/img/gato.jpg"
  },
  {
    id: "VA001",
    categoria: "Vacunacion",
    nombre: "Vacuna antirrabica canina",
    especie: "Perro",
    duracion: "10 min",
    precio: 12000,
    obs: "Obligatoria por ley",
    imagen: "/img/vacuna.jpg"
  }
];