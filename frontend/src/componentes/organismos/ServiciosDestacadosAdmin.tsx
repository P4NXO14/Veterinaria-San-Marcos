import {useEffect,useState} from "react";
import {cambiarServicioDestacadoServidor,obtenerServiciosDestacadosServidor,obtenerServiciosServidor} from "../../datos/catalogoApi";
import type {Servicio} from "../../datos/servicios";
import type {CredencialesAdministrador} from "../../datos/usuariosAdminApi";

interface ServiciosDestacadosAdminProps {
    credenciales: CredencialesAdministrador;
}

function ServiciosDestacadosAdmin({credenciales}: ServiciosDestacadosAdminProps) {
    const [servicios,setServicios] = useState<Servicio[]>([]);
    const [destacados,setDestacados] = useState<string[]>([]);
    const [cargando,setCargando] = useState(true);
    const [procesando,setProcesando] = useState(false);
    const [mensaje,setMensaje] = useState("");
    const [error,setError] = useState("");

    useEffect(() => {
        let activo = true;

        Promise.all([
            obtenerServiciosServidor(),
            obtenerServiciosDestacadosServidor()
        ])
            .then(([catalogo,seleccionados]) => {
                if (activo) {
                    setServicios(catalogo);
                    setDestacados(seleccionados.map((servicio) => servicio.id));
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

    async function cambiarDestacado(servicio: Servicio) {
        if (procesando || cargando) {
            return;
        }

        const seleccionado = destacados.includes(servicio.id);
        setProcesando(true);
        setMensaje("");
        setError("");

        try {
            await cambiarServicioDestacadoServidor(
                servicio.id,
                !seleccionado,
                credenciales
            );

            const nuevosDestacados = await obtenerServiciosDestacadosServidor();
            setDestacados(nuevosDestacados.map((item) => item.id));
            setMensaje("Servicios destacados actualizados correctamente");
        } catch (fallo) {
            setError(
                fallo instanceof Error
                    ? fallo.message
                    : "No se pudo actualizar el servicio destacado"
            );
        } finally {
            setProcesando(false);
        }
    }

    return (
        <section className="seccion-separada">
            <h2>Gestion de Servicios Destacados</h2>
            <p>Selecciona hasta 6 servicios para mostrar en Inicio</p>

            {cargando && (
                <p role="status">
                    Cargando servicios
                </p>
            )}

            {error && (
                <p className="mensaje-formulario mensaje-error" role="alert">
                    {error}
                </p>
            )}

            {mensaje && (
                <p className="mensaje-formulario mensaje-exito" role="status">
                    {mensaje}
                </p>
            )}

            {!cargando && (
                <>
                    <p>Servicios destacados: {destacados.length} de 6</p>

                    <div className="table-responsive">
                        <table className="table table-striped table-bordered align-middle">
                            <thead>
                                <tr>
                                    <th>Servicio</th>
                                    <th>Categoria</th>
                                    <th>Destacado</th>
                                    <th>Accion</th>
                                </tr>
                            </thead>

                            <tbody>
                                {servicios.map((servicio) => {
                                    const seleccionado = destacados.includes(servicio.id);

                                    return (
                                        <tr key={servicio.id}>
                                            <td>{servicio.nombre}</td>
                                            <td>{servicio.categoria}</td>
                                            <td>{seleccionado ? "Si" : "No"}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className={seleccionado ? "btn btn-secondary btn-sm" : "btn btn-primary btn-sm"}
                                                    disabled={procesando}
                                                    onClick={() => {void cambiarDestacado(servicio);}}
                                                >
                                                    {seleccionado ? "Quitar destacado" : "Destacar"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </section>
    );
}

export default ServiciosDestacadosAdmin;