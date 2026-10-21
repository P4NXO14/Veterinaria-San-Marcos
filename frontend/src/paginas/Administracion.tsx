
import { useState } from "react";

import {
  obtenerUsuarios,
  cambiarEstadoUsuario,
  eliminarUsuario,
  editarPersonal,
  crearPersonal
} from "../datos/usuarios";

import type {
  Usuario,
  Sesion,
  DatosEdicionPersonal,
  DatosNuevoPersonal
} from "../datos/usuarios";

import FormularioEditarPersonal from "../componentes/organismos/FormularioEditarPersonal";
import FormularioAgregarPersonal from "../componentes/organismos/FormularioAgregarPersonal";

interface AdministracionProps {
  sesion: Sesion | null;
}

function Administracion({ sesion }: AdministracionProps) {

  const [usuarios, setUsuarios] = useState<Usuario[]>(
    () => obtenerUsuarios()
  );

  const [mensaje, setMensaje] = useState("");
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [mostrarAgregar, setMostrarAgregar] = useState(false);

  function actualizarUsuarios() {
    setUsuarios(obtenerUsuarios());
  }

  function cambiarEstado(rut: string, activo: boolean) {
    const resultado = cambiarEstadoUsuario(rut, !activo);

    if (resultado) {
      actualizarUsuarios();
      setMensaje("Estado del usuario actualizado correctamente.");
    } else {
      setMensaje("No se pudo modificar el estado del usuario.");
    }
  }

  function eliminar(rut: string) {
    const confirmar = window.confirm(
      "¿Estas seguro de que deseas eliminar este usuario?"
    );

    if (!confirmar) {
      return;
    }

    const resultado = eliminarUsuario(rut);

    if (resultado) {
      actualizarUsuarios();

      if (usuarioEditando?.rut === rut) {
        setUsuarioEditando(null);
      }

      setMensaje("Usuario eliminado correctamente.");
    } else {
      setMensaje("No se pudo eliminar el usuario.");
    }
  }

  function editarUsuario(usuario: Usuario) {
    if (usuario.rol !== "recepcionista") {
      setMensaje("Solo puedes editar cuentas del personal.");
      return;
    }

    setMostrarAgregar(false);
    setUsuarioEditando(usuario);
    setMensaje("");
  }

  function guardarEdicion(datos: DatosEdicionPersonal) {
    if (!usuarioEditando || usuarioEditando.rol !== "recepcionista") {
      setMensaje("No tienes permisos para editar este usuario.");
      return;
    }

    const resultado = editarPersonal(usuarioEditando.rut, datos);

    if (resultado) {
      actualizarUsuarios();
      setUsuarioEditando(null);
      setMensaje("Datos del personal actualizados correctamente.");
    } else {
      setMensaje("No se pudieron guardar los cambios.");
    }
  }

  function abrirAgregarPersonal() {
    setUsuarioEditando(null);
    setMostrarAgregar(true);
    setMensaje("");
  }

  function guardarNuevoPersonal(datos: DatosNuevoPersonal) {
    const resultado = crearPersonal(datos);

    if (resultado) {
      actualizarUsuarios();
      setMostrarAgregar(false);
      setMensaje("Cuenta del personal creada correctamente.");
    } else {
      setMensaje(
        "No se pudo crear la cuenta. Verifica los datos, el RUN y que el correo no este registrado."
      );
    }
  }

  if (!sesion || sesion.rol !== "admin") {
    return (
      <main className="contenedor-principal">
        <h1>Acceso restringido</h1>
        <p>No tienes permisos para acceder a esta vista.</p>
      </main>
    );
  }

  return (
    <main className="contenedor-tabla">
      <h1>Gestion de Usuarios</h1>

      <p>
        El administrador puede gestionar las cuentas
        y los roles de los usuarios de la veterinaria.
      </p>

      <button
        type="button"
        className="btn btn-success mb-3"
        onClick={abrirAgregarPersonal}
      >
        Agregar Personal
      </button>

      {mensaje && (
        <p className="mensaje-formulario" role="status">
          {mensaje}
        </p>
      )}

      {mostrarAgregar && (
        <FormularioAgregarPersonal
          onGuardar={guardarNuevoPersonal}
          onCancelar={() => {
            setMostrarAgregar(false);
            setMensaje("");
          }}
        />
      )}

      {usuarioEditando && (
        <FormularioEditarPersonal
          key={usuarioEditando.rut}
          usuario={usuarioEditando}
          onGuardar={guardarEdicion}
          onCancelar={() => setUsuarioEditando(null)}
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
              <tr key={usuario.rut}>
                <td>
                  {usuario.nombre} {usuario.apellidos}
                </td>

                <td>{usuario.correo}</td>

                <td>{usuario.rol}</td>

                <td>
                  {usuario.activo === false
                    ? "Inactivo"
                    : "Activo"}
                </td>

                <td>
                  {usuario.rol === "admin" ? (
                    <span>Cuenta protegida</span>
                  ) : (
                    <div className="d-flex flex-wrap gap-2">

                      {usuario.rol === "recepcionista" && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => editarUsuario(usuario)}
                        >
                          Editar
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-warning btn-sm"
                        onClick={() =>
                          cambiarEstado(
                            usuario.rut,
                            usuario.activo !== false
                          )
                        }
                      >
                        {usuario.activo === false
                          ? "Activar"
                          : "Desactivar"}
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => eliminar(usuario.rut)}
                      >
                        Eliminar
                      </button>

                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default Administracion;