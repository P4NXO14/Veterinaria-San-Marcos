import type { Cita } from "../../datos/citas";
import { servicios } from "../../datos/servicios";

interface ListadoCitasProps {
  citas: Cita[];
}

function ListadoCitas({ citas }: ListadoCitasProps) {

  if (citas.length === 0) {
    return (
      <p className="reserva-vacia">
        Aun no tienes solicitudes de cita.
      </p>
    );
  }

  return (
    <div id="contenedor-citas">
      {[...citas].reverse().map((cita) => {

        const servicio = servicios.find(
          (item) => item.id === cita.servicio
        );

        return (
          <article className="cita-item" key={cita.id}>

            <h3>
              {servicio ? servicio.nombre : cita.servicio}
            </h3>

            <p>
              <strong>Mascota:</strong> {cita.mascota} ({cita.especie})
            </p>

            <p>
              <strong>Solicitado:</strong> {cita.fecha} {cita.hora}
            </p>

            <p>
              <strong>Estado:</strong>{" "}
              <span className="estado-cita">
                {cita.estado}
              </span>
            </p>

            {cita.fechaPropuesta && (
              <p>
                <strong>Horario propuesto:</strong>{" "}
                {cita.fechaPropuesta} {cita.horaPropuesta}
              </p>
            )}

          </article>
        );
      })}
    </div>
  );
}

export default ListadoCitas;