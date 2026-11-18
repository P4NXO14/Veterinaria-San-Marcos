import {useEffect,useState} from "react";
import type {Sesion} from "../../datos/usuarios";
import type {CredencialesContacto,MensajeContacto as Mensaje} from "../../datos/mensajesContacto";
import {obtenerMensajesContacto,atenderMensajeContacto,eliminarMensajeContacto,responderMensajeContacto} from "../../datos/mensajesContacto";

interface MensajesContactoProps {
    sesion: Sesion | null;
}

function MensajesContacto({sesion}: MensajesContactoProps) {
    const [mensajes,setMensajes] = useState<Mensaje[]>([]);
    const [clave,setClave] = useState("");
    const [cargando,setCargando] = useState(false);
    const [consultado,setConsultado] = useState(false);
    const [procesando,setProcesando] = useState(false);
    const [error,setError] = useState("");
    const [aviso,setAviso] = useState("");
    const [idRespondiendo,setIdRespondiendo] = useState<number | null>(null);
    const [textoRespuesta,setTextoRespuesta] = useState("");

    const esPersonal = sesion?.rol === "admin" || sesion?.rol === "recepcionista";

    useEffect(() => {
        setMensajes([]);
        setClave("");
        setConsultado(false);
        setIdRespondiendo(null);
        setTextoRespuesta("");
        setError("");
        setAviso("");
    },[sesion?.correo]);

    function cambiarClave(valor: string) {
        setClave(valor);
        setMensajes([]);
        setConsultado(false);
        setIdRespondiendo(null);
        setTextoRespuesta("");
        setError("");
        setAviso("");
    }

    function obtenerCredenciales(): CredencialesContacto | null {
        if (!sesion || !esPersonal) {
            setError("No tienes permisos para consultar estos mensajes");
            return null;
        }

        if (clave.length < 4 || clave.length > 10) {
            setError("Ingresa tu contraseña de 4 a 10 caracteres");
            return null;
        }

        return {
            correo: sesion.correo,
            password: clave
        };
    }

    async function actualizarMensajes() {
        if (cargando || procesando) {
            return;
        }

        const credenciales = obtenerCredenciales();

        if (!credenciales) {
            return;
        }

        setCargando(true);
        setError("");
        setAviso("");

        try {
            const datos = await obtenerMensajesContacto(credenciales);
            setMensajes(datos);
            setConsultado(true);
        } catch (error) {
            setMensajes([]);
            setConsultado(false);
            setError(
                error instanceof Error
                    ? error.message
                    : "No se pudieron cargar los mensajes"
            );
        } finally {
            setCargando(false);
        }
    }

    function cerrarRespuesta() {
        setIdRespondiendo(null);
        setTextoRespuesta("");
    }

    function abrirRespuesta(mensaje: Mensaje) {
        if (procesando || cargando) {
            return;
        }

        setIdRespondiendo(mensaje.id);
        setTextoRespuesta(mensaje.respuesta);
        setError("");
        setAviso("");
    }

    async function responder(id: number) {
        if (procesando || cargando) {
            return;
        }

        const credenciales = obtenerCredenciales();

        if (!credenciales) {
            return;
        }

        if (!textoRespuesta.trim() || textoRespuesta.trim().length > 2000) {
            setError("La respuesta debe contener entre 1 y 2000 caracteres");
            return;
        }

        setProcesando(true);
        setError("");
        setAviso("");

        try {
            await responderMensajeContacto(
                id,
                textoRespuesta.trim(),
                credenciales
            );

            const datos = await obtenerMensajesContacto(credenciales);
            setMensajes(datos);
            cerrarRespuesta();
            setAviso("Respuesta guardada correctamente");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "No se pudo guardar la respuesta"
            );
        } finally {
            setProcesando(false);
        }
    }

    async function atender(id: number) {
        if (procesando || cargando) {
            return;
        }

        const credenciales = obtenerCredenciales();

        if (!credenciales) {
            return;
        }

        setProcesando(true);
        setError("");
        setAviso("");

        try {
            await atenderMensajeContacto(id,credenciales);
            const datos = await obtenerMensajesContacto(credenciales);
            setMensajes(datos);
            setAviso("Mensaje marcado como atendido");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "No se pudo actualizar el mensaje"
            );
        } finally {
            setProcesando(false);
        }
    }

    async function eliminar(id: number) {
        if (procesando || cargando) {
            return;
        }

        const credenciales = obtenerCredenciales();

        if (!credenciales) {
            return;
        }

        if (!window.confirm("¿Estas seguro de que deseas eliminar este mensaje?")) {
            return;
        }

        setProcesando(true);
        setError("");
        setAviso("");

        try {
            await eliminarMensajeContacto(id,credenciales);
            const datos = await obtenerMensajesContacto(credenciales);
            setMensajes(datos);

            if (idRespondiendo === id) {
                cerrarRespuesta();
            }

            setAviso("Mensaje eliminado correctamente");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "No se pudo eliminar el mensaje"
            );
        } finally {
            setProcesando(false);
        }
    }

    if (!esPersonal) {
        return null;
    }

    return (
        <section className="seccion-separada">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h2>Mensajes de Contacto</h2>
            </div>

            <div className="d-flex flex-wrap align-items-end gap-2 mb-3">
                <div>
                    <label htmlFor="claveGestionContacto" className="form-label">
                        Contraseña para gestionar mensajes:
                    </label>

                    <input
                        id="claveGestionContacto"
                        type="password"
                        className="form-control"
                        style={{maxWidth: "300px"}}
                        autoComplete="current-password"
                        minLength={4}
                        maxLength={10}
                        value={clave}
                        onChange={(e) => cambiarClave(e.target.value)}
                        disabled={cargando || procesando}
                        placeholder="Ingresa tu contraseña"
                    />
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {void actualizarMensajes();}}
                    disabled={cargando || procesando}
                >
                    {cargando ? "Cargando mensajes" : "Actualizar mensajes"}
                </button>
            </div>

            {error && (
                <p className="mensaje-formulario mensaje-error" role="alert">
                    {error}
                </p>
            )}

            {aviso && (
                <p className="mensaje-formulario mensaje-exito" role="status">
                    {aviso}
                </p>
            )}

            {!consultado && !cargando && (
                <p>Ingresa tu contraseña y selecciona Actualizar mensajes</p>
            )}

            {cargando && (
                <p role="status">Cargando mensajes</p>
            )}

            {consultado && mensajes.length === 0 && (
                <p>No existen mensajes de contacto registrados</p>
            )}

            {consultado && [...mensajes].reverse().map((mensaje) => (
                <article className="cita-item" key={mensaje.id}>
                    <h3>{mensaje.nombre}</h3>

                    <p>
                        <strong>Correo:</strong> {mensaje.correo}
                    </p>

                    <p>
                        <strong>Cuenta de origen:</strong> {mensaje.correoCuenta || "No registrada"}
                    </p>

                    <p>
                        <strong>Fecha de envio:</strong>{" "}
                        {new Date(mensaje.fechaEnvio).toLocaleString("es-CL")}
                    </p>

                    <p>
                        <strong>Estado:</strong> {mensaje.estado}
                    </p>

                    <p>
                        <strong>Mensaje:</strong>
                    </p>

                    <p className="text-break">{mensaje.comentario}</p>

                    {mensaje.respuesta && (
                        <>
                            <p>
                                <strong>Respuesta de la veterinaria:</strong>
                            </p>

                            <p className="text-break">{mensaje.respuesta}</p>

                            <p>
                                <strong>Respondido por:</strong> {mensaje.respondidoPor}
                            </p>

                            {mensaje.fechaRespuesta && (
                                <p>
                                    <strong>Fecha de respuesta:</strong>{" "}
                                    {new Date(mensaje.fechaRespuesta).toLocaleString("es-CL")}
                                </p>
                            )}
                        </>
                    )}

                    <div className="acciones-cita">
                        <button
                            type="button"
                            className="btn-principal"
                            disabled={procesando || cargando}
                            onClick={() => abrirRespuesta(mensaje)}
                        >
                            {mensaje.respuesta ? "Editar respuesta" : "Responder mensaje"}
                        </button>

                        {mensaje.estado !== "ATENDIDO" && (
                            <button
                                type="button"
                                className="btn-secundario"
                                disabled={procesando || cargando}
                                onClick={() => {void atender(mensaje.id);}}
                            >
                                Marcar como atendido
                            </button>
                        )}

                        <button
                            type="button"
                            className="btn btn-danger"
                            disabled={procesando || cargando}
                            onClick={() => {void eliminar(mensaje.id);}}
                        >
                            Eliminar mensaje
                        </button>
                    </div>

                    {idRespondiendo === mensaje.id && (
                        <div className="formulario-vertical mt-3">
                            <label htmlFor={`respuesta-${mensaje.id}`}>
                                Respuesta al cliente:
                            </label>

                            <textarea
                                id={`respuesta-${mensaje.id}`}
                                value={textoRespuesta}
                                onChange={(e) => setTextoRespuesta(e.target.value)}
                                maxLength={2000}
                                rows={4}
                                disabled={procesando}
                                placeholder="Escribe aqui la respuesta para el cliente"
                            />

                            <div className="acciones-cita mt-2">
                                <button
                                    type="button"
                                    className="btn-principal"
                                    disabled={procesando}
                                    onClick={() => {void responder(mensaje.id);}}
                                >
                                    {procesando ? "Guardando respuesta" : "Enviar respuesta"}
                                </button>

                                <button
                                    type="button"
                                    className="btn-secundario"
                                    disabled={procesando}
                                    onClick={cerrarRespuesta}
                                >
                                    Cancelar respuesta
                                </button>
                            </div>
                        </div>
                    )}
                </article>
            ))}
        </section>
    );
}

export default MensajesContacto;