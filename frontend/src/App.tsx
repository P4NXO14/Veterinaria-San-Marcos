
import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import type { Sesion } from "./datos/usuarios";

import Encabezado from "./componentes/organismos/Encabezado";

import Inicio from "./paginas/Inicio";
import Login from "./paginas/Login";
import Registro from "./paginas/Registro";
import Nosotros from "./paginas/Nosotros";
import Contacto from "./paginas/Contacto";

import Servicios from "./paginas/Servicios";
import DetalleServicio from "./paginas/DetalleServicio";

import Reserva from "./paginas/Reserva";
import Recepcion from "./paginas/Recepcion";
import Administracion from "./paginas/Administracion";

import Farmacia from "./paginas/Farmacia";
import InventarioFarmacia from "./paginas/InventarioFarmacia";

function App() {
  const navigate = useNavigate();

  const [sesion, setSesion] = useState<Sesion | null>(() => {
    const sesionGuardada = localStorage.getItem(
      "sesionSanMarcos"
    );

    if (!sesionGuardada) {
      return null;
    }

    try {
      return JSON.parse(sesionGuardada) as Sesion;
    } catch {
      return null;
    }
  });

  function cerrarSesion() {
    localStorage.removeItem("sesionSanMarcos");

    localStorage.removeItem("destinoSanMarcos");

    setSesion(null);

    navigate("/");
  }


  const puedeVerServicios =
    !sesion || sesion.rol === "cliente";


  const accesoRestringidoServicios = (
    <main className="contenedor-principal">
      <h1>Acceso restringido</h1>

      <p>
        Esta seccion esta disponible solamente para visitantes y clientes de la veterinaria
      </p>
    </main>
  );

  return (
    <>
      <Encabezado
        sesion={sesion}
        onCerrarSesion={cerrarSesion}
      />

      <Routes>

        <Route
          path="/"
          element={<Inicio sesion={sesion} />}
        />

        <Route
          path="/nosotros"
          element={<Nosotros />}
        />

        <Route
          path="/contacto"
          element={<Contacto sesion={sesion} />}
        />

        <Route
          path="/registro"
          element={<Registro />}
        />

        <Route
          path="/login"
          element={
            <Login onIniciarSesion={setSesion} />
          }
        />

        <Route
          path="/servicios"
          element={
            puedeVerServicios
              ? <Servicios sesion={sesion} />
              : accesoRestringidoServicios
          }
        />

        <Route
          path="/servicios/:id"
          element={
            puedeVerServicios
              ? <DetalleServicio sesion={sesion} />
              : accesoRestringidoServicios
          }
        />

        <Route
          path="/reserva"
          element={<Reserva sesion={sesion} />}
        />

        <Route
          path="/recepcion"
          element={<Recepcion sesion={sesion} />}
        />

        <Route
          path="/admin"
          element={<Administracion sesion={sesion} />}
        />

        <Route
          path="/farmacia"
          element={<Farmacia sesion={sesion} />}
        />

        <Route
          path="/inventario-farmacia"
          element={
            <InventarioFarmacia sesion={sesion} />
          }
        />

      </Routes>

      <footer className="text-center py-3">
        <p>Veterinaria San Marcos</p>
      </footer>
    </>
  );
}

export default App;