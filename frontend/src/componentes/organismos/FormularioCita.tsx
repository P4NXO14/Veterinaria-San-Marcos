import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import Input from "../atomos/Input";
import SelectorHorario from "./SelectorHorario";
import { servicios } from "../../datos/servicios";
import { obtenerHorasDisponibles } from "../../datos/horarios";
import { crearCita } from "../../datos/citas";
import type { Sesion } from "../../datos/usuarios";

import {obtenerProfesionalesCompatibles} from "../../datos/compatibilidad";

import {obtenerEspeciesPermitidas,esEspecieCompatible} from "../../datos/compatibilidadEspecies";

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

  const profesionalesPermitidos =
    obtenerProfesionalesCompatibles(servicio);
    
  const especiesPermitidas =
    obtenerEspeciesPermitidas(servicio);

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
    setEspecie("");
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
      mostrarError("Debes iniciar sesion como dueño de mascota");
      return;
    }

    if (!servicioSeleccionado) {
      mostrarError("Selecciona un servicio veterinario");
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

    if (!especie) {
      mostrarError("Selecciona la especie de tu mascota");
      return;
    }

    if (!esEspecieCompatible(servicio, especie)) {
      mostrarError(
        "La especie de tu mascota no es compatible con el servicio seleccionado"
      );
      return;
    }

    if (!motivo.trim()) {
      mostrarError("Ingresa el motivo de la consulta");
      return;
    }

    if (!fecha) {
      mostrarError("Selecciona una fecha del calendario");
      return;
    }

    if (!hora) {
      mostrarError("Debes seleccionar y confirmar una hora");
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
        "La hora seleccionada ya no esta disponible. Selecciona otra"
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
      "Solicitud de cita enviada. Queda pendiente de confirmacion por recepcion"
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

      {servicio === "OT004" && (
        <p className="mensaje-formulario">
          La hospitalizacion de 24 horas requiere coordinacion directa con recepcion.
          No permite reserva automatica
        </p>
      )}

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
        onChange={(e) => {
          setEspecie(e.target.value);
          setMensaje("");
        }}
        disabled={!servicio || especiesPermitidas.length === 0}required>
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