import { useState } from "react";
import type { FormEvent } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import CampoFormulario from "../moleculas/CampoFormulario";
import { obtenerUsuarios } from "../../datos/usuarios";
import type { Sesion } from "../../datos/usuarios";

interface FormularioLoginProps {
  onIniciarSesion: (sesion: Sesion) => void;
}

interface EstadoNavegacion {
  destino?: string;
}

function FormularioLogin({
  onIniciarSesion
}: FormularioLoginProps) {

  const navigate = useNavigate();
  const location = useLocation();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("error");

  function mostrarError(texto: string) {
    setMensaje(texto);
    setTipoMensaje("error");
  }

  function iniciarSesion(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const correoNormalizado = correo.trim().toLowerCase();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoNormalizado) ||
      correoNormalizado.length > 100
    ) {
      mostrarError(
        "Error: Ingresa un correo valido de hasta 100 caracteres"
      );
      return;
    }

    if (password.length < 4 || password.length > 10) {
      mostrarError(
        "Error: La contraseña debe tener entre 4 y 10 caracteres"
      );
      return;
    }

    const usuarios = obtenerUsuarios();

    const usuario = usuarios.find(
      (item) =>
        item.correo === correoNormalizado &&
        item.password === password
    );

    if (!usuario) {
      mostrarError(
        "Error: Correo o contraseña incorrectos Debes registrarte antes de iniciar sesion"
      );
      return;
    }

    if (usuario.activo === false) {
      mostrarError(
        "Error: Esta cuenta se encuentra desactivada"
      );
      return;
    }

    const sesion: Sesion = {
      rut: usuario.rut,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      rol: usuario.rol
    };

    localStorage.setItem(
      "sesionSanMarcos",
      JSON.stringify(sesion)
    );

    onIniciarSesion(sesion);

    setMensaje(
      `Bienvenido ${usuario.nombre}. Inicio de sesion correcto`
    );

    setTipoMensaje("exito");

    const estadoNavegacion = location.state as
      | EstadoNavegacion
      | null;

    const destinoDesdeNavegacion =
      estadoNavegacion?.destino;


    const destinoGuardado = localStorage.getItem(
      "destinoSanMarcos"
    );

    localStorage.removeItem("destinoSanMarcos");

    let destino = "/";

    if (sesion.rol === "cliente") {

      if (destinoDesdeNavegacion === "/contacto") {
        destino = "/contacto";

      } else if (
        destinoGuardado === "/reserva" ||
        destinoGuardado === "/farmacia"
      ) {
        destino = destinoGuardado;
      }

    }

    window.setTimeout(() => {
      navigate(destino, { replace: true });
    }, 800);
  }

  return (
    <form
      id="formLogin"
      className="formulario-vertical"
      onSubmit={iniciarSesion}
      noValidate
    >

      <CampoFormulario
        id="loginCorreo"
        etiqueta="Correo electronico:"
        tipo="email"
        valor={correo}
        onChange={setCorreo}
        maxLength={100}
        autoComplete="email"
        placeholder="nombre@correo.cl"
      />

      <CampoFormulario
        id="loginPass"
        etiqueta="Contraseña:"
        tipo="password"
        valor={password}
        onChange={setPassword}
        minLength={4}
        maxLength={10}
        autoComplete="current-password"
      />

      <button
        type="submit"
        className="btn-principal"
      >
        Ingresar
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

export default FormularioLogin;