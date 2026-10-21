import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import CampoFormulario from "../moleculas/CampoFormulario";
import { validarRUT } from "../../datos/validacionesRut";
import { validarCorreoPorRol } from "../../datos/validacionesCorreo";
import { obtenerUsuarios, guardarUsuarios } from "../../datos/usuarios";
import type { Usuario } from "../../datos/usuarios";

function FormularioRegistro() {
  const navigate = useNavigate();

  const [rut, setRut] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"error" | "exito">("error");

  function mostrarError(texto: string) {
    setMensaje(texto);
    setTipoMensaje("error");
  }

      function registrarUsuario(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const rutLimpio = rut.trim();
    const nombreLimpio = nombre.trim();
    const apellidosLimpios = apellidos.trim();
    const correoLimpio = correo.trim().toLowerCase();
    const direccionLimpia = direccion.trim();

    if (!validarRUT(rutLimpio)) {
      mostrarError("Error: El RUN no es valido. Ingresalo sin puntos ni guion.");
      return;
    }

    if (nombreLimpio === "" || nombreLimpio.length > 50) {
      mostrarError("Error: El nombre es obligatorio y admite hasta 50 caracteres.");
      return;
    }

    if (apellidosLimpios === "" || apellidosLimpios.length > 100) {
      mostrarError("Error: Los apellidos son obligatorios y admiten hasta 100 caracteres.");
      return;
    }

    if (!validarCorreoPorRol(correoLimpio, "cliente")) {
      mostrarError("Error: Debes utilizar un correo @gmail.com o @hotmail.com valido.");
      return;
    }

    if (direccionLimpia === "" || direccionLimpia.length > 300) {
      mostrarError("Error: La direccion es obligatoria y admite hasta 300 caracteres.");
      return;
    }

    if (password.length < 4 || password.length > 10) {
      mostrarError("Error: La contraseña debe tener entre 4 y 10 caracteres.");
      return;
    }

    if (password !== confirmarPassword) {
      mostrarError("Error: Las contraseñas no coinciden.");
      return;
    }

    const usuarios = obtenerUsuarios();

    if (usuarios.some((usuario) =>
      usuario.rut.toUpperCase() === rutLimpio.toUpperCase()
    )) {
      mostrarError("Error: Ya existe un usuario registrado con ese RUN.");
      return;
    }

    if (usuarios.some((usuario) =>
      usuario.correo.toLowerCase() === correoLimpio
    )) {
      mostrarError("Error: Ya existe un usuario registrado con ese correo.");
      return;

    }

        const nuevoUsuario: Usuario = {
        rut: rutLimpio,
        nombre: nombreLimpio,
        apellidos: apellidosLimpios,
        correo: correoLimpio,
        direccion: direccionLimpia,
        password: password,
        rol: "cliente",
        activo: true
        };

        usuarios.push(nuevoUsuario);
        guardarUsuarios(usuarios);

        setMensaje("Usuario registrado correctamente. Ahora puedes iniciar sesion.");
        setTipoMensaje("exito");

        setRut("");
        setNombre("");
        setApellidos("");
        setCorreo("");
        setDireccion("");
        setPassword("");
        setConfirmarPassword("");

        window.setTimeout(() => {
        navigate("/login");
        }, 1200);
    }

        return (
        <form
        id="formRegistro"
        className="formulario-vertical"
        onSubmit={registrarUsuario}
        noValidate
        >
        <CampoFormulario
            id="rut"
            etiqueta="RUN (sin puntos ni guion):"
            tipo="text"
            valor={rut}
            onChange={setRut}
            maxLength={9}
            autoComplete="off"
            placeholder="Ejemplo: 123456785"
        />

        <CampoFormulario
            id="nombre"
            etiqueta="Nombre:"
            tipo="text"
            valor={nombre}
            onChange={setNombre}
            maxLength={50}
            autoComplete="given-name"
            placeholder="Ingresa tu nombre"
        />

        <CampoFormulario
            id="apellidos"
            etiqueta="Apellidos:"
            tipo="text"
            valor={apellidos}
            onChange={setApellidos}
            maxLength={100}
            autoComplete="family-name"
            placeholder="Ingresa tus apellidos"
        />

        <CampoFormulario
            id="correo"
            etiqueta="Correo electronico:"
            tipo="email"
            valor={correo}
            onChange={setCorreo}
            maxLength={100}
            autoComplete="email"
            placeholder="nombre@gmail.com"
        />

        <CampoFormulario
            id="direccion"
            etiqueta="Direccion:"
            tipo="text"
            valor={direccion}
            onChange={setDireccion}
            maxLength={300}
            autoComplete="street-address"
            placeholder="Ingresa tu direccion"
        />

        <CampoFormulario
            id="registroPass"
            etiqueta="Contraseña (4 a 10 caracteres):"
            tipo="password"
            valor={password}
            onChange={setPassword}
            minLength={4}
            maxLength={10}
            autoComplete="new-password"
        />

        <CampoFormulario
            id="registroPassConfirmar"
            etiqueta="Confirmar contraseña:"
            tipo="password"
            valor={confirmarPassword}
            onChange={setConfirmarPassword}
            minLength={4}
            maxLength={10}
            autoComplete="new-password"
        />

        <button type="submit" className="btn-principal">
            Registrarse
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

export default FormularioRegistro;