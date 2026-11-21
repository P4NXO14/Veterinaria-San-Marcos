import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import FormularioCita from "../componentes/organismos/FormularioCita";
import ListadoCitas from "../componentes/organismos/ListadoCitas";
import {obtenerCitasServidor} from "../datos/citasApi";
import {obtenerProfesionalesServidor,obtenerServiciosServidor} from "../datos/catalogoApi";
import type {CitaServidor} from "../datos/citasApi";
import type {Servicio} from "../datos/servicios";
import type {Profesional} from "../datos/profesionales";
import type {Sesion} from "../datos/usuarios";

interface ReservaProps {
  sesion: Sesion | null;
}

function Reserva({sesion}: ReservaProps) {
  const [citas,setCitas] = useState<CitaServidor[]>([]);
  const [servicios,setServicios] = useState<Servicio[]>([]);
  const [profesionales,setProfesionales] = useState<Profesional[]>([]);
  const [cargando,setCargando] = useState(false);
  const [error,setError] = useState("");
  const [errorCatalogo,setErrorCatalogo] = useState("");

  const correo = sesion?.rol === "cliente" ? sesion.correo : null;
  const citasPendientes = citas.filter((cita) => cita.estado !== "Atendida");
  const controlesRealizados = citas.filter((cita) => cita.estado === "Atendida");

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
      .catch((fallo: unknown) => {
        if (activo) {
          setError(
            fallo instanceof Error
              ? fallo.message
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
  },[correo]);

  useEffect(() => {
    if (!correo) {
      return;
    }

    let activo = true;

    Promise.all([
      obtenerServiciosServidor(),
      obtenerProfesionalesServidor()
    ])
      .then(([datosServicios,datosProfesionales]) => {
        if (activo) {
          setServicios(datosServicios);
          setProfesionales(datosProfesionales);
          setErrorCatalogo("");
        }
      })
      .catch((fallo: unknown) => {
        if (activo) {
          setErrorCatalogo(
            fallo instanceof Error
              ? fallo.message
              : "No se pudo consultar la informacion de Servicios y Profesionales"
          );
        }
      });

    return () => {
      activo = false;
    };
  },[correo]);

  async function actualizarCitas() {
    if (!correo) {
      return;
    }

    try {
      const datos = await obtenerCitasServidor(correo);
      setCitas(datos);
      setError("");
    } catch (fallo) {
      setError(
        fallo instanceof Error
          ? fallo.message
          : "No se pudieron actualizar las citas"
      );
    }
  }

  if (!sesion) {
    return (
      <main className="contenedor-principal">
        <h1>Mis Citas</h1>

        <p>
          Debes iniciar sesion para solicitar y consultar tus citas
        </p>

        <Link
          to="/login"
          onClick={() => {
            localStorage.setItem("destinoSanMarcos","/reserva");
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
          Esta seccion esta disponible solamente para dueños de mascotas
        </p>
      </main>
    );
  }

  return (
    <main className="contenedor-principal">
      <section>
        <h1>Solicitar Cita</h1>

        <p>
          El dueño de mascota crea una solicitud
          La recepcionista puede confirmarla o proponer otro horario
        </p>

        <FormularioCita
          sesion={sesion}
          onCitaCreada={actualizarCitas}
        />
      </section>

      <section className="seccion-separada">
        <h2>Estado de mis citas</h2>

        {cargando && (
          <p role="status">
            Cargando citas
          </p>
        )}

        {error && (
          <p className="mensaje-formulario mensaje-error" role="alert">
            {error}
          </p>
        )}

        {errorCatalogo && (
          <p className="mensaje-formulario mensaje-error" role="alert">
            {errorCatalogo}
          </p>
        )}

        {!cargando && !error && (
          <ListadoCitas
            citas={citasPendientes}
            servicios={servicios}
            profesionales={profesionales}
          />
        )}
      </section>

      <section className="seccion-separada">
        <h2>Historial de controles</h2>

        {cargando && (
          <p role="status">Cargando historial</p>
        )}

        {!cargando && !error && controlesRealizados.length === 0 && (
          <p>Aun no tienes controles registrados</p>
        )}

        {!cargando && !error && controlesRealizados.length > 0 && (
          <ListadoCitas
            citas={controlesRealizados}
            servicios={servicios}
            profesionales={profesionales}
          />
        )}
      </section>
    </main>
  );
}

export default Reserva;