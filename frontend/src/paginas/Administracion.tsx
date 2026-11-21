import {useState} from "react";
import type {FormEvent} from "react";
import type {Sesion,DatosEdicionPersonal,DatosNuevoPersonal} from "../datos/usuarios";
import {cambiarEstadoPersonalAdministrador,crearPersonalAdministrador,editarPersonalAdministrador,eliminarClienteAdministrador,eliminarPersonalAdministrador,listarUsuariosAdministrador} from "../datos/usuariosAdminApi";
import type {CredencialesAdministrador,UsuarioAdministracion} from "../datos/usuariosAdminApi";
import FormularioEditarPersonal from "../componentes/organismos/FormularioEditarPersonal";
import FormularioAgregarPersonal from "../componentes/organismos/FormularioAgregarPersonal";
import ServiciosDestacadosAdmin from "../componentes/organismos/ServiciosDestacadosAdmin";

interface AdministracionProps {
  sesion: Sesion | null;
}

function Administracion({sesion}: AdministracionProps) {
  const [usuarios,setUsuarios] = useState<UsuarioAdministracion[]>([]);
  const [clave,setClave] = useState("");
  const [autorizado,setAutorizado] = useState(false);
  const [mensaje,setMensaje] = useState("");
  const [tipoMensaje,setTipoMensaje] = useState<"exito" | "error">("error");
  const [usuarioEditando,setUsuarioEditando] = useState<UsuarioAdministracion | null>(null);
  const [mostrarAgregar,setMostrarAgregar] = useState(false);
  const [cargando,setCargando] = useState(false);
  const [procesando,setProcesando] = useState(false);
  const [clientePorEliminar,setClientePorEliminar] = useState<number | null>(null);

  function mostrarMensaje(texto: string,tipo: "exito" | "error") {
    setMensaje(texto);
    setTipoMensaje(tipo);
  }

  function obtenerCredenciales(): CredencialesAdministrador | null {
    if (!sesion || sesion.rol !== "admin" || !clave) {
      mostrarMensaje("Debes ingresar la contraseña del administrador","error");
      return null;
    }

    return {correo: sesion.correo,password: clave};
  }

  function cambiarClave(valor: string) {
    setClave(valor);
    setAutorizado(false);
    setUsuarios([]);
    setUsuarioEditando(null);
    setMostrarAgregar(false);
    setClientePorEliminar(null);
    setMensaje("");
  }

  async function cargarUsuarios(evento?: FormEvent<HTMLFormElement>) {
    evento?.preventDefault();

    if (cargando || procesando) {
      return;
    }

    const credenciales = obtenerCredenciales();

    if (!credenciales) {
      return;
    }

    setCargando(true);
    setMensaje("");

    try {
      const datos = await listarUsuariosAdministrador(credenciales);

      setUsuarios(datos);
      setAutorizado(true);
      mostrarMensaje("Usuarios cargados correctamente","exito");
    } catch (error) {
      setAutorizado(false);
      setUsuarios([]);
      setClave("");
      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo consultar Usuarios",
        "error"
      );
    } finally {
      setCargando(false);
    }
  }

  async function ejecutarOperacion(
    operacion: (credenciales: CredencialesAdministrador) => Promise<void>,
    confirmacion: string
  ): Promise<boolean> {
    if (procesando || cargando || !autorizado) {
      return false;
    }

    const credenciales = obtenerCredenciales();

    if (!credenciales) {
      return false;
    }

    setProcesando(true);
    setMensaje("");

    try {
      await operacion(credenciales);

      try {
        setUsuarios(await listarUsuariosAdministrador(credenciales));
        mostrarMensaje(confirmacion,"exito");
      } catch {
        mostrarMensaje(
          "La operacion se guardo en MySQL, pero no se pudo actualizar el listado",
          "error"
        );
      }

      return true;
    } catch (error) {
      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo completar la operacion",
        "error"
      );

      return false;
    } finally {
      setProcesando(false);
    }
  }

  async function cambiarEstado(usuario: UsuarioAdministracion) {
    if (usuario.rol !== "recepcionista") {
      mostrarMensaje("Solo puedes modificar cuentas del personal","error");
      return;
    }

    await ejecutarOperacion(
      async (credenciales) => {
        await cambiarEstadoPersonalAdministrador(
          usuario.id,
          !usuario.activo,
          credenciales
        );
      },
      "Estado del personal actualizado correctamente"
    );
  }

  async function eliminar(usuario: UsuarioAdministracion) {
    if (usuario.rol !== "recepcionista" || procesando) {
      mostrarMensaje("Solo puedes eliminar cuentas del personal","error");
      return;
    }

    if (!window.confirm(
      `¿Estas seguro de que deseas eliminar a ${usuario.nombre} ${usuario.apellidos}?`
    )) {
      return;
    }

    const correcto = await ejecutarOperacion(
      (credenciales) => eliminarPersonalAdministrador(usuario.id,credenciales),
      "Cuenta del personal eliminada correctamente"
    );

    if (correcto && usuarioEditando?.id === usuario.id) {
      setUsuarioEditando(null);
    }
  }

  async function eliminarCliente(usuario: UsuarioAdministracion) {
    if (usuario.rol !== "cliente" || procesando) {
      mostrarMensaje("Solo puedes eliminar cuentas de clientes","error");
      return;
    }

    const correcto = await ejecutarOperacion(
      (credenciales) => eliminarClienteAdministrador(usuario.id,credenciales),
      "Cuenta del cliente eliminada correctamente"
    );

    if (correcto) {
      setClientePorEliminar(null);
    }
  }

  function editarUsuario(usuario: UsuarioAdministracion) {
    if (usuario.rol !== "recepcionista") {
      mostrarMensaje("Solo puedes editar cuentas del personal","error");
      return;
    }

    setMostrarAgregar(false);
    setUsuarioEditando(usuario);
    setMensaje("");
  }

  async function guardarEdicion(datos: DatosEdicionPersonal) {
    if (!usuarioEditando || usuarioEditando.rol !== "recepcionista") {
      mostrarMensaje("No tienes permisos para editar este usuario","error");
      return;
    }

    const correcto = await ejecutarOperacion(
      async (credenciales) => {
        await editarPersonalAdministrador(
          usuarioEditando.id,
          datos,
          credenciales
        );
      },
      "Datos del personal actualizados correctamente"
    );

    if (correcto) {
      setUsuarioEditando(null);
    }
  }

  function abrirAgregarPersonal() {
    setUsuarioEditando(null);
    setMostrarAgregar(true);
    setMensaje("");
  }

  async function guardarNuevoPersonal(datos: DatosNuevoPersonal) {
    const correcto = await ejecutarOperacion(
      async (credenciales) => {
        await crearPersonalAdministrador(datos,credenciales);
      },
      "Cuenta del personal creada correctamente"
    );

    if (correcto) {
      setMostrarAgregar(false);
    }
  }

  if (!sesion || sesion.rol !== "admin") {
    return (
      <main className="contenedor-principal">
        <h1>Acceso restringido</h1>
        <p>No tienes permisos para acceder a esta vista</p>
      </main>
    );
  }

  return (
    <main className="contenedor-tabla">
      <h1>Gestion de Usuarios</h1>

      <p>
        El administrador puede gestionar las cuentas del personal de la veterinaria
      </p>

      <form
        className="mb-3"
        onSubmit={(evento) => {void cargarUsuarios(evento);}}
      >
        <label htmlFor="claveAdministrador" className="form-label">
          Contraseña del administrador
        </label>

        <div className="d-flex flex-wrap gap-2">
          <input
            id="claveAdministrador"
            type="password"
            className="form-control"
            style={{maxWidth: "300px"}}
            autoComplete="current-password"
            placeholder="Ingresa tu contraseña"
            value={clave}
            onChange={(evento) => cambiarClave(evento.target.value)}
            disabled={cargando || procesando}
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={cargando || procesando}
          >
            {cargando ? "Cargando usuarios" : "Cargar usuarios"}
          </button>
        </div>
      </form>

      {mensaje && (
        <p
          className={`mensaje-formulario mensaje-${tipoMensaje}`}
          role={tipoMensaje === "error" ? "alert" : "status"}
        >
          {mensaje}
        </p>
      )}

      {autorizado && (
        <>
          <button
            type="button"
            className="btn btn-success mb-3"
            disabled={procesando || cargando}
            onClick={abrirAgregarPersonal}
          >
            Agregar Personal
          </button>

          {mostrarAgregar && (
            <FormularioAgregarPersonal
              procesando={procesando}
              onGuardar={(datos) => {void guardarNuevoPersonal(datos);}}
              onCancelar={() => {
                setMostrarAgregar(false);
                setMensaje("");
              }}
            />
          )}

          {usuarioEditando && (
            <FormularioEditarPersonal
              key={usuarioEditando.id}
              usuario={usuarioEditando}
              procesando={procesando}
              onGuardar={(datos) => {void guardarEdicion(datos);}}
              onCancelar={() => {
                setUsuarioEditando(null);
                setMensaje("");
              }}
            />
          )}

          <div className="table-responsive">
            <table className="table table-striped table-bordered align-middle">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>
                      {usuario.nombre} {usuario.apellidos}
                    </td>

                    <td>{usuario.correo}</td>

                    <td>{usuario.rol}</td>

                    <td>
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </td>

                    <td>
                      {usuario.rol === "recepcionista" ? (
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={procesando || cargando}
                            onClick={() => editarUsuario(usuario)}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className="btn btn-warning btn-sm"
                            disabled={procesando || cargando}
                            onClick={() => {void cambiarEstado(usuario);}}
                          >
                            {usuario.activo ? "Desactivar" : "Activar"}
                          </button>

                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            disabled={procesando || cargando}
                            onClick={() => {void eliminar(usuario);}}
                          >
                            Eliminar
                          </button>
                        </div>
                      ) : usuario.rol === "cliente" ? (
                        clientePorEliminar === usuario.id ? (
                          <div className="d-flex flex-wrap align-items-center gap-2">
                            <span>¿Eliminar definitivamente esta cuenta?</span>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              disabled={procesando || cargando}
                              onClick={() => {void eliminarCliente(usuario);}}
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              disabled={procesando || cargando}
                              onClick={() => setClientePorEliminar(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            disabled={procesando || cargando}
                            onClick={() => setClientePorEliminar(usuario.id)}
                          >
                            Eliminar
                          </button>
                        )
                      ) : (
                        <span>
                          {usuario.rol === "admin"
                            ? "Cuenta protegida"
                            : "Sin acciones administrativas"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ServiciosDestacadosAdmin credenciales={{correo: sesion.correo,password: clave}} />
        </>
      )}
    </main>
  );
}

export default Administracion;