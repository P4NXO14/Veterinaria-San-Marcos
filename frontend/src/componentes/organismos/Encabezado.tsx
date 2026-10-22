
import { useState } from "react";

import Logo from "../atomos/Logo";
import EnlaceNavegacion from "../atomos/EnlaceNavegacion";

import type { Sesion } from "../../datos/usuarios";

interface EncabezadoProps {
  sesion: Sesion | null;
  onCerrarSesion: () => void;
}

function Encabezado({
  sesion,
  onCerrarSesion
}: EncabezadoProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const esCliente = sesion?.rol === "cliente";

  const esPersonal =
    sesion?.rol === "recepcionista" ||
    sesion?.rol === "admin";

  const esAdministrador = sesion?.rol === "admin";

  const puedeVerCatalogos = !sesion || esCliente;

  function cerrarMenu() {
    setMenuAbierto(false);
  }

  function cerrarSesion() {
    cerrarMenu();
    onCerrarSesion();
  }

  return (
    <header
      className="d-flex flex-wrap justify-content-between align-items-center gap-3 p-3"
      style={{ backgroundColor: "#113150" }}
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
        onClick={cerrarMenu}
      >
        <EnlaceNavegacion destino="/" texto="Inicio" />

        <EnlaceNavegacion
          destino="/nosotros"
          texto="Nosotros"
        />

        {puedeVerCatalogos && (
          <>
            <EnlaceNavegacion
              destino="/servicios"
              texto="Servicios"
            />

            <EnlaceNavegacion
              destino="/farmacia"
              texto="Farmacia"
            />

            <EnlaceNavegacion
              destino="/contacto"
              texto="Contacto"
            />

            <EnlaceNavegacion
              destino="/reserva"
              texto="Mis Citas"
            />
          </>
        )}

        {esPersonal && (
          <>
            <EnlaceNavegacion
              destino="/recepcion"
              texto="Recepcion"
            />

            <EnlaceNavegacion
              destino="/inventario-farmacia"
              texto="Inventario"
            />
          </>
        )}

        {esAdministrador && (
          <EnlaceNavegacion
            destino="/admin"
            texto="Administracion"
          />
        )}

        {sesion ? (
          <>
            <span className="text-white">
              Hola, {sesion.nombre}
            </span>

            <button
              type="button"
              className="btn btn-outline-light"
              onClick={cerrarSesion}
            >
              Cerrar Sesion
            </button>
          </>
        ) : (
          <>
            <EnlaceNavegacion
              destino="/registro"
              texto="Registro"
            />

            <EnlaceNavegacion
              destino="/login"
              texto="Iniciar Sesion"
            />
          </>
        )}
      </nav>
    </header>
  );
}

export default Encabezado;