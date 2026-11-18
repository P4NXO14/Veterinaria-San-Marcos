import type {CitaServidor} from "../../datos/citasApi";
import type {Servicio} from "../../datos/servicios";
import type {Profesional} from "../../datos/profesionales";

interface ListadoCitasProps {
  citas: CitaServidor[];
  servicios?: Servicio[];
  profesionales?: Profesional[];
}

function ListadoCitas({
  citas,
  servicios = [],
  profesionales = []
}: ListadoCitasProps) {
  if (citas.length === 0) {
    return (
      <p className="reserva-vacia">
        Aun no tienes solicitudes de cita
      </p>
    );
  }

  return (
    <div id="contenedor-citas">
      {[...citas].reverse().map((cita) => {
        const servicio = servicios.find(
          (item) => item.id === cita.servicio
        );

        const profesional = profesionales.find(
          (item) => item.id === cita.profesional
        );

        const descripcionProfesional = profesional
          ? `${profesional.nombre} - ${profesional.especialidad}`
          : cita.profesional || "Sin profesional asignado";

        return (
          <article className="cita-item" key={cita.id}>
            <h3>
              {servicio ? servicio.nombre : cita.servicio}
            </h3>

            <p>
              <strong>Profesional:</strong>{" "}
              {descripcionProfesional}
            </p>

            <p>
              <strong>Mascota:</strong>{" "}
              {cita.mascota} ({cita.especie})
            </p>

            <p>
              <strong>Solicitado:</strong>{" "}
              {cita.fecha} {cita.hora}
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