import { Link } from "react-router-dom";
import { servicios } from "../datos/servicios";
import TarjetaServicio from "../componentes/moleculas/TarjetaServicio";

function Inicio() {
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