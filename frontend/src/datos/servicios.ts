
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

  // Consultas

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

  // Vacunacion

  {
    id: "VA001",
    categoria: "Vacunacion",
    nombre: "Vacuna antirrabica canina",
    especie: "Perro",
    duracion: "10 min",
    precio: 12000,
    obs: "Obligatoria por ley",
    imagen: "/img/vacuna.jpg"
  },
  {
    id: "VA002",
    categoria: "Vacunacion",
    nombre: "Vacuna sextuple canina",
    especie: "Perro",
    duracion: "10 min",
    precio: 18000,
    obs: "Refuerzo anual",
    imagen: "/img/vacuna.jpg"
  },
  {
    id: "VA003",
    categoria: "Vacunacion",
    nombre: "Vacuna bivalente felina",
    especie: "Gato",
    duracion: "10 min",
    precio: 15000,
    obs: "Refuerzo anual",
    imagen: "/img/vacuna.jpg"
  },
  {
    id: "VA004",
    categoria: "Vacunacion",
    nombre: "Vacuna triple felina",
    especie: "Gato",
    duracion: "10 min",
    precio: 17000,
    obs: "Refuerzo anual",
    imagen: "/img/vacuna.jpg"
  },
  {
    id: "VA005",
    categoria: "Vacunacion",
    nombre: "Vacuna Bordetella canina",
    especie: "Perro",
    duracion: "10 min",
    precio: 14000,
    obs: "Tos de las perreras",
    imagen: "/img/vacuna.jpg"
  },
  {
    id: "VA006",
    categoria: "Vacunacion",
    nombre: "Vacuna antirrabica felina",
    especie: "Gato",
    duracion: "10 min",
    precio: 12000,
    obs: "Sin observaciones adicionales",
    imagen: "/img/vacuna.jpg"
  },

  // Cirugia

  {
    id: "CI001",
    categoria: "Cirugia",
    nombre: "Esterilizacion hembra canina",
    especie: "Perra",
    duracion: "90 min",
    precio: 80000,
    obs: "Incluye anestesia y hospitalizacion 24h",
    imagen: "/img/gato.jpg"
  },
  {
    id: "CI002",
    categoria: "Cirugia",
    nombre: "Esterilizacion macho canino",
    especie: "Perro",
    duracion: "60 min",
    precio: 60000,
    obs: "Incluye anestesia",
    imagen: "/img/gato.jpg"
  },
  {
    id: "CI003",
    categoria: "Cirugia",
    nombre: "Esterilizacion hembra felina",
    especie: "Gata",
    duracion: "60 min",
    precio: 65000,
    obs: "Incluye anestesia y hospitalizacion 12h",
    imagen: "/img/gato.jpg"
  },
  {
    id: "CI004",
    categoria: "Cirugia",
    nombre: "Esterilizacion macho felino",
    especie: "Gato",
    duracion: "45 min",
    precio: 50000,
    obs: "Incluye anestesia",
    imagen: "/img/gato.jpg"
  },
  {
    id: "CI005",
    categoria: "Cirugia",
    nombre: "Extirpacion de tumor cutaneo",
    especie: "Perro / Gato",
    duracion: "60 min",
    precio: 120000,
    obs: "Precio referencial; varia segun tamaño",
    imagen: "/img/gato.jpg"
  },
  {
    id: "CI006",
    categoria: "Cirugia",
    nombre: "Cesarea de urgencia",
    especie: "Perra / Gata",
    duracion: "120 min",
    precio: 180000,
    obs: "Sin observaciones adicionales",
    imagen: "/img/gato.jpg"
  },

  // Desparasitacion

  {
    id: "DE001",
    categoria: "Desparasitacion",
    nombre: "Desparasitacion interna pequeños (<10 kg)",
    especie: "Perro",
    duracion: "5 min",
    precio: 8000,
    obs: "Sin observaciones adicionales",
    imagen: "/img/gato.jpg"
  },
  {
    id: "DE002",
    categoria: "Desparasitacion",
    nombre: "Desparasitacion interna medianos (10-25 kg)",
    especie: "Perro",
    duracion: "5 min",
    precio: 9500,
    obs: "Sin observaciones adicionales",
    imagen: "/img/gato.jpg"
  },
  {
    id: "DE003",
    categoria: "Desparasitacion",
    nombre: "Desparasitacion interna grandes (>25 kg)",
    especie: "Perro",
    duracion: "5 min",
    precio: 11000,
    obs: "Sin observaciones adicionales",
    imagen: "/img/gato.jpg"
  },
  {
    id: "DE004",
    categoria: "Desparasitacion",
    nombre: "Desparasitacion interna felina",
    especie: "Gato",
    duracion: "5 min",
    precio: 8000,
    obs: "Sin observaciones adicionales",
    imagen: "/img/gato.jpg"
  },
  {
    id: "DE005",
    categoria: "Desparasitacion",
    nombre: "Antiparasitario externo (pipeta)",
    especie: "Perro / Gato",
    duracion: "5 min",
    precio: 7500,
    obs: "Incluye aplicacion",
    imagen: "/img/gato.jpg"
  },

  // Examenes

  {
    id: "EX001",
    categoria: "Examenes",
    nombre: "Hemograma completo",
    especie: "Perro / Gato",
    duracion: "30 min",
    precio: 22000,
    obs: "Resultado en 24-48 h",
    imagen: "/img/gato.jpg"
  },
  {
    id: "EX002",
    categoria: "Examenes",
    nombre: "Perfil bioquimico completo",
    especie: "Perro / Gato",
    duracion: "30 min",
    precio: 35000,
    obs: "Resultado en 24-48 h",
    imagen: "/img/gato.jpg"
  },
  {
    id: "EX003",
    categoria: "Examenes",
    nombre: "Radiografia (1 proyeccion)",
    especie: "Perro / Gato",
    duracion: "20 min",
    precio: 28000,
    obs: "Sin observaciones adicionales",
    imagen: "/img/gato.jpg"
  },
  {
    id: "EX004",
    categoria: "Examenes",
    nombre: "Ecografia abdominal",
    especie: "Perro / Gato",
    duracion: "30 min",
    precio: 45000,
    obs: "Sin observaciones adicionales",
    imagen: "/img/gato.jpg"
  },
  {
    id: "EX005",
    categoria: "Examenes",
    nombre: "Test de leishmaniasis",
    especie: "Perro",
    duracion: "20 min",
    precio: 18000,
    obs: "Sin observaciones adicionales",
    imagen: "/img/gato.jpg"
  },

  // Otros

  {
    id: "OT001",
    categoria: "Otros",
    nombre: "Corte de uñas",
    especie: "Perro / Gato",
    duracion: "15 min",
    precio: 5000,
    obs: "Sin observaciones adicionales",
    imagen: "/img/gato.jpg"
  },
  {
    id: "OT002",
    categoria: "Otros",
    nombre: "Limpieza dental",
    especie: "Perro / Gato",
    duracion: "45 min",
    precio: 55000,
    obs: "Requiere anestesia",
    imagen: "/img/gato.jpg"
  },
  {
    id: "OT003",
    categoria: "Otros",
    nombre: "Microchip identificacion",
    especie: "Perro / Gato",
    duracion: "10 min",
    precio: 15000,
    obs: "Incluye registro",
    imagen: "/img/gato.jpg"
  },
  {
    id: "OT004",
    categoria: "Otros",
    nombre: "Hospitalizacion (por dia)",
    especie: "Perro / Gato",
    duracion: "24 h",
    precio: 30000,
    obs: "Incluye monitoreo y alimentacion basica",
    imagen: "/img/gato.jpg"
  }
];