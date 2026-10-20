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

export function obtenerUsuarios(): Usuario[] {
  const datos = localStorage.getItem("usuariosSanMarcos");

  if (!datos) {
    return [];
  }

  try {
    return JSON.parse(datos) as Usuario[];
  } catch {
    return [];
  }
}

export function guardarUsuarios(usuarios: Usuario[]) {
  localStorage.setItem(
    "usuariosSanMarcos",
    JSON.stringify(usuarios)
  );
}