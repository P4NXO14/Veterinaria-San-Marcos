import {useEffect,useState} from "react";
import type {FormEvent} from "react";
import Input from "../atomos/Input";
import SelectorHorario from "./SelectorHorario";
import {obtenerCompatiblesServidor,obtenerProfesionalesServidor,obtenerServiciosServidor} from "../../datos/catalogoApi";
import {obtenerHorasDisponibles} from "../../datos/horarios";
import {crearCitaServidor,obtenerTodasCitasServidor} from "../../datos/citasApi";
import {obtenerEspeciesPermitidas,esEspecieCompatible} from "../../datos/compatibilidadEspecies";
import type {Servicio} from "../../datos/servicios";
import type {Profesional} from "../../datos/profesionales";
import type {CitaServidor} from "../../datos/citasApi";
import type {Cita} from "../../datos/citas";
import type {Sesion} from "../../datos/usuarios";

interface FormularioCitaProps {
  sesion: Sesion;
  onCitaCreada: () => Promise<void>;
}

function convertirCitas(citas: CitaServidor[]): Cita[] {
  return citas.map((cita) => ({
    ...cita,
    id: String(cita.id)
  }));
}

function FormularioCita({sesion,onCitaCreada}: FormularioCitaProps) {
  const [servicios,setServicios] = useState<Servicio[]>([]);
  const [profesionales,setProfesionales] = useState<Profesional[]>([]);
  const [compatibles,setCompatibles] = useState<string[]>([]);
  const [codigoCompatibilidad,setCodigoCompatibilidad] = useState("");

  const [servicio,setServicio] = useState(
    () => sessionStorage.getItem("servicioCitaSanMarcos") || ""
  );

  const [profesional,setProfesional] = useState("");
  const [mascota,setMascota] = useState("");
  const [especie,setEspecie] = useState("");
  const [motivo,setMotivo] = useState("");
  const [fecha,setFecha] = useState("");
  const [hora,setHora] = useState("");
  const [mensaje,setMensaje] = useState("");
  const [tipoMensaje,setTipoMensaje] = useState<"error" | "exito">("error");

  const [cargandoCatalogo,setCargandoCatalogo] = useState(true);
  const [errorCatalogo,setErrorCatalogo] = useState("");
  const [cargandoCompatibles,setCargandoCompatibles] = useState(false);
  const [errorCompatibles,setErrorCompatibles] = useState("");
  const [citasOcupadas,setCitasOcupadas] = useState<Cita[]>([]);
  const [cargandoHoras,setCargandoHoras] = useState(false);
  const [errorHoras,setErrorHoras] = useState("");
  const [consultaCompletada,setConsultaCompletada] = useState("");
  const [revision,setRevision] = useState(0);
  const [enviando,setEnviando] = useState(false);

  useEffect(() => {
    sessionStorage.removeItem("servicioCitaSanMarcos");
  },[]);

  useEffect(() => {
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
              : "No se pudieron cargar Servicios y Profesionales"
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
  },[]);

  useEffect(() => {
    if (!servicio) {
      setCompatibles([]);
      setCodigoCompatibilidad("");
      setErrorCompatibles("");
      setCargandoCompatibles(false);
      return;
    }

    let activo = true;

    setCompatibles([]);
    setCodigoCompatibilidad("");
    setErrorCompatibles("");
    setCargandoCompatibles(true);

    obtenerCompatiblesServidor(servicio)
      .then((datos) => {
        if (activo) {
          setCompatibles(datos);
          setCodigoCompatibilidad(servicio);
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
  },[servicio]);

  const catalogoListo =
    !cargandoCatalogo &&
    !errorCatalogo &&
    servicios.length > 0 &&
    profesionales.length > 0;

  const compatibilidadLista =
    !cargandoCompatibles &&
    !errorCompatibles &&
    codigoCompatibilidad === servicio;

  const claveConsulta = `${servicio}|${profesional}|${fecha}`;

  useEffect(() => {
    if (
      !catalogoListo ||
      !compatibilidadLista ||
      !servicio ||
      !profesional ||
      !fecha
    ) {
      return;
    }

    let activo = true;

    setCargandoHoras(true);
    setErrorHoras("");
    setConsultaCompletada("");

    obtenerTodasCitasServidor()
      .then((datos) => {
        if (activo) {
          setCitasOcupadas(convertirCitas(datos));
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
  },[claveConsulta,catalogoListo,compatibilidadLista,servicio,profesional,fecha,revision]);

  const servicioSeleccionado = servicios.find(
    (item) => item.id === servicio
  );

  const profesionalesPermitidos = profesionales.filter(
    (item) => compatibles.includes(item.id)
  );

  const especiesPermitidas = obtenerEspeciesPermitidas(servicio,servicios);

  const disponibilidadLista =
    catalogoListo &&
    compatibilidadLista &&
    !cargandoHoras &&
    !errorHoras &&
    consultaCompletada === claveConsulta;

  const catalogoHorarios = {
    servicios,
    profesionales,
    compatibles
  };

  const horasDisponibles =
    fecha && profesional && servicio && disponibilidadLista
      ? obtenerHorasDisponibles(
          fecha,
          profesional,
          servicio,
          citasOcupadas,
          catalogoHorarios
        )
      : [];

  function mostrarError(texto: string) {
    setMensaje(texto);
    setTipoMensaje("error");
  }

  function cambiarServicio(id: string) {
    setServicio(id);
    setProfesional("");
    setEspecie("");
    setFecha("");
    setHora("");
    setConsultaCompletada("");
    setMensaje("");
  }

  function cambiarProfesional(id: string) {
    setProfesional(id);
    setFecha("");
    setHora("");
    setConsultaCompletada("");
    setMensaje("");
  }

  function seleccionarFecha(nuevaFecha: string) {
    setFecha(nuevaFecha);
    setHora("");
    setConsultaCompletada("");
    setMensaje("");
  }

  function confirmarHora(nuevaHora: string) {
    setHora(nuevaHora);
    setMensaje("");
  }

  async function enviarSolicitud(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (enviando) {
      return;
    }

    if (sesion.rol !== "cliente") {
      mostrarError("Debes iniciar sesion como dueño de mascota");
      return;
    }

    if (!catalogoListo || !compatibilidadLista) {
      mostrarError("No se pudo comprobar el catalogo y los profesionales");
      return;
    }

    if (!servicioSeleccionado) {
      mostrarError("Selecciona un servicio veterinario");
      return;
    }

    if (servicio === "OT004") {
      mostrarError("La hospitalizacion requiere coordinacion directa con recepcion");
      return;
    }

    if (
      !profesional ||
      !profesionalesPermitidos.some((item) => item.id === profesional)
    ) {
      mostrarError("Selecciona un profesional disponible para el servicio");
      return;
    }

    if (!mascota.trim()) {
      mostrarError("Ingresa el nombre de la mascota");
      return;
    }

    if (!especie || !esEspecieCompatible(servicio,especie,servicios)) {
      mostrarError("Selecciona una especie compatible con el servicio");
      return;
    }

    if (!motivo.trim()) {
      mostrarError("Ingresa el motivo de la consulta");
      return;
    }

    if (!fecha || !hora) {
      mostrarError("Debes seleccionar una fecha y confirmar una hora");
      return;
    }

    if (!disponibilidadLista || !horasDisponibles.includes(hora)) {
      setHora("");
      mostrarError("La disponibilidad cambio, actualiza el calendario");
      return;
    }

    setEnviando(true);
    setMensaje("");

    try {
      const citasActuales = convertirCitas(
        await obtenerTodasCitasServidor()
      );

      setCitasOcupadas(citasActuales);

      const horasActuales = obtenerHorasDisponibles(
        fecha,
        profesional,
        servicio,
        citasActuales,
        catalogoHorarios
      );

      if (!horasActuales.includes(hora)) {
        setHora("");
        mostrarError("La hora seleccionada ya esta ocupada, elige otra hora");
        return;
      }

      await crearCitaServidor({
        propietario: sesion.correo,
        propietarioNombre: `${sesion.nombre} ${sesion.apellidos || ""}`.trim(),
        servicio,
        profesional,
        mascota: mascota.trim(),
        especie,
        motivo: motivo.trim(),
        fecha,
        hora
      });

      setServicio("");
      setProfesional("");
      setMascota("");
      setEspecie("");
      setMotivo("");
      setFecha("");
      setHora("");
      setConsultaCompletada("");
      setMensaje("Solicitud de cita enviada, queda pendiente de confirmacion por recepcion");
      setTipoMensaje("exito");

      try {
        await onCitaCreada();
      } catch {
        mostrarError("La cita se registro, pero no se pudo actualizar el listado");
      }
    } catch (error) {
      mostrarError(
        error instanceof Error
          ? error.message
          : "No se pudo registrar la cita"
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      id="formCita"
      className="formulario-vertical"
      onSubmit={enviarSolicitud}
      noValidate
    >
      {cargandoCatalogo && (
        <p role="status">
          Cargando servicios y profesionales
        </p>
      )}

      {errorCatalogo && (
        <p className="mensaje-formulario mensaje-error" role="alert">
          {errorCatalogo}
        </p>
      )}

      <label htmlFor="citaServicio">Servicio:</label>

      <select
        id="citaServicio"
        value={servicio}
        onChange={(evento) => cambiarServicio(evento.target.value)}
        disabled={!catalogoListo || enviando}
        required
      >
        <option value="">Seleccione un servicio</option>

        {servicios.map((item) => (
          <option key={item.id} value={item.id}>
            {item.nombre} - ${item.precio.toLocaleString("es-CL")}
          </option>
        ))}
      </select>

      {servicio === "OT004" && (
        <p className="mensaje-formulario">
          La hospitalizacion de 24 horas requiere coordinacion directa con recepcion y no permite reserva automatica
        </p>
      )}

      {servicio && cargandoCompatibles && (
        <p role="status">
          Consultando profesionales compatibles
        </p>
      )}

      {servicio && errorCompatibles && (
        <p className="mensaje-formulario mensaje-error" role="alert">
          {errorCompatibles}
        </p>
      )}

      <label htmlFor="citaProfesional">Profesional:</label>

      <select
        id="citaProfesional"
        value={profesional}
        onChange={(evento) => cambiarProfesional(evento.target.value)}
        disabled={!catalogoListo || !servicio || !compatibilidadLista || enviando}
        required
      >
        <option value="">Seleccione un profesional</option>

        {profesionalesPermitidos.map((item) => (
          <option key={item.id} value={item.id}>
            {item.nombre} - {item.especialidad}
          </option>
        ))}
      </select>

      <label htmlFor="citaMascota">Nombre de la mascota:</label>

      <Input
        id="citaMascota"
        type="text"
        value={mascota}
        onChange={(evento) => setMascota(evento.target.value)}
        maxLength={50}
        placeholder="Nombre de la mascota"
        required
      />

      <label htmlFor="citaEspecie">Especie:</label>

      <select
        id="citaEspecie"
        value={especie}
        onChange={(evento) => {
          setEspecie(evento.target.value);
          setMensaje("");
        }}
        disabled={!servicio || especiesPermitidas.length === 0 || enviando}
        required
      >
        <option value="">Seleccione una especie</option>

        {especiesPermitidas.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <label htmlFor="citaMotivo">Motivo:</label>

      <textarea
        id="citaMotivo"
        value={motivo}
        onChange={(evento) => setMotivo(evento.target.value)}
        maxLength={300}
        rows={4}
        placeholder="Describe brevemente el motivo de la consulta"
        required
      />

      {servicio && profesional && (
        <>
          {fecha && cargandoHoras && (
            <p role="status">
              Consultando horarios disponibles
            </p>
          )}

          {fecha && errorHoras && (
            <p className="mensaje-formulario mensaje-error" role="alert">
              {errorHoras}
            </p>
          )}

          {fecha && (
            <button
              type="button"
              className="btn-secundario"
              disabled={cargandoHoras || enviando}
              onClick={() => {
                setHora("");
                setRevision((actual) => actual + 1);
              }}
            >
              Actualizar horarios
            </button>
          )}

          <SelectorHorario
            key={`${servicio}-${profesional}`}
            fechaSeleccionada={fecha}
            horaConfirmada={hora}
            horasDisponibles={horasDisponibles}
            onSeleccionarFecha={seleccionarFecha}
            onConfirmarHora={confirmarHora}
          />
        </>
      )}

      <button
        type="submit"
        className="btn-principal"
        disabled={enviando || !catalogoListo || (Boolean(fecha) && !disponibilidadLista)}
      >
        {enviando ? "Enviando solicitud" : "Enviar solicitud"}
      </button>

      {mensaje && (
        <p
          className={`mensaje-formulario mensaje-${tipoMensaje}`}
          role={tipoMensaje === "error" ? "alert" : "status"}
        >
          {mensaje}
        </p>
      )}
    </form>
  );
}

export default FormularioCita;