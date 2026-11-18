export interface Usuario {
  rut: string;
  nombre: string;
  apellidos: string;
  correo: string;
  direccion: string;
  password: string;
  rol: string;
  activo?: boolean;
}

export interface Sesion {
  rut: string;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: string;
}

export interface DatosEdicionPersonal {
  nombre: string;
  apellidos: string;
  direccion: string;
}

export type DatosNuevoPersonal = Pick<
  Usuario,
  "rut" | "nombre" | "apellidos" | "correo" | "direccion" | "password"
>;