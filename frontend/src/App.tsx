import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import type { Sesion } from "./datos/usuarios";
import Encabezado from "./componentes/organismos/Encabezado";
import Inicio from "./paginas/Inicio";
import Login from "./paginas/Login";
import Registro from "./paginas/Registro";
import Reserva from "./paginas/Reserva";
import Recepcion from "./paginas/Recepcion";
import Administracion from "./paginas/Administracion";
import Nosotros from "./paginas/Nosotros";
import Contacto from "./paginas/Contacto";
import Farmacia from "./paginas/Farmacia";
import InventarioFarmacia from "./paginas/InventarioFarmacia";

interface VistaPendienteProps {
  titulo: string;
}

function VistaPendiente({ titulo }: VistaPendienteProps) {
  return (
    <main className="container py-5">
      <h1>{titulo}</h1>
      <p>Esta pagina se encuentra pendiente de migracion a React.</p>
    </main>
  );
}

function App() {
  const navigate = useNavigate();

  const [sesion, setSesion] = useState<Sesion | null>(() => {
    const sesionGuardada = localStorage.getItem("sesionSanMarcos");

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
    setSesion(null);
    navigate("/");
  }

  return (

    <>
      <Encabezado
        sesion={sesion}
        onCerrarSesion={cerrarSesion}
      />

      <Routes>
        
        <Route path="/" element={<Inicio />} 
        />
      
        <Route path="/nosotros" element={<Nosotros />} 
        />

        <Route
          path="/servicios"
          element={<VistaPendiente titulo="Servicios" />}
        />

        <Route
          path="/contacto"
          element={<Contacto sesion={sesion} />}
        />

        <Route
        path="/reserva"
        element={<Reserva sesion={sesion} />}
        />

        <Route path="/registro" element={<Registro />} 
        />

        <Route
          path="/login"
          element={<Login onIniciarSesion={setSesion} />}
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
          element={<InventarioFarmacia sesion={sesion} />}
        />

      </Routes>

      <footer className="text-center py-3">
        <p>Veterinaria San Marcos</p>
      </footer>
    </>
  );
}

export default App;