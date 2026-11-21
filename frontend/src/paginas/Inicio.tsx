import {useEffect,useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import TarjetaServicio from "../componentes/moleculas/TarjetaServicio";
import {obtenerServiciosDestacadosServidor} from "../datos/catalogoApi";
import type {Servicio} from "../datos/servicios";
import type {Sesion} from "../datos/usuarios";

interface InicioProps {
  sesion: Sesion | null;
}

function Inicio({sesion}: InicioProps) {
  const navigate = useNavigate();

  const [servicios,setServicios] = useState<Servicio[]>([]);
  const [cargando,setCargando] = useState(true);
  const [error,setError] = useState("");

  useEffect(() => {
    let activo = true;

    obtenerServiciosDestacadosServidor()
      .then((datos) => {
        if (activo) {
          setServicios(datos);
          setError("");
        }
      })
      .catch((fallo: unknown) => {
        if (activo) {
          setError(
            fallo instanceof Error
              ? fallo.message
              : "No se pudieron cargar los servicios destacados"
          );
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  },[]);

  function solicitarCita(id: string) {
    if (!sesion) {
      const confirmar = window.confirm(
        "Debes iniciar sesion o registrarte para solicitar una cita ¿Deseas iniciar sesion?"
      );

      if (confirmar) {
        sessionStorage.setItem("servicioCitaSanMarcos",id);
        localStorage.setItem("destinoSanMarcos","/reserva");
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

    sessionStorage.setItem("servicioCitaSanMarcos",id);
    navigate("/reserva");
  }

  const puedeVerCatalogo =
    !sesion || sesion.rol === "cliente";

  return (
    <main>
      <section className="hero">
        <h1>Veterinaria San Marcos</h1>

        <img
          src="/img/pagina_inicio.jpg"
          alt="Grupo de perros"
          className="hero-imagen"
        />

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

        {cargando && (
          <p role="status">
            Cargando servicios destacados
          </p>
        )}

        {error && (
          <p role="alert">
            {error}
          </p>
        )}

        {!cargando && !error && (
          <div id="contenedor-servicios">
            {servicios.map((servicio) => (
              <TarjetaServicio
                key={servicio.id}
                servicio={servicio}
                onSolicitarCita={solicitarCita}
              />
            ))}
          </div>
        )}

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