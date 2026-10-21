import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import Input from "../atomos/Input";
import SelectorHorario from "./SelectorHorario";
import { servicios } from "../../datos/servicios";
import { profesionales } from "../../datos/profesionales";
import { obtenerHorasDisponibles } from "../../datos/horarios";
import { crearCita } from "../../datos/citas";
import type { Sesion } from "../../datos/usuarios";

interface FormularioCitaProps {
  sesion: Sesion;
  onCitaCreada: () => void;
}

function FormularioCita({
  sesion,
  onCitaCreada
}: FormularioCitaProps) {

  const [servicio, setServicio] = useState(
    () => sessionStorage.getItem("servicioCitaSanMarcos") || ""
  );

  const [profesional, setProfesional] = useState("");
  const [mascota, setMascota] = useState("");
  const [especie, setEspecie] = useState("");
  const [motivo, setMotivo] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"error" | "exito">("error");

  useEffect(() => {
    sessionStorage.removeItem("servicioCitaSanMarcos");
  }, []);

  const servicioSeleccionado = servicios.find(
    (item) => item.id === servicio
  );

  const profesionalesPermitidos = profesionales.filter((item) => {
    if (!servicioSeleccionado) {
      return false;
    }

    if (item.tipo === "veterinario") {
      return true;
    }

    return (
      servicioSeleccionado.categoria === "Enfermeria" ||
      servicioSeleccionado.categoria === "Apoyo clinico"
    );
  });

  const horasDisponibles =
    fecha && profesional && servicio
      ? obtenerHorasDisponibles(fecha, profesional, servicio)
      : [];

  function mostrarError(texto: string) {
    setMensaje(texto);
    setTipoMensaje("error");
  }

  function cambiarServicio(id: string) {
    setServicio(id);
    setProfesional("");
    setFecha("");
    setHora("");
    setMensaje("");
  }

  function cambiarProfesional(id: string) {
    setProfesional(id);
    setFecha("");
    setHora("");
    setMensaje("");
  }

  function seleccionarFecha(nuevaFecha: string) {
    setFecha(nuevaFecha);
    setHora("");
    setMensaje("");
  }

  function confirmarHora(nuevaHora: string) {
    setHora(nuevaHora);
    setMensaje("");
  }

  function enviarSolicitud(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (sesion.rol !== "cliente") {
      mostrarError("Debes iniciar sesion como dueño de mascota.");
      return;
    }

    if (!servicioSeleccionado) {
      mostrarError("Selecciona un servicio veterinario.");
      return;
    }

    if (
      !profesional ||
      !profesionalesPermitidos.some((item) => item.id === profesional)
    ) {
      mostrarError("Selecciona un profesional disponible para el servicio.");
      return;
    }

    if (!mascota.trim()) {
      mostrarError("Ingresa el nombre de la mascota.");
      return;
    }

    if (!especie) {
      mostrarError("Selecciona la especie de tu mascota.");
      return;
    }

    if (!motivo.trim()) {
      mostrarError("Ingresa el motivo de la consulta.");
      return;
    }

    if (!fecha) {
      mostrarError("Selecciona una fecha del calendario.");
      return;
    }

    if (!hora) {
      mostrarError("Debes seleccionar y confirmar una hora.");
      return;
    }

    const disponibilidadActual = obtenerHorasDisponibles(
      fecha,
      profesional,
      servicio
    );

    if (!disponibilidadActual.includes(hora)) {
      setHora("");
      mostrarError(
        "La hora seleccionada ya no esta disponible. Selecciona otra."
      );
      return;
    }

    crearCita({
      id: "C" + Date.now(),
      propietario: sesion.correo,
      propietarioNombre:
        `${sesion.nombre} ${sesion.apellidos || ""}`.trim(),
      servicio: servicio,
      profesional: profesional,
      mascota: mascota.trim(),
      especie: especie,
      motivo: motivo.trim(),
      fecha: fecha,
      hora: hora,
      estado: "Pendiente",
      fechaPropuesta: "",
      horaPropuesta: ""
    });

    setServicio("");
    setProfesional("");
    setMascota("");
    setEspecie("");
    setMotivo("");
    setFecha("");
    setHora("");

    setMensaje(
      "Solicitud de cita enviada. Queda pendiente de confirmacion por recepcion."
    );
    setTipoMensaje("exito");

    onCitaCreada();
  }

  return (
    <form
      id="formCita"
      className="formulario-vertical"
      onSubmit={enviarSolicitud}
      noValidate
    >
      <label htmlFor="citaServicio">Servicio:</label>

      <select
        id="citaServicio"
        value={servicio}
        onChange={(e) => cambiarServicio(e.target.value)}
        required
      >
        <option value="">Seleccione un servicio</option>

        {servicios.map((item) => (
          <option key={item.id} value={item.id}>
            {item.nombre} - ${item.precio.toLocaleString("es-CL")}
          </option>
        ))}
      </select>

      <label htmlFor="citaProfesional">
        Profesional:
      </label>

      <select
        id="citaProfesional"
        value={profesional}
        onChange={(e) => cambiarProfesional(e.target.value)}
        disabled={!servicio}
        required
      >
        <option value="">Seleccione un profesional</option>

        {profesionalesPermitidos.map((item) => (
          <option key={item.id} value={item.id}>
            {item.nombre} - {item.especialidad}
          </option>
        ))}
      </select>

      <label htmlFor="citaMascota">
        Nombre de la mascota:
      </label>

      <Input
        id="citaMascota"
        type="text"
        value={mascota}
        onChange={(e) => setMascota(e.target.value)}
        maxLength={50}
        placeholder="Nombre de la mascota"
        required
      />

      <label htmlFor="citaEspecie">Especie:</label>

      <select
        id="citaEspecie"
        value={especie}
        onChange={(e) => setEspecie(e.target.value)}
        required
      >
        <option value="">Seleccione</option>
        <option value="Perro">Perro</option>
        <option value="Gato">Gato</option>
        <option value="Ave">Ave</option>
        <option value="Conejo">Conejo</option>
      </select>

      <label htmlFor="citaMotivo">Motivo:</label>

      <textarea
        id="citaMotivo"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        maxLength={300}
        rows={4}
        placeholder="Describe brevemente el motivo de la consulta"
        required
      />

      {servicio && profesional && (
        <SelectorHorario
          key={`${servicio}-${profesional}`}
          fechaSeleccionada={fecha}
          horaConfirmada={hora}
          horasDisponibles={horasDisponibles}
          onSeleccionarFecha={seleccionarFecha}
          onConfirmarHora={confirmarHora}
        />
      )}

      <button type="submit" className="btn-principal">
        Enviar solicitud
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