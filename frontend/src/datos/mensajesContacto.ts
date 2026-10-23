export interface MensajeContacto {
  id: string;
  nombre: string;
  correo: string;
  comentario: string;
  correoCuenta: string;
  fechaEnvio: string;
}

export function obtenerMensajesContacto(): MensajeContacto[] {
  const datos = localStorage.getItem("mensajesContactoSanMarcos");

  if (!datos) {
    return [];
  }

  try {
    const mensajes: unknown = JSON.parse(datos);
    return Array.isArray(mensajes)
      ? mensajes as MensajeContacto[]
      : [];
  } catch {
    return [];
  }
}

export function guardarMensajeContacto(
  datos: Pick<
    MensajeContacto,
    "nombre" | "correo" | "comentario" | "correoCuenta"
  >
): void {
  const mensajes = obtenerMensajesContacto();

  const nuevoMensaje: MensajeContacto = {
    id: "M" + Date.now() + Math.random().toString(36).slice(2, 8),
    nombre: datos.nombre,
    correo: datos.correo,
    comentario: datos.comentario,
    correoCuenta: datos.correoCuenta,
    fechaEnvio: new Date().toISOString()
  };

  mensajes.push(nuevoMensaje);

  localStorage.setItem(
    "mensajesContactoSanMarcos",
    JSON.stringify(mensajes)
  );
}