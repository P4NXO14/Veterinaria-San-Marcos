import { validarRUT } from "./validacionesRut";
import { validarCorreoPorRol } from "./validacionesCorreo";

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

export function inicializarUsuariosPrueba(): void {

  if (
    localStorage.getItem("usuariosPruebaInicializados") === "true"
  ) {
    return;
  }

  const usuarios = obtenerUsuarios();

  const usuariosPrueba: Usuario[] = [
    {
      rut: "900000014",
      nombre: "Administrador",
      apellidos: "San Marcos",
      correo: "admin@sanmarcos.com",
      direccion: "Veterinaria San Marcos",
      password: "Admin123",
      rol: "admin",
      activo: true
    },
    {
      rut: "900000022",
      nombre: "Personal",
      apellidos: "San Marcos",
      correo: "personal@sanmarcos.com",
      direccion: "Veterinaria San Marcos",
      password: "Pers1234",
      rol: "recepcionista",
      activo: true
    }
  ];

  usuariosPrueba.forEach((cuenta) => {
    const existe = usuarios.some(
      (usuario) =>
        usuario.correo.toLowerCase() === cuenta.correo ||
        usuario.rut === cuenta.rut
    );

    if (!existe) {
      usuarios.push(cuenta);
    }
  });

  guardarUsuarios(usuarios);

  localStorage.setItem("usuariosPruebaInicializados", "true");
}

export function cambiarEstadoUsuario(
  rut: string,
  activo: boolean
): boolean {
  const usuarios = obtenerUsuarios();

  const usuario = usuarios.find(
    (item) => item.rut === rut
  );

  if (!usuario) {
    return false;
  }

  if (usuario.rol === "admin") {
    return false;
  }

  usuario.activo = activo;

  guardarUsuarios(usuarios);

  return true;
}

export function agregarUsuario(nuevoUsuario: Usuario): boolean {
  const usuarios = obtenerUsuarios();

  const existe = usuarios.some(
    (usuario) =>
      usuario.rut === nuevoUsuario.rut ||
      usuario.correo.toLowerCase() ===
        nuevoUsuario.correo.toLowerCase()
  );

  if (existe) {
    return false;
  }

  usuarios.push(nuevoUsuario);

  guardarUsuarios(usuarios);

  return true;
}


export function eliminarUsuario(rut: string): boolean {
  const usuarios = obtenerUsuarios();

  const usuario = usuarios.find(
    (item) => item.rut === rut
  );

  if (!usuario) {
    return false;
  }

  if (usuario.rol === "admin") {
    return false;
  }

  const usuariosActualizados = usuarios.filter(
    (item) => item.rut !== rut
  );

  guardarUsuarios(usuariosActualizados);

  return true;
}


export interface DatosEdicionPersonal {
  nombre: string;
  apellidos: string;
  direccion: string;
}

export function editarPersonal(
  rut: string,
  datos: DatosEdicionPersonal
): boolean {
  const usuarios = obtenerUsuarios();

  const usuario = usuarios.find(
    (item) => item.rut === rut
  );

  if (!usuario || usuario.rol !== "recepcionista") {
    return false;
  }

  const nombre = datos.nombre.trim();
  const apellidos = datos.apellidos.trim();
  const direccion = datos.direccion.trim();

  if (
    nombre.length === 0 ||
    nombre.length > 50 ||
    apellidos.length === 0 ||
    apellidos.length > 100 ||
    direccion.length === 0 ||
    direccion.length > 300
  ) {
    return false;
  }

  usuario.nombre = nombre;
  usuario.apellidos = apellidos;
  usuario.direccion = direccion;

  guardarUsuarios(usuarios);

  return true;
}


export type DatosNuevoPersonal = Pick<
  Usuario,
  "rut" | "nombre" | "apellidos" | "correo" | "direccion" | "password"
>;

export function crearPersonal(datos: DatosNuevoPersonal): boolean {
  const rut = datos.rut.trim().toUpperCase();
  const nombre = datos.nombre.trim();
  const apellidos = datos.apellidos.trim();
  const correo = datos.correo.trim().toLowerCase();
  const direccion = datos.direccion.trim();

  if (!validarRUT(rut)) {
    return false;
  }

  if (!nombre || nombre.length > 50) {
    return false;
  }

  if (!apellidos || apellidos.length > 100) {
    return false;
  }

  if (!validarCorreoPorRol(correo, "recepcionista")) {
    return false;
  }

  if (!direccion || direccion.length > 300) {
    return false;
  }

  if (datos.password.length < 4 || datos.password.length > 10) {
    return false;
  }

  const nuevoUsuario: Usuario = {
    rut,
    nombre,
    apellidos,
    correo,
    direccion,
    password: datos.password,
    rol: "recepcionista",
    activo: true
  };

  return agregarUsuario(nuevoUsuario);
}