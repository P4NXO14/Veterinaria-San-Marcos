import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import FormularioContacto from "../componentes/organismos/FormularioContacto";
import {obtenerMisMensajesContacto} from "../datos/mensajesContacto";
import type {MensajeContacto} from "../datos/mensajesContacto";
import type {Sesion} from "../datos/usuarios";

interface ContactoProps {
  sesion: Sesion | null;
}

function Contacto({sesion}: ContactoProps) {
  const navigate = useNavigate();

  const [clave,setClave] = useState("");
  const [mensajes,setMensajes] = useState<MensajeContacto[]>([]);
  const [cargando,setCargando] = useState(false);
  const [consultado,setConsultado] = useState(false);
  const [error,setError] = useState("");

  useEffect(() => {
    if (!sesion) {
      navigate("/login",{
        replace: true,
        state: {
          destino: "/contacto"
        }
      });
    }
  },[sesion,navigate]);

  useEffect(() => {
    setMensajes([]);
    setClave("");
    setConsultado(false);
    setError("");
  },[sesion?.correo]);

  async function consultarMisMensajes() {
    if (!sesion || cargando) {
      return;
    }

    if (!clave) {
      setError("Ingresa tu contraseña para consultar las respuestas");
      return;
    }

    setCargando(true);
    setError("");

    try {
      const datos = await obtenerMisMensajesContacto({
        correo: sesion.correo,
        password: clave
      });

      setMensajes(datos);
      setConsultado(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron consultar tus mensajes"
      );
    } finally {
      setClave("");
      setCargando(false);
    }
  }

  if (!sesion) {
    return null;
  }

  if (sesion.rol !== "cliente") {
    return (
      <main className="contenedor-principal">
        <h1>Acceso restringido</h1>

        <p>
          Esta seccion esta disponible solamente para los clientes de la veterinaria
        </p>
      </main>
    );
  }

  return (
    <main className="contenedor-formulario">
      <section>
        <h1>Envianos tu consulta</h1>

        <FormularioContacto sesion={sesion} />
      </section>

      <section className="seccion-separada contacto-consultas">
        <h2>Mis consultas y respuestas</h2>

        <p>
          Consulta los mensajes enviados desde tu cuenta y las respuestas de la veterinaria
        </p>

        <div className="contacto-consultas-autorizacion">
          <label htmlFor="contactoClave">
            Contraseña para consultar tus mensajes:
          </label>

          <input
            id="contactoClave"
            type="password"
            autoComplete="current-password"
            value={clave}
            onChange={(evento) =>
              setClave(evento.target.value)
            }
            disabled={cargando}
            placeholder="Ingresa tu contraseña"
          />

          <button
            type="button"
            className="btn-principal"
            disabled={cargando}
            onClick={() => {void consultarMisMensajes();}}
          >
            {cargando
              ? "Consultando mensajes"
              : "Consultar mis mensajes"}
          </button>
        </div>

        {error && (
          <p
            className="mensaje-formulario mensaje-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {consultado && mensajes.length === 0 && (
          <p>No tienes mensajes registrados</p>
        )}

        {mensajes.map((mensaje) => (
          <article
            className="cita-item"
            key={mensaje.id}
          >
            <p>
              <strong>Fecha de envio:</strong>{" "}
              {new Date(mensaje.fechaEnvio).toLocaleString("es-CL")}
            </p>

            <p>
              <strong>Consulta:</strong> {mensaje.comentario}
            </p>

            <p>
              <strong>Estado:</strong> {mensaje.estado}
            </p>

            {mensaje.respuesta ? (
              <>
                <p>
                  <strong>Respuesta de la veterinaria:</strong>{" "}
                  {mensaje.respuesta}
                </p>

                {mensaje.fechaRespuesta && (
                  <p>
                    <strong>Fecha de respuesta:</strong>{" "}
                    {new Date(mensaje.fechaRespuesta).toLocaleString("es-CL")}
                  </p>
                )}
              </>
            ) : (
              <p>Aun no hay una respuesta registrada</p>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}

export default Contacto;