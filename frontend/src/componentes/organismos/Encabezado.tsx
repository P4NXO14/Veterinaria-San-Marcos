import {useState} from "react";
import Logo from "../atomos/logo";
import EnlaceNavegacion from "../atomos/EnlaceNavegacion";
import {enlacesNavegacion} from "../../datos/navegacion";
import type {Sesion} from "../../datos/usuarios";

interface EncabezadoProps {
  sesion: Sesion | null;
  onCerrarSesion: () => void;
}

function Encabezado({sesion,onCerrarSesion}: EncabezadoProps) {
  const [menuAbierto,setMenuAbierto] = useState(false);

  const rolActual = sesion?.rol ?? "visitante";

  const enlacesVisibles = enlacesNavegacion.filter((enlace) =>
    enlace.roles.some((rol) => rol === rolActual)
  );

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
      style={{backgroundColor: "#113150"}}
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
        className={`${menuAbierto ? "d-flex" : "d-none"} d-lg-flex flex-column flex-lg-row gap-3`}
        aria-label="Navegacion principal"
        onClick={cerrarMenu}
      >
        {enlacesVisibles.map((enlace) => (
          <EnlaceNavegacion
            key={enlace.texto}
            destino={enlace.destino}
            texto={enlace.texto}
          />
        ))}

        {sesion && (
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
        )}
      </nav>
    </header>
  );
}

export default Encabezado;