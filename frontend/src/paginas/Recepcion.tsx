import {useEffect,useRef,useState} from "react";
import type {Cita} from "../datos/citas";
import type {CitaServidor} from "../datos/citasApi";
import type {Sesion} from "../datos/usuarios";
import type {Servicio} from "../datos/servicios";
import type {Profesional} from "../datos/profesionales";
import {actualizarCitaServidor,eliminarCitaServidor,obtenerTodasCitasServidor} from "../datos/citasApi";
import {obtenerCompatiblesServidor,obtenerProfesionalesServidor,obtenerServiciosServidor} from "../datos/catalogoApi";
import {obtenerHorasDisponibles} from "../datos/horarios";
import SelectorHorario from "../componentes/organismos/SelectorHorario";
import MensajesContacto from "../componentes/organismos/MensajesContacto";

interface RecepcionProps {
  sesion: Sesion | null;
}

interface AvisoCita {
  id: number;
  texto: string;
  tipo: "exito" | "error";
}

function convertirCitas(citas: CitaServidor[],excluirId?: number): Cita[] {
  return citas
    .filter((cita) => cita.id !== excluirId)
    .map((cita) => ({
      ...cita,
      id: String(cita.id)
    }));
}

function Recepcion({sesion}: RecepcionProps) {
  const [citas,setCitas] = useState<CitaServidor[]>([]);
  const [servicios,setServicios] = useState<Servicio[]>([]);
  const [profesionales,setProfesionales] = useState<Profesional[]>([]);
  const [compatibles,setCompatibles] = useState<string[]>([]);
  const [codigoCompatibilidad,setCodigoCompatibilidad] = useState("");

  const [idEditando,setIdEditando] = useState<number | null>(null);
  const [fechaPropuesta,setFechaPropuesta] = useState("");
  const [horaPropuesta,setHoraPropuesta] = useState("");
  const [mensaje,setMensaje] = useState("");
  const [avisoCita,setAvisoCita] = useState<AvisoCita | null>(null);
  const [errorCarga,setErrorCarga] = useState("");
  const [cargando,setCargando] = useState(true);
  const [procesando,setProcesando] = useState(false);

  const [cargandoCatalogo,setCargandoCatalogo] = useState(true);
  const [errorCatalogo,setErrorCatalogo] = useState("");
  const [cargandoCompatibles,setCargandoCompatibles] = useState(false);
  const [errorCompatibles,setErrorCompatibles] = useState("");
  const [cargandoHoras,setCargandoHoras] = useState(false);
  const [consultaCompletada,setConsultaCompletada] = useState("");
  const [errorHoras,setErrorHoras] = useState("");
  const [revision,setRevision] = useState(0);

  const avisoRef = useRef<HTMLParagraphElement>(null);

  const esPersonal =
    sesion?.rol === "recepcionista" ||
    sesion?.rol === "admin";

  const citaEditando = citas.find(
    (item) => item.id === idEditando
  );

  const codigoServicioEditando = citaEditando?.servicio ?? "";
  const claveConsulta = `${idEditando ?? ""}|${fechaPropuesta}`;

  const catalogoListo =
    !cargandoCatalogo &&
    !errorCatalogo &&
    servicios.length > 0 &&
    profesionales.length > 0;

  const compatibilidadLista =
    !cargandoCompatibles &&
    !errorCompatibles &&
    codigoCompatibilidad === codigoServicioEditando;

  const disponibilidadLista =
    catalogoListo &&
    compatibilidadLista &&
    !cargandoHoras &&
    !errorHoras &&
    consultaCompletada === claveConsulta;

  useEffect(() => {
    if (!esPersonal) {
      return;
    }

    let activo = true;

    obtenerTodasCitasServidor()
      .then((datos) => {
        if (activo) {
          setCitas(datos);
          setErrorCarga("");
        }
      })
      .catch((error: unknown) => {
        if (activo) {
          setErrorCarga(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar las citas"
          );
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  },[esPersonal]);

  useEffect(() => {
    if (!esPersonal) {
      return;
    }

    let activo = true;

    Promise.all([
      obtenerServiciosServidor(),
      obtenerProfesionalesServidor()
    ])
      .then(([datosServicios,datosProfesionales]) => {
        if (activo) {
          setServicios(datosServicios);
          setProfesionales(datosProfesionales);
          setErrorCatalogo("");
        }
      })
      .catch((error: unknown) => {
        if (activo) {
          setErrorCatalogo(
            error instanceof Error
              ? error.message
              : "No se pudieron consultar Servicios y Profesionales"
          );
        }
      })
      .finally(() => {
        if (activo) {
          setCargandoCatalogo(false);
        }
      });

    return () => {
      activo = false;
    };
  },[esPersonal]);

  useEffect(() => {
    if (idEditando === null || !codigoServicioEditando) {
      return;
    }

    let activo = true;

    setCompatibles([]);
    setCodigoCompatibilidad("");
    setErrorCompatibles("");
    setCargandoCompatibles(true);

    obtenerCompatiblesServidor(codigoServicioEditando)
      .then((datos) => {
        if (activo) {
          setCompatibles(datos);
          setCodigoCompatibilidad(codigoServicioEditando);
        }
      })
      .catch((error: unknown) => {
        if (activo) {
          setErrorCompatibles(
            error instanceof Error
              ? error.message
              : "No se pudieron consultar los profesionales compatibles"
          );
        }
      })
      .finally(() => {
        if (activo) {
          setCargandoCompatibles(false);
        }
      });

    return () => {
      activo = false;
    };
  },[idEditando,codigoServicioEditando]);

  useEffect(() => {
    if (idEditando === null || !fechaPropuesta) {
      return;
    }

    let activo = true;

    setCargandoHoras(true);
    setConsultaCompletada("");
    setErrorHoras("");

    obtenerTodasCitasServidor()
      .then((datos) => {
        if (activo) {
          setCitas(datos);
          setConsultaCompletada(claveConsulta);
        }
      })
      .catch(() => {
        if (activo) {
          setErrorHoras("No se pudo consultar la disponibilidad actual");
        }
      })
      .finally(() => {
        if (activo) {
          setCargandoHoras(false);
        }
      });

    return () => {
      activo = false;
    };
  },[idEditando,fechaPropuesta,claveConsulta,revision]);

  useEffect(() => {
    if (avisoCita) {
      avisoRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  },[avisoCita]);

  function mostrarAviso(id: number,texto: string,tipo: "exito" | "error") {
    setAvisoCita({id,texto,tipo});
  }

  function descripcionProfesional(id: string): string {
    const profesional = profesionales.find(
      (item) => item.id === id
    );

    return profesional
      ? `${profesional.nombre} - ${profesional.especialidad}`
      : id || "Sin profesional asignado";
  }

  async function actualizarListado() {
    const datos = await obtenerTodasCitasServidor();
    setCitas(datos);
    setErrorCarga("");
  }

  async function refrescarListado() {
    if (procesando || cargando) {
      return;
    }

    setCargando(true);

    try {
      await actualizarListado();
      setMensaje("");
      setAvisoCita(null);
    } catch (error) {
      setErrorCarga(
        error instanceof Error
          ? error.message
          : "No se pudieron actualizar las citas"
      );
    } finally {
      setCargando(false);
    }
  }

  function cerrarPropuesta() {
    setIdEditando(null);
    setFechaPropuesta("");
    setHoraPropuesta("");
    setConsultaCompletada("");
    setErrorHoras("");
  }

  function cancelarPropuesta() {
    cerrarPropuesta();
    setMensaje("");
    setAvisoCita(null);
  }

  function obtenerHorasPropuesta(cita: CitaServidor): string[] {
    if (
      !fechaPropuesta ||
      !cita.profesional ||
      !disponibilidadLista
    ) {
      return [];
    }

    return obtenerHorasDisponibles(
      fechaPropuesta,
      cita.profesional,
      cita.servicio,
      convertirCitas(citas,cita.id),
      {
        servicios,
        profesionales,
        compatibles
      }
    );
  }

  async function modificarCita(
    id: number,
    cambios: Partial<CitaServidor>,
    confirmacion: string,
    refrescar = true
  ): Promise<boolean> {
    const cita = citas.find((item) => item.id === id);

    if (!cita || procesando) {
      mostrarAviso(
        id,
        "No se encontro la cita o existe otra operacion en proceso",
        "error"
      );
      return false;
    }

    setProcesando(true);
    setMensaje("");
    setAvisoCita(null);

    try {
      const actualizada = await actualizarCitaServidor(id,{
        ...cita,
        ...cambios
      });

      setCitas((anteriores) =>
        anteriores.map((item) =>
          item.id === id ? actualizada : item
        )
      );

      mostrarAviso(id,confirmacion,"exito");

      if (refrescar) {
        try {
          await actualizarListado();
        } catch {
          setErrorCarga(
            "El cambio se guardo, pero no se pudo actualizar el listado"
          );
        }
      }

      return true;
    } catch (error) {
      mostrarAviso(
        id,
        error instanceof Error
          ? error.message
          : "No se pudo modificar la cita",
        "error"
      );
      return false;
    } finally {
      setProcesando(false);
    }
  }

  async function confirmar(id: number) {
    const correcto = await modificarCita(
      id,
      {estado: "Confirmada"},
      "Cita confirmada correctamente"
    );

    if (correcto && idEditando === id) {
      cerrarPropuesta();
    }
  }

  async function registrarAsistencia(id: number) {
    await modificarCita(
      id,
      {estado: "Atendida"},
      "Asistencia registrada correctamente"
    );
  }

  function abrirPropuesta(id: number) {
    if (procesando) {
      return;
    }

    setIdEditando(id);
    setFechaPropuesta("");
    setHoraPropuesta("");
    setConsultaCompletada("");
    setAvisoCita(null);
    setMensaje("");
  }

  function seleccionarFecha(nuevaFecha: string) {
    setFechaPropuesta(nuevaFecha);
    setHoraPropuesta("");
    setConsultaCompletada("");
    setAvisoCita(null);
    setMensaje("");
  }

  function confirmarHora(nuevaHora: string) {
    setHoraPropuesta(nuevaHora);
    setAvisoCita(null);
    setMensaje("");
  }

  async function guardarPropuesta(id: number) {
    if (procesando || cargando || cargandoHoras) {
      return;
    }

    const cita = citas.find((item) => item.id === id);

    if (!cita || !cita.profesional) {
      mostrarAviso(
        id,
        "La cita no tiene un profesional asignado",
        "error"
      );
      return;
    }

    if (!catalogoListo || !compatibilidadLista) {
      mostrarAviso(
        id,
        "No se pudieron comprobar los turnos y profesionales",
        "error"
      );
      return;
    }

    if (!fechaPropuesta || !horaPropuesta || !disponibilidadLista) {
      mostrarAviso(
        id,
        "Debes seleccionar y confirmar una hora disponible",
        "error"
      );
      return;
    }

    if (
      fechaPropuesta === cita.fecha &&
      horaPropuesta === cita.hora
    ) {
      mostrarAviso(
        id,
        "Debes proponer un horario diferente al solicitado",
        "error"
      );
      return;
    }

    if (!obtenerHorasPropuesta(cita).includes(horaPropuesta)) {
      setHoraPropuesta("");
      mostrarAviso(
        id,
        "El horario seleccionado ya no esta disponible, actualiza el calendario",
        "error"
      );
      return;
    }

    const correcto = await modificarCita(
      id,
      {
        estado: "Horario propuesto",
        fechaPropuesta,
        horaPropuesta
      },
      "Nuevo horario propuesto correctamente",
      false
    );

    if (correcto) {
      cerrarPropuesta();
    }
  }

  async function cancelar(id: number) {
    if (procesando) {
      return;
    }

    const confirmacion = window.confirm(
      "¿Estas seguro de que deseas cancelar esta cita? El horario quedara disponible"
    );

    if (!confirmacion) {
      return;
    }

    const correcto = await modificarCita(
      id,
      {
        estado: "Cancelada",
        fechaPropuesta: "",
        horaPropuesta: ""
      },
      "Cita cancelada correctamente, el horario esta disponible"
    );

    if (correcto && idEditando === id) {
      cerrarPropuesta();
    }
  }

  async function eliminarCancelada(id: number) {
    const cita = citas.find((item) => item.id === id);

    if (!cita || cita.estado !== "Cancelada" || procesando) {
      mostrarAviso(id,"Solo puedes eliminar citas canceladas","error");
      return;
    }

    const confirmacion = window.confirm(
      `¿Estas seguro de que deseas eliminar definitivamente la cita ${id} de ${cita.mascota}?`
    );

    if (!confirmacion) {
      return;
    }

    setProcesando(true);
    setMensaje("");
    setAvisoCita(null);

    try {
      await eliminarCitaServidor(id);

      setCitas((anteriores) =>
        anteriores.filter((item) => item.id !== id)
      );

      if (idEditando === id) {
        cerrarPropuesta();
      }

      setMensaje("Cita eliminada correctamente");

      try {
        await actualizarListado();
      } catch {
        setErrorCarga(
          "La cita se elimino, pero no se pudo actualizar el listado"
        );
      }
    } catch (error) {
      mostrarAviso(
        id,
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la cita",
        "error"
      );
    } finally {
      setProcesando(false);
    }
  }

  if (!esPersonal) {
    return (
      <main className="contenedor-principal">
        <h1>Acceso restringido</h1>
        <p>No tienes permisos para acceder a esta vista</p>
      </main>
    );
  }

  return (
    <main className="contenedor-tabla">
      <section>
        <h1>Gestion de Citas</h1>

        <p>
          La recepcionista puede revisar las solicitudes,
          confirmarlas, proponer otro horario o cancelar citas
        </p>

        <button
          type="button"
          className="btn-secundario"
          disabled={cargando || procesando}
          onClick={() => {void refrescarListado();}}
        >
          Actualizar listado
        </button>

        {cargando && (
          <p role="status">
            Cargando citas
          </p>
        )}

        {errorCarga && (
          <p className="mensaje-formulario mensaje-error" role="alert">
            {errorCarga}
          </p>
        )}

        {mensaje && (
          <p className="mensaje-formulario mensaje-exito" role="status">
            {mensaje}
          </p>
        )}

        <div id="lista-recepcion-citas">
          {!cargando && !errorCarga && citas.length === 0 ? (
            <p>No existen solicitudes registradas</p>
          ) : (
            citas.map((cita) => {
              const nombreServicio = servicios.find(
                (item) => item.id === cita.servicio
              )?.nombre ?? cita.servicio;

              return (
                <article
                  className="cita-item"
                  key={cita.id}
                >
                  <h3>
                    {nombreServicio} - {cita.mascota}
                  </h3>

                  <p>
                    <strong>Dueño:</strong>{" "}
                    {cita.propietarioNombre} ({cita.propietario})
                  </p>

                  <p>
                    <strong>Profesional asignado:</strong>{" "}
                    {descripcionProfesional(cita.profesional)}
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
                        disabled={cargando || procesando || Boolean(errorCarga)}
                        onClick={() => {void eliminarCancelada(cita.id);}}
                      >
                        Eliminar cita
                      </button>
                    ) : cita.estado === "Atendida" ? (
                      <span>Asistencia registrada</span>
                    ) : cita.estado === "Confirmada" ? (
                      <>
                        {new Date(`${cita.fecha}T${cita.hora}:00`).getTime() <= Date.now() && (
                          <button
                            type="button"
                            className="btn-principal"
                            disabled={cargando || procesando || Boolean(errorCarga)}
                            onClick={() => {void registrarAsistencia(cita.id);}}
                          >
                            Registrar asistencia
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-warning"
                          disabled={cargando || procesando || Boolean(errorCarga)}
                          onClick={() => {void cancelar(cita.id);}}
                        >
                          Cancelar cita
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn-principal"
                          disabled={cargando || procesando || Boolean(errorCarga)}
                          onClick={() => {void confirmar(cita.id);}}
                        >
                          Confirmar
                        </button>

                        <button
                          type="button"
                          className="btn-secundario"
                          disabled={cargando || procesando || Boolean(errorCarga)}
                          onClick={() => abrirPropuesta(cita.id)}
                        >
                          Proponer otro horario
                        </button>

                        <button
                          type="button"
                          className="btn btn-warning"
                          disabled={cargando || procesando || Boolean(errorCarga)}
                          onClick={() => {void cancelar(cita.id);}}
                        >
                          Cancelar cita
                        </button>
                      </>
                    )}
                  </div>

                  {avisoCita?.id === cita.id && (
                    <p
                      ref={avisoRef}
                      className={`mensaje-formulario mensaje-${avisoCita.tipo}`}
                      role={avisoCita.tipo === "error" ? "alert" : "status"}
                    >
                      {avisoCita.texto}
                    </p>
                  )}

                  {idEditando === cita.id &&
                    cita.estado !== "Confirmada" &&
                    cita.estado !== "Cancelada" &&
                    cita.estado !== "Atendida" && (
                    <div className="formulario-propuesta">
                      {cita.profesional ? (
                        <>
                          {cargandoCatalogo && (
                            <p role="status">
                              Cargando turnos de los profesionales
                            </p>
                          )}

                          {errorCatalogo && (
                            <p className="mensaje-formulario mensaje-error" role="alert">
                              {errorCatalogo}
                            </p>
                          )}

                          {cargandoCompatibles && (
                            <p role="status">
                              Consultando profesionales compatibles
                            </p>
                          )}

                          {fechaPropuesta && cargandoHoras && (
                            <p role="status">
                              Consultando horarios disponibles
                            </p>
                          )}

                          {errorCompatibles && (
                            <p className="mensaje-formulario mensaje-error" role="alert">
                              {errorCompatibles}
                            </p>
                          )}

                          {fechaPropuesta && errorHoras && (
                            <p className="mensaje-formulario mensaje-error" role="alert">
                              {errorHoras}
                            </p>
                          )}

                          {fechaPropuesta && (
                            <button
                              type="button"
                              className="btn-secundario"
                              disabled={cargandoHoras || procesando}
                              onClick={() => {
                                setHoraPropuesta("");
                                setAvisoCita(null);
                                setRevision((actual) => actual + 1);
                              }}
                            >
                              Actualizar horarios
                            </button>
                          )}

                          <SelectorHorario
                            key={cita.id}
                            fechaSeleccionada={fechaPropuesta}
                            horaConfirmada={horaPropuesta}
                            horasDisponibles={obtenerHorasPropuesta(cita)}
                            onSeleccionarFecha={seleccionarFecha}
                            onConfirmarHora={confirmarHora}
                          />

                          <div className="acciones-cita acciones-propuesta">
                            <button
                              type="button"
                              className="btn-principal"
                              disabled={
                                !fechaPropuesta ||
                                !horaPropuesta ||
                                !disponibilidadLista ||
                                cargando ||
                                procesando ||
                                Boolean(errorCarga)
                              }
                              onClick={() => {void guardarPropuesta(cita.id);}}
                            >
                              {procesando
                                ? "Guardando propuesta"
                                : "Guardar propuesta"}
                            </button>

                            <button
                              type="button"
                              className="btn-secundario"
                              disabled={procesando}
                              onClick={cancelarPropuesta}
                            >
                              Cancelar
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p>
                            Esta cita no tiene un profesional asignado,
                            debes asignar uno antes de proponer otro horario
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
              );
            })
          )}
        </div>
      </section>

      <MensajesContacto sesion={sesion} />
    </main>
  );
}

export default Recepcion;