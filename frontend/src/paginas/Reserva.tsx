import { useState } from "react";
import { Link } from "react-router-dom";

import FormularioCita from "../componentes/organismos/FormularioCita";
import ListadoCitas from "../componentes/organismos/ListadoCitas";

import { obtenerCitas } from "../datos/citas";
import type { Cita } from "../datos/citas";
import type { Sesion } from "../datos/usuarios";

interface ReservaProps {
  sesion: Sesion | null;
}

function Reserva({ sesion }: ReservaProps) {

  const [citas, setCitas] = useState<Cita[]>(() => obtenerCitas());

  function actualizarCitas() {
    setCitas(obtenerCitas());
  }

  if (!sesion) {
    return (
      <main className="contenedor-principal">
        <h1>Mis Citas</h1>

        <p>Debes iniciar sesion para solicitar y consultar tus citas.</p>

        <Link
          to="/login"
          onClick={() => {
            localStorage.setItem("destinoSanMarcos", "/reserva");
          }}
        >
          Iniciar Sesion
        </Link>
      </main>
    );
  }

  if (sesion.rol !== "cliente") {
    return (
      <main className="contenedor-principal">
        <h1>Acceso restringido</h1>

        <p>
          Esta seccion esta disponible solamente para dueños de mascotas.
        </p>
      </main>
    );
  }

  const misCitas = citas.filter(
    (cita) => cita.propietario === sesion.correo
  );

  return (
    <main className="contenedor-principal">

      <section>
        <h1>Solicitar Cita</h1>

        <p>
          El dueño de mascota crea una solicitud.
          La recepcionista puede confirmarla o proponer otro horario.
        </p>

        <FormularioCita
          sesion={sesion}
          onCitaCreada={actualizarCitas}
        />
      </section>

      <section className="seccion-separada">
        <h2>Estado de mis citas</h2>

        <ListadoCitas citas={misCitas} />
      </section>

    </main>
  );
}

export default Reserva;