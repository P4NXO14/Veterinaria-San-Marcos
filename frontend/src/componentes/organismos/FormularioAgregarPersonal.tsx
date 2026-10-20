
import { useState } from "react";
import type { FormEvent } from "react";

import CampoFormulario from "../moleculas/CampoFormulario";
import { validarRUT } from "../../datos/validacionesRut";
import { validarCorreoPorRol } from "../../datos/validacionesCorreo";
import { obtenerUsuarios } from "../../datos/usuarios";
import type { DatosNuevoPersonal } from "../../datos/usuarios";

interface FormularioAgregarPersonalProps {
  onGuardar: (datos: DatosNuevoPersonal) => void;
  onCancelar: () => void;
}

function FormularioAgregarPersonal({
  onGuardar,
  onCancelar
}: FormularioAgregarPersonalProps) {

  const [rut, setRut] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  function guardarPersonal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const rutLimpio = rut.trim().toUpperCase();
    const nombreLimpio = nombre.trim();
    const apellidosLimpios = apellidos.trim();
    const correoLimpio = correo.trim().toLowerCase();
    const direccionLimpia = direccion.trim();

    if (!validarRUT(rutLimpio)) {
      setMensaje("Ingresa un RUN valido sin puntos ni guion.");
      return;
    }

    const usuarioExistente = obtenerUsuarios().find(
      (usuario) => usuario.rut.trim().toUpperCase() === rutLimpio
    );

    if (usuarioExistente) {
      const tipoCuenta =
        usuarioExistente.rol === "cliente"
          ? "cliente"
          : usuarioExistente.rol === "recepcionista"
            ? "personal"
            : "administrador";

      setMensaje(
        `Error: Este RUN ya esta registrado en una cuenta de ${tipoCuenta}.`
      );
      return;
    }

    if (!nombreLimpio || nombreLimpio.length > 50) {
      setMensaje("Ingresa un nombre valido de hasta 50 caracteres.");
      return;
    }

    if (!apellidosLimpios || apellidosLimpios.length > 100) {
      setMensaje("Ingresa apellidos validos de hasta 100 caracteres.");
      return;
    }

    if (!validarCorreoPorRol(correoLimpio, "recepcionista")) {
      setMensaje(
        "El correo debe ser @sanmarcos.com y no puede ser el del administrador."
      );
      return;
    }

    if (!direccionLimpia || direccionLimpia.length > 300) {
      setMensaje("Ingresa una direccion valida de hasta 300 caracteres.");
      return;
    }

    if (password.length < 4 || password.length > 10) {
      setMensaje("La contraseña debe tener entre 4 y 10 caracteres.");
      return;
    }

    if (password !== confirmarPassword) {
      setMensaje("Las contraseñas no coinciden.");
      return;
    }

    setMensaje("");

    onGuardar({
      rut: rutLimpio,
      nombre: nombreLimpio,
      apellidos: apellidosLimpios,
      correo: correoLimpio,
      direccion: direccionLimpia,
      password
    });
  }

  return (
    <section className="contenedor-formulario">
      <h2>Agregar Personal</h2>

      <p>
        Registra una nueva cuenta para el personal de la veterinaria.
      </p>

      <form
        className="formulario-vertical"
        onSubmit={guardarPersonal}
        noValidate
      >
        <CampoFormulario
          id="personalRut"
          etiqueta="RUN (sin puntos ni guion):"
          tipo="text"
          valor={rut}
          onChange={setRut}
          maxLength={9}
          placeholder="123456785"
        />

        <CampoFormulario
          id="personalNombre"
          etiqueta="Nombre:"
          tipo="text"
          valor={nombre}
          onChange={setNombre}
          maxLength={50}
        />

        <CampoFormulario
          id="personalApellidos"
          etiqueta="Apellidos:"
          tipo="text"
          valor={apellidos}
          onChange={setApellidos}
          maxLength={100}
        />

        <CampoFormulario
          id="personalCorreo"
          etiqueta="Correo electronico:"
          tipo="email"
          valor={correo}
          onChange={setCorreo}
          maxLength={100}
          placeholder="nombre@sanmarcos.com"
        />

        <CampoFormulario
          id="personalDireccion"
          etiqueta="Direccion:"
          tipo="text"
          valor={direccion}
          onChange={setDireccion}
          maxLength={300}
        />

        <CampoFormulario
          id="personalPassword"
          etiqueta="Contraseña (4 a 10 caracteres):"
          tipo="password"
          valor={password}
          onChange={setPassword}
          minLength={4}
          maxLength={10}
          autoComplete="new-password"
        />

        <CampoFormulario
          id="personalConfirmarPassword"
          etiqueta="Confirmar contraseña:"
          tipo="password"
          valor={confirmarPassword}
          onChange={setConfirmarPassword}
          minLength={4}
          maxLength={10}
          autoComplete="new-password"
        />

        {mensaje && (
          <p className="mensaje-error" role="alert">
            {mensaje}
          </p>
        )}

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">
            Guardar personal
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancelar}
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}

export default FormularioAgregarPersonal;