
import { Link, useNavigate, useParams } from "react-router-dom";

import { servicios } from "../datos/servicios";
import type { Sesion } from "../datos/usuarios";

interface DetalleServicioProps {
  sesion: Sesion | null;
}

function DetalleServicio({ sesion }: DetalleServicioProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const servicio = servicios.find(
    (item) => item.id === id
  );

  if (!servicio) {
    return (
      <main className="contenedor-principal">
        <h1>Servicio no encontrado</h1>

        <p>
          El servicio solicitado no existe en nuestro catalogo
        </p>

        <Link to="/servicios">
          Volver al catalogo
        </Link>
      </main>
    );
  }

  function solicitarCita() {
    if (!servicio) {
      return;
    }

    if (servicio.id === "OT004") {
      window.alert(
        "La hospitalizacion requiere coordinacion directa con la veterinaria"
      );
      return;
    }

    if (!sesion) {
      const continuar = window.confirm(
        "Debes iniciar sesion como cliente para solicitar una cita ¿Deseas continuar?"
      );

      if (!continuar) {
        return;
      }

      sessionStorage.setItem(
        "servicioCitaSanMarcos",
        servicio.id
      );

      localStorage.setItem(
        "destinoSanMarcos",
        "/reserva"
      );

      navigate("/login");
      return;
    }

    if (sesion.rol !== "cliente") {
      window.alert(
        "Solo los clientes pueden solicitar citas"
      );
      return;
    }

    sessionStorage.setItem(
      "servicioCitaSanMarcos",
      servicio.id
    );

    navigate("/reserva");
  }

  return (
    <main className="detalle-servicio-pagina">

      <Link
        to="/servicios"
        className="detalle-volver"
      >
        Volver a Servicios
      </Link>

      <article className="detalle-servicio-contenido">

        <div className="detalle-servicio-imagen">
          <img
            src={servicio.imagen}
            alt={servicio.nombre}
          />
        </div>

        <div className="detalle-servicio-informacion">

          <span className="detalle-servicio-categoria">
            {servicio.categoria}
          </span>

          <h1>{servicio.nombre}</h1>

          <p>
            <strong>Codigo:</strong> {servicio.id}
          </p>

          <p>
            <strong>Especie:</strong> {servicio.especie}
          </p>

          <p>
            <strong>Duracion:</strong> {servicio.duracion}
          </p>

          <p>
            <strong>Observaciones:</strong> {servicio.obs}
          </p>

          <p className="detalle-servicio-precio">
            ${servicio.precio.toLocaleString("es-CL")}
          </p>

          <button
            type="button"
            className="btn-principal"
            onClick={solicitarCita}
          >
            Solicitar Cita
          </button>

        </div>

      </article>

    </main>
  );
}

export default DetalleServicio;