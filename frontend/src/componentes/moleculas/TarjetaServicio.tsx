import { useState } from "react";
import type { Servicio } from "../../datos/servicios";

interface TarjetaServicioProps {
  servicio: Servicio;
  onSolicitarCita: (id: string) => void;
}

function TarjetaServicio({ servicio, onSolicitarCita }: TarjetaServicioProps) {
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  const precioFormateado = servicio.precio.toLocaleString("es-CL");

  return (
    <article className="tarjeta-servicio">
      <img
        src={servicio.imagen}
        alt={servicio.nombre}
        className="tarjeta-img"
      />

      <h3 className="tarjeta-titulo">
        {servicio.nombre}
      </h3>

      <p className="tarjeta-categoria">
        {servicio.categoria}
      </p>

      <p>
        <strong>Precio: ${precioFormateado}</strong>
      </p>

      <button
        type="button"
        className="btn-detalle"
        aria-expanded={mostrarDetalle}
        onClick={() => setMostrarDetalle(!mostrarDetalle)}
      >
        Ver detalle
      </button>

      {mostrarDetalle && (
        <div className="detalle-servicio detalle-visible">
          <p><strong>Codigo:</strong> {servicio.id}</p>
          <p><strong>Especie:</strong> {servicio.especie}</p>
          <p><strong>Duracion:</strong> {servicio.duracion}</p>
          <p><strong>Observaciones:</strong> {servicio.obs}</p>
        </div>
      )}

      <button
        type="button"
        className="btn-agendar-cita"
        onClick={() => onSolicitarCita(servicio.id)}
      >
        Solicitar Cita
      </button>
    </article>
  );
}

export default TarjetaServicio;