
import { Link, useNavigate } from "react-router-dom";

import { servicios } from "../datos/servicios";
import TarjetaServicio from "../componentes/moleculas/TarjetaServicio";

import type { Sesion } from "../datos/usuarios";

interface InicioProps {
  sesion: Sesion | null;
}

function Inicio({ sesion }: InicioProps) {
  const navigate = useNavigate();

  function solicitarCita(id: string) {
    if (!sesion) {
      const confirmar = window.confirm(
        "Debes iniciar sesion o registrarte para solicitar una cita ¿Deseas iniciar sesion?"
      );

      if (confirmar) {
        sessionStorage.setItem(
          "servicioCitaSanMarcos",
          id
        );

        localStorage.setItem(
          "destinoSanMarcos",
          "/reserva"
        );

        navigate("/login");
      }

      return;
    }

    if (sesion.rol !== "cliente") {
      window.alert(
        "Solo los clientes pueden solicitar citas veterinarias"
      );
      return;
    }

    sessionStorage.setItem(
      "servicioCitaSanMarcos",
      id
    );

    navigate("/reserva");
  }

  const puedeVerCatalogo =
    !sesion || sesion.rol === "cliente";

  return (
    <main>
      <section className="hero">
        <h1>Veterinaria San Marcos</h1>

        <p>
          Clinica veterinaria ubicada en Rancagua,
          Region del Libertador General Bernardo O'Higgins
        </p>

        <p>
          Atencion veterinaria para perros, gatos, conejos y aves
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

        {puedeVerCatalogo && (
          <p className="texto-centrado">
            <Link
              className="enlace-destacado"
              to="/servicios"
            >
              Ver catalogo completo
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}

export default Inicio;