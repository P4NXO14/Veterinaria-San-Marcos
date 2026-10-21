
import { useState } from "react";

import { obtenerMensajesContacto } from "../../datos/mensajesContacto";
import type { MensajeContacto as Mensaje } from "../../datos/mensajesContacto";

function MensajesContacto() {
  const [mensajes, setMensajes] = useState<Mensaje[]>(
    () => obtenerMensajesContacto()
  );

  function actualizarMensajes() {
    setMensajes(obtenerMensajesContacto());
  }

  return (
    <section className="seccion-separada">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2>Mensajes de Contacto</h2>

        <button
          type="button"
          className="btn btn-primary"
          onClick={actualizarMensajes}
        >
          Actualizar mensajes
        </button>
      </div>

      {mensajes.length === 0 ? (
        <p>No existen mensajes de contacto registrados.</p>
      ) : (
        [...mensajes].reverse().map((mensaje) => (
          <article className="cita-item" key={mensaje.id}>
            <h3>{mensaje.nombre}</h3>

            <p>
              <strong>Correo:</strong> {mensaje.correo}
            </p>

            <p>
              <strong>Cuenta de origen:</strong> {mensaje.correoCuenta}
            </p>

            <p>
              <strong>Fecha de envio:</strong>{" "}
              {new Date(mensaje.fechaEnvio).toLocaleString("es-CL")}
            </p>

            <p>
              <strong>Mensaje:</strong>
            </p>

            <p className="text-break">
              {mensaje.comentario}
            </p>
          </article>
        ))
      )}
    </section>
  );
}

export default MensajesContacto;