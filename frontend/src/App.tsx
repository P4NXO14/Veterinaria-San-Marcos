import { Routes, Route } from "react-router-dom";
import Encabezado from "./componentes/organismos/Encabezado";
import Inicio from "./paginas/Inicio";

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
  return (
    <>
      <Encabezado />

      <Routes>
        
        <Route path="/" element={<Inicio />} />
      
        <Route
          path="/nosotros"
          element={<VistaPendiente titulo="Nosotros" />}
        />

        <Route
          path="/servicios"
          element={<VistaPendiente titulo="Servicios" />}
        />

        <Route
          path="/contacto"
          element={<VistaPendiente titulo="Contacto" />}
        />

        <Route
          path="/reserva"
          element={<VistaPendiente titulo="Mis Citas" />}
        />

        <Route
          path="/registro"
          element={<VistaPendiente titulo="Registro" />}
        />

        <Route
          path="/login"
          element={<VistaPendiente titulo="Iniciar Sesion" />}
        />
      </Routes>

      <footer className="text-center py-3">
        <p>Veterinaria San Marcos</p>
      </footer>
    </>
  );
}

export default App;