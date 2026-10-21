
import { useState } from "react";

import {
  obtenerCitas,
  confirmarCita,
  proponerHorarioCita,
  cancelarCita,
  eliminarCitaCancelada
} from "../datos/citas";

import type { Cita } from "../datos/citas";
import type { Sesion } from "../datos/usuarios";

import { obtenerDescripcionProfesional } from "../datos/profesionales";
import { obtenerHorasDisponibles } from "../datos/horarios";

import SelectorHorario from "../componentes/organismos/SelectorHorario";
import MensajesContacto from "../componentes/organismos/MensajesContacto";

interface RecepcionProps {
  sesion: Sesion | null;
}

function Recepcion({ sesion }: RecepcionProps) {

  const [citas, setCitas] = useState<Cita[]>(
    () => obtenerCitas()
  );

  const [idEditando, setIdEditando] = useState<string | null>(null);
  const [fechaPropuesta, setFechaPropuesta] = useState("");
  const [horaPropuesta, setHoraPropuesta] = useState("");
  const [mensaje, setMensaje] = useState("");

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

  function seleccionarFecha(nuevaFecha: string) {
    setFechaPropuesta(nuevaFecha);
    setHoraPropuesta("");
    setMensaje("");
  }

  function confirmarHora(nuevaHora: string) {
    setHoraPropuesta(nuevaHora);
    setMensaje("");
  }

  function cancelarPropuesta() {
    setIdEditando(null);
    setFechaPropuesta("");
    setHoraPropuesta("");
    setMensaje("");
  }

  function guardarPropuesta(id: string) {
    const citasActuales = obtenerCitas();

    const cita = citasActuales.find(
      (item) => item.id === id
    );

    if (!cita || !cita.profesional) {
      setMensaje("La cita no tiene un profesional asignado.");
      return;
    }

    if (!fechaPropuesta || !horaPropuesta) {
      setMensaje("Debes seleccionar y confirmar una hora disponible.");
      return;
    }

    if (
      fechaPropuesta === cita.fecha &&
      horaPropuesta === cita.hora
    ) {
      setMensaje("Debes proponer un horario diferente al solicitado.");
      return;
    }

    const otrasCitas = citasActuales.filter(
      (item) => item.id !== id
    );

    const horasDisponibles = obtenerHorasDisponibles(
      fechaPropuesta,
      cita.profesional,
      cita.servicio,
      otrasCitas
    );

    if (!horasDisponibles.includes(horaPropuesta)) {
      setHoraPropuesta("");
      setMensaje(
        "El horario seleccionado ya no esta disponible. Selecciona otra hora."
      );
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

  function cancelar(id: string) {
    const confirmarCancelacion = window.confirm(
      "¿Estas seguro de que deseas cancelar esta cita? El horario quedara disponible."
    );

    if (!confirmarCancelacion) {
      return;
    }

    const resultado = cancelarCita(id);

    if (resultado) {
      actualizarListado();

      if (idEditando === id) {
        setIdEditando(null);
        setFechaPropuesta("");
        setHoraPropuesta("");
      }

      setMensaje(
        "Cita cancelada correctamente. El horario esta disponible."
      );
    } else {
      setMensaje("No se pudo cancelar la cita.");
    }
  }

  function eliminarCancelada(id: string) {
    const confirmarEliminacion = window.confirm(
      "¿Estas seguro de que deseas eliminar definitivamente esta cita cancelada?"
    );

    if (!confirmarEliminacion) {
      return;
    }

    const resultado = eliminarCitaCancelada(id);

    if (resultado) {
      actualizarListado();

      if (idEditando === id) {
        setIdEditando(null);
        setFechaPropuesta("");
        setHoraPropuesta("");
      }

      setMensaje("Cita cancelada eliminada correctamente.");
    } else {
      setMensaje("Solo puedes eliminar citas canceladas.");
    }
  }

  if (
    !sesion ||
    (sesion.rol !== "recepcionista" && sesion.rol !== "admin")
  ) {
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
          confirmarlas, proponer otro horario o cancelar citas.
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

              <article
                className="cita-item"
                key={cita.id}
              >

                <h3>
                  {cita.servicio} - {cita.mascota}
                </h3>

                <p>
                  <strong>Dueño:</strong>{" "}
                  {cita.propietarioNombre} ({cita.propietario})
                </p>

                <p>
                  <strong>Profesional asignado:</strong>{" "}
                  {obtenerDescripcionProfesional(cita.profesional)}
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

                  {cita.estado === "Cancelada" ? (

                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => eliminarCancelada(cita.id)}
                    >
                      Eliminar cita
                    </button>

                  ) : cita.estado === "Rechazada" ? (

                    <span>
                      Cita rechazada
                    </span>

                  ) : (

                    <>
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

                      <button
                        type="button"
                        className="btn btn-warning"
                        onClick={() => cancelar(cita.id)}
                      >
                        Cancelar cita
                      </button>
                    </>

                  )}

                </div>

                {idEditando === cita.id &&
                  cita.estado !== "Cancelada" &&
                  cita.estado !== "Rechazada" && (

                  <div className="formulario-propuesta">

                    {cita.profesional ? (
                      <>

                        <SelectorHorario
                          key={cita.id}
                          fechaSeleccionada={fechaPropuesta}
                          horaConfirmada={horaPropuesta}
                          horasDisponibles={
                            fechaPropuesta
                              ? obtenerHorasDisponibles(
                                  fechaPropuesta,
                                  cita.profesional,
                                  cita.servicio,
                                  obtenerCitas().filter(
                                    (item) => item.id !== cita.id
                                  )
                                )
                              : []
                          }
                          onSeleccionarFecha={seleccionarFecha}
                          onConfirmarHora={confirmarHora}
                        />

                        <div className="acciones-cita">

                          <button
                            type="button"
                            className="btn-principal"
                            disabled={!fechaPropuesta || !horaPropuesta}
                            onClick={() => guardarPropuesta(cita.id)}
                          >
                            Guardar propuesta
                          </button>

                          <button
                            type="button"
                            className="btn-secundario"
                            onClick={cancelarPropuesta}
                          >
                            Cancelar
                          </button>

                        </div>

                      </>
                    ) : (

                      <>
                        <p>
                          Esta cita no tiene un profesional asignado.
                          Debes asignar uno antes de proponer otro horario.
                        </p>

                        <button
                          type="button"
                          className="btn-secundario"
                          onClick={cancelarPropuesta}
                        >
                          Cerrar
                        </button>
                      </>

                    )}

                  </div>

                )}

              </article>

            ))
          )}

        </div>
      </section>

      <MensajesContacto />

    </main>
  );
}

export default Recepcion;