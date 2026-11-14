import {useCallback,useEffect,useState} from "react";
import {obtenerMensajesContacto,atenderMensajeContacto,eliminarMensajeContacto} from "../../datos/mensajesContacto";
import type {MensajeContacto as Mensaje} from "../../datos/mensajesContacto";

function MensajesContacto() {
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState("");

    const actualizarMensajes = useCallback(async () => {
        setCargando(true);
        setError("");

        try {
            const datos = await obtenerMensajesContacto();
            setMensajes(datos);
        } catch {
            setError("No se pudieron cargar los mensajes.");
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        void actualizarMensajes();
    }, [actualizarMensajes]);

    async function atender(id: number) {
        setProcesando(true);
        setError("");

        try {
            await atenderMensajeContacto(id);
            await actualizarMensajes();
        } catch {
            setError("No se pudo actualizar el mensaje.");
        } finally {
            setProcesando(false);
        }
    }

    async function eliminar(id: number) {
        const confirmar = window.confirm("Estas seguro de que deseas eliminar este mensaje?");

        if (!confirmar) {
            return;
        }

        setProcesando(true);
        setError("");

        try {
            await eliminarMensajeContacto(id);
            await actualizarMensajes();
        } catch {
            setError("No se pudo eliminar el mensaje.");
        } finally {
            setProcesando(false);
        }
    }

    return (
        <section className="seccion-separada">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h2>Mensajes de Contacto</h2>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => void actualizarMensajes()}
                    disabled={cargando || procesando}
                >
                    Actualizar mensajes
                </button>
            </div>

            {error && (
                <p className="mensaje-formulario mensaje-error" role="alert">
                    {error}
                </p>
            )}

            {cargando ? (
                <p>Cargando mensajes...</p>
            ) : mensajes.length === 0 ? (
                <p>No existen mensajes de contacto registrados.</p>
            ) : (
                [...mensajes].reverse().map((mensaje) => (
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

                        <p className="text-break">
                            {mensaje.comentario}
                        </p>

                        <div className="acciones-cita">
                            {mensaje.estado !== "ATENDIDO" && (
                                <button
                                    type="button"
                                    className="btn-principal"
                                    disabled={procesando}
                                    onClick={() => void atender(mensaje.id)}
                                >
                                    Marcar como atendido
                                </button>
                            )}

                            <button
                                type="button"
                                className="btn btn-danger"
                                disabled={procesando}
                                onClick={() => void eliminar(mensaje.id)}
                            >
                                Eliminar mensaje
                            </button>
                        </div>
                    </article>
                ))
            )}
        </section>
    );
}

export default MensajesContacto;