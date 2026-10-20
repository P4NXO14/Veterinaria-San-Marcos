import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import Input from "../atomos/Input";
import { servicios } from "../../datos/servicios";
import { crearCita } from "../../datos/citas";
import type { Sesion } from "../../datos/usuarios";

interface FormularioCitaProps {
  sesion: Sesion;
  onCitaCreada: () => void;
}

function obtenerFechaActual(): string {
  const hoy = new Date();

  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${año}-${mes}-${dia}`;
}

function FormularioCita({
  sesion,
  onCitaCreada
}: FormularioCitaProps) {

  const [servicio, setServicio] = useState(
    () => sessionStorage.getItem("servicioCitaSanMarcos") || ""
  );

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

  function mostrarError(texto: string) {
    setMensaje(texto);
    setTipoMensaje("error");
  }

  function enviarSolicitud(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (sesion.rol !== "cliente") {
      mostrarError("Debes iniciar sesion como dueño de mascota.");
      return;
    }

    if (!servicio || !servicios.some((s) => s.id === servicio)) {
      mostrarError("Selecciona un servicio veterinario.");
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

    if (!fecha || fecha < obtenerFechaActual()) {
      mostrarError("Selecciona una fecha valida.");
      return;
    }

    if (!hora) {
      mostrarError("Selecciona una hora.");
      return;
    }

    crearCita({
      id: "C" + Date.now(),
      propietario: sesion.correo,
      propietarioNombre:
        `${sesion.nombre} ${sesion.apellidos || ""}`.trim(),
      servicio: servicio,
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
        onChange={(e) => setServicio(e.target.value)}
        required
      >
        <option value="">Seleccione un servicio</option>

        {servicios.map((item) => (
          <option key={item.id} value={item.id}>
            {item.nombre} - ${item.precio.toLocaleString("es-CL")}
          </option>
        ))}
      </select>

      <label htmlFor="citaMascota">Nombre de la mascota:</label>

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

      <label htmlFor="citaFecha">Fecha solicitada:</label>

      <Input
        id="citaFecha"
        type="date"
        value={fecha}
        min={obtenerFechaActual()}
        onChange={(e) => setFecha(e.target.value)}
        required
      />

      <label htmlFor="citaHora">Hora solicitada:</label>

      <Input
        id="citaHora"
        type="time"
        value={hora}
        onChange={(e) => setHora(e.target.value)}
        required
      />

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