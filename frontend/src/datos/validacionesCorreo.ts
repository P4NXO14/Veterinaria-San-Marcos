export type RolUsuario = "cliente" | "admin" | "recepcionista";

export function validarCorreoPorRol(
  correo: string,
  rol: RolUsuario
): boolean {
  const correoNormalizado = correo.trim().toLowerCase();

  if (correoNormalizado.length > 100) {
    return false;
  }
  
  if (rol === "cliente") {
    return /^[a-z0-9._%+-]+@(gmail|hotmail)\.com$/.test(correoNormalizado);
  }

  if (rol === "admin") {
    return correoNormalizado === "admin@sanmarcos.com";
  }

  if (rol === "recepcionista") {
    return correoNormalizado === "personal@sanmarcos.com";
  }

  return false;
}