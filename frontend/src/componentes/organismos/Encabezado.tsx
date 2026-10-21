import { useState } from "react";
import Logo from "../atomos/Logo";
import EnlaceNavegacion from "../atomos/EnlaceNavegacion";
import type { Sesion } from "../../datos/usuarios";

interface EncabezadoProps {
  sesion: Sesion | null;
  onCerrarSesion: () => void;
}

function Encabezado({sesion,onCerrarSesion}: EncabezadoProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header
      className="d-flex flex-wrap justify-content-between align-items-center gap-3 p-3"
      style={{ backgroundColor: "#2c3e50" }}
    >
      <Logo />

      <button
        type="button"
        className="btn btn-outline-light d-lg-none"
        aria-label="Abrir menu"
        aria-controls="menu-principal"
        aria-expanded={menuAbierto}
        onClick={() => setMenuAbierto(!menuAbierto)}
      >
        Menu
      </button>

      <nav
        id="menu-principal"
        className={`${
          menuAbierto ? "d-flex" : "d-none"
        } d-lg-flex flex-column flex-lg-row gap-3`}
        aria-label="Navegacion principal"
      >
        <EnlaceNavegacion destino="/" texto="Inicio" />
        <EnlaceNavegacion destino="/nosotros" texto="Nosotros" />
        <EnlaceNavegacion destino="/servicios" texto="Servicios" />

        {(!sesion || sesion.rol === "cliente") && (
          <EnlaceNavegacion destino="/contacto" texto="Contacto"
          />
        )}

        {(!sesion || sesion.rol === "cliente") && (
          <EnlaceNavegacion destino="/reserva" texto="Mis Citas" />
        )}
        
        {sesion ? (
    <>

        {(sesion.rol === "recepcionista" || sesion.rol === "admin") && (
          <EnlaceNavegacion
            destino="/recepcion"
            texto="Recepcion"
          />
        )}

        {sesion.rol === "admin" && (
          <EnlaceNavegacion
            destino="/admin"
            texto="Administracion"
          />
        )}

        <span className="text-white">
        Hola, {sesion.nombre}
        </span>

        <button
        type="button"
        className="btn btn-outline-light"
        onClick={onCerrarSesion}
        >
        Cerrar Sesion
        </button>
    </>
        ) : (
        <>
            <EnlaceNavegacion destino="/registro" texto="Registro" />
            <EnlaceNavegacion destino="/login" texto="Iniciar Sesion" />
        </>
        )}


      </nav>
    </header>
  );
}

export default Encabezado;