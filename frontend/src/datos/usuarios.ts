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
}