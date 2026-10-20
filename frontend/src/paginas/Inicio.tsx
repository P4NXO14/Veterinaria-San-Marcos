import { Link, useNavigate } from "react-router-dom";
import { servicios } from "../datos/servicios";
import TarjetaServicio from "../componentes/moleculas/TarjetaServicio";

interface Sesion {
  rol: string;
}

function Inicio() {
  const navigate = useNavigate();

  function solicitarCita(id: string) {
    const sesionGuardada = localStorage.getItem("sesionSanMarcos");

    const sesion: Sesion | null = sesionGuardada
      ? JSON.parse(sesionGuardada)
      : null;

    if (!sesion) {
      const confirmar = window.confirm("Debes iniciar sesion antes de solicitar una cita. ¿Deseas ir a iniciar sesion?");

      if(confirmar){
        localStorage.setItem("destinoSanMarcos","/servicios");
      navigate("/login");      
    }
      return;
    }

    if (sesion.rol !== "cliente") {
      alert("Solo el dueño de mascota puede solicitar citas desde el catalogo.");
      return;
    }

    sessionStorage.setItem("servicioCitaSanMarcos", id);

    navigate("/reserva");
  }

  return (
    <main>
      <section className="hero">
        <h1>Veterinaria San Marcos</h1>

        <p>
          Clinica veterinaria ubicada en Rancagua,
          Region del Libertador General Bernardo O'Higgins.
        </p>

        <p>
          Atencion veterinaria para perros, gatos,
          conejos y aves.
        </p>
      </section>

      <section className="destacados">
        <h2>Servicios destacados</h2>

        <div id="contenedor-servicios">
          {servicios.slice(0, 6).map((servicio) => (
            <TarjetaServicio
              key={servicio.id}
              servicio={servicio}
              onSolicitarCita={solicitarCita}
            />
          ))}
        </div>

        <p className="texto-centrado">
          <Link className="enlace-destacado" to="/servicios">
            Ver catalogo completo
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Inicio;