import { useState } from "react";

import {
  obtenerCitas,
  confirmarCita,
  proponerHorarioCita
} from "../datos/citas";

import type { Cita } from "../datos/citas";
import type { Sesion } from "../datos/usuarios";

interface RecepcionProps {
  sesion: Sesion | null;
}

function Recepcion({ sesion }: RecepcionProps) {
  const [citas, setCitas] = useState<Cita[]>(() => obtenerCitas());

  const [idEditando, setIdEditando] = useState<string | null>(null);
  const [fechaPropuesta, setFechaPropuesta] = useState("");
  const [horaPropuesta, setHoraPropuesta] = useState("");
  const [mensaje, setMensaje] = useState("");

  function fechaActual(): string {
    const hoy = new Date();

    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
  }

  function actualizarListado() {
    setCitas(obtenerCitas());
  }

  function confirmar(id: string) {
    const resultado = confirmarCita(id);

    if (resultado) {
      actualizarListado();
      setMensaje("Cita confirmada correctamente.");
    } else {
      setMensaje("No se pudo confirmar la cita.");
    }
  }

  function abrirPropuesta(id: string) {
    setIdEditando(id);
    setFechaPropuesta("");
    setHoraPropuesta("");
    setMensaje("");
  }

  function guardarPropuesta(id: string) {
    if (!fechaPropuesta || !horaPropuesta) {
      setMensaje("Debes seleccionar una fecha y una hora.");
      return;
    }

    if (fechaPropuesta < fechaActual()) {
      setMensaje("La fecha propuesta no puede ser anterior a hoy.");
      return;
    }

    const resultado = proponerHorarioCita(
      id,
      fechaPropuesta,
      horaPropuesta
    );

    if (resultado) {
      actualizarListado();
      setIdEditando(null);
      setFechaPropuesta("");
      setHoraPropuesta("");
      setMensaje("Nuevo horario propuesto correctamente.");
    } else {
      setMensaje("No se pudo proponer el nuevo horario.");
    }
  }

  if (!sesion || (sesion.rol !== "recepcionista" && sesion.rol !=="admin")) {
    return (
      <main className="contenedor-principal">
        <h1>Acceso restringido</h1>
        <p>No tienes permisos para acceder a esta vista.</p>
      </main>
    );
  }

  return (
    <main className="contenedor-tabla">
      <section>
        <h1>Gestion de Citas</h1>

        <p>
          La recepcionista puede revisar las solicitudes,
          confirmarlas o proponer otro horario.
        </p>

        {mensaje && (
          <p className="mensaje-formulario" role="status">
            {mensaje}
          </p>
        )}

        <div id="lista-recepcion-citas">
          {citas.length === 0 ? (
            <p>No existen solicitudes registradas.</p>
          ) : (
            citas.map((cita) => (
              <article className="cita-item" key={cita.id}>
                <h3>
                  {cita.servicio} - {cita.mascota}
                </h3>

                <p>
                  <strong>Dueño:</strong>{" "}
                  {cita.propietarioNombre} ({cita.propietario})
                </p>

                <p>
                  <strong>Fecha solicitada:</strong>{" "}
                  {cita.fecha} {cita.hora}
                </p>

                <p>
                  <strong>Motivo:</strong> {cita.motivo}
                </p>

                <p>
                  <strong>Estado:</strong> {cita.estado}
                </p>

                {cita.fechaPropuesta && (
                  <p>
                    <strong>Horario propuesto:</strong>{" "}
                    {cita.fechaPropuesta} {cita.horaPropuesta}
                  </p>
                )}

                <div className="acciones-cita">
                  <button
                    type="button"
                    className="btn-principal"
                    onClick={() => confirmar(cita.id)}
                  >
                    Confirmar
                  </button>

                  <button
                    type="button"
                    className="btn-secundario"
                    onClick={() => abrirPropuesta(cita.id)}
                  >
                    Proponer otro horario
                  </button>
                </div>

                {idEditando === cita.id && (
                  <div className="formulario-propuesta">
                    <label htmlFor={`fecha-${cita.id}`}>
                      Nueva fecha:
                    </label>

                    <input
                      id={`fecha-${cita.id}`}
                      type="date"
                      min={fechaActual()}
                      value={fechaPropuesta}
                      onChange={(e) =>
                        setFechaPropuesta(e.target.value)
                      }
                    />

                    <label htmlFor={`hora-${cita.id}`}>
                      Nueva hora:
                    </label>

                    <input
                      id={`hora-${cita.id}`}
                      type="time"
                      value={horaPropuesta}
                      onChange={(e) =>
                        setHoraPropuesta(e.target.value)
                      }
                    />

                    <div className="acciones-cita">
                      <button
                        type="button"
                        className="btn-principal"
                        onClick={() => guardarPropuesta(cita.id)}
                      >
                        Guardar propuesta
                      </button>

                      <button
                        type="button"
                        className="btn-secundario"
                        onClick={() => {
                          setIdEditando(null);
                          setMensaje("");
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default Recepcion;