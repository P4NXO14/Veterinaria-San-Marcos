import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import FormularioCita from "../componentes/organismos/FormularioCita";
import ListadoCitas from "../componentes/organismos/ListadoCitas";
import {obtenerCitasServidor} from "../datos/citasApi";
import type {CitaServidor} from "../datos/citasApi";
import type {Sesion} from "../datos/usuarios";

interface ReservaProps {
  sesion: Sesion | null;
}

function Reserva({sesion}: ReservaProps) {
  const [citas,setCitas] = useState<CitaServidor[]>([]);
  const [cargando,setCargando] = useState(false);
  const [error,setError] = useState("");

  const correo = sesion?.rol === "cliente" ? sesion.correo : null;

  useEffect(() => {
    let activo = true;

    if (!correo) {
      setCitas([]);
      setError("");
      setCargando(false);
      return;
    }

    setCargando(true);
    setError("");
    setCitas([]);

    obtenerCitasServidor(correo)
      .then((datos) => {
        if (activo) {
          setCitas(datos);
        }
      })
      .catch((error: unknown) => {
        if (activo) {
          setError(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar las citas"
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
  }, [correo]);

  async function actualizarCitas() {
    if (!correo) {
      return;
    }

    try {
      const datos = await obtenerCitasServidor(correo);
      setCitas(datos);
      setError("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron actualizar las citas"
      );
    }
  }

  if (!sesion) {
    return (
      <main className="contenedor-principal">
        <h1>Mis Citas</h1>

        <p>
          Debes iniciar sesion para solicitar y consultar tus citas.
        </p>

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

        {cargando && (
          <p role="status">Cargando citas...</p>
        )}

        {error && (
          <p
            className="mensaje-formulario mensaje-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {!cargando && !error && (
          <ListadoCitas citas={citas} />
        )}
      </section>
    </main>
  );
}

export default Reserva;