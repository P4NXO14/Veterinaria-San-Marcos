import {useEffect,useState} from "react";
import type {FormEvent} from "react";
import {Link} from "react-router-dom";
import FormularioCita from "../componentes/organismos/FormularioCita";
import ListadoCitas from "../componentes/organismos/ListadoCitas";
import {guardarCredencialesReservas,limpiarCredencialesReservas,obtenerCitasServidor} from "../datos/citasApi";
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
  const [clave,setClave] = useState("");
  const [autorizado,setAutorizado] = useState(false);
  const [verificando,setVerificando] = useState(false);
  const [cargando,setCargando] = useState(false);
  const [errorAcceso,setErrorAcceso] = useState("");
  const [error,setError] = useState("");
  const [errorCatalogo,setErrorCatalogo] = useState("");

  const correo = sesion?.rol === "cliente" ? sesion.correo : null;
  const citasPendientes = citas.filter((cita) => cita.estado !== "Atendida");
  const controlesRealizados = citas.filter((cita) => cita.estado === "Atendida");

  useEffect(() => {
    limpiarCredencialesReservas();

    return () => {
      limpiarCredencialesReservas();
    };
  },[]);

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

  async function ingresarMisCitas(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!correo || verificando) {
      return;
    }

    if (!clave.trim()) {
      setErrorAcceso("Debes ingresar tu contraseña para consultar tus citas");
      return;
    }

    setVerificando(true);
    setErrorAcceso("");
    guardarCredencialesReservas(correo,clave);

    try {
      const datos = await obtenerCitasServidor(correo);
      setCitas(datos);
      setAutorizado(true);
      setError("");
      setClave("");
    } catch (fallo) {
      limpiarCredencialesReservas();
      setAutorizado(false);
      setCitas([]);
      setErrorAcceso(
        fallo instanceof Error
          ? fallo.message
          : "No se pudo verificar tu contraseña"
      );
    } finally {
      setVerificando(false);
    }
  }

  async function actualizarCitas() {
    if (!correo || !autorizado) {
      return;
    }

    setCargando(true);

    try {
      const datos = await obtenerCitasServidor(correo);
      setCitas(datos);
      setError("");
    } catch (fallo) {
      const mensaje = fallo instanceof Error
        ? fallo.message
        : "No se pudieron actualizar las citas";

      if (mensaje.includes("vuelve a autorizar Reservas")) {
        setAutorizado(false);
        setCitas([]);
        setErrorAcceso(mensaje);
      } else {
        setError(mensaje);
      }
    } finally {
      setCargando(false);
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

        {!autorizado && (
          <p>
            Para enviar una solicitud, ingresa primero tu contraseña en
            <a href="#acceso-mis-citas"> Estado de mis citas</a>
          </p>
        )}

        <FormularioCita
          sesion={sesion}
          onCitaCreada={actualizarCitas}
        />
      </section>

      <section className="seccion-separada" id="acceso-mis-citas">
        <h2>Estado de mis citas</h2>

        {!autorizado && (
          <>
            <p>
              Ingresa tu contraseña para consultar tus citas e historial de controles
            </p>

            <form
              className="mb-3"
              onSubmit={(evento) => {void ingresarMisCitas(evento);}}
            >
              <label htmlFor="claveMisCitas" className="form-label">
                Contraseña de tu cuenta
              </label>

              <div className="d-flex flex-wrap gap-2">
                <input
                  id="claveMisCitas"
                  type="password"
                  className="form-control"
                  style={{maxWidth: "300px"}}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  value={clave}
                  onChange={(evento) => {
                    setClave(evento.target.value);
                    setErrorAcceso("");
                  }}
                  disabled={verificando}
                />

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={verificando}
                >
                  {verificando ? "Verificando" : "Consultar mis citas"}
                </button>
              </div>
            </form>

            {errorAcceso && (
              <p
                className="mensaje-formulario mensaje-error"
                role="alert"
              >
                {errorAcceso}
              </p>
            )}
          </>
        )}

        {autorizado && cargando && (
          <p role="status">
            Cargando citas
          </p>
        )}

        {autorizado && error && (
          <p className="mensaje-formulario mensaje-error" role="alert">
            {error}
          </p>
        )}

        {autorizado && errorCatalogo && (
          <p className="mensaje-formulario mensaje-error" role="alert">
            {errorCatalogo}
          </p>
        )}

        {autorizado && !cargando && !error && (
          <ListadoCitas
            citas={citasPendientes}
            servicios={servicios}
            profesionales={profesionales}
          />
        )}
      </section>

      <section className="seccion-separada">
        <h2>Historial de controles</h2>

        {autorizado && cargando && (
          <p role="status">
            Cargando historial
          </p>
        )}

        {autorizado && !cargando && !error && controlesRealizados.length === 0 && (
          <p>
            Aun no tienes controles registrados
          </p>
        )}

        {autorizado && !cargando && !error && controlesRealizados.length > 0 && (
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