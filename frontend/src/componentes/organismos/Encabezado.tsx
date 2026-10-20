import { useState } from "react";
import Logo from "../atomos/Logo";
import EnlaceNavegacion from "../atomos/EnlaceNavegacion";

function Encabezado() {
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
        aria-label="Abrir menú"
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
        aria-label="Navegación principal"
      >
        <EnlaceNavegacion destino="/" texto="Inicio" />
        <EnlaceNavegacion destino="/nosotros" texto="Nosotros" />
        <EnlaceNavegacion destino="/servicios" texto="Servicios" />
        <EnlaceNavegacion destino="/contacto" texto="Contacto" />
        <EnlaceNavegacion destino="/reserva" texto="Mis Citas" />
        <EnlaceNavegacion destino="/registro" texto="Registro" />
        <EnlaceNavegacion destino="/login" texto="Iniciar Sesion" />
      </nav>
    </header>
  );
}

export default Encabezado;