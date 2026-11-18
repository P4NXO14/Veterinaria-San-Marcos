import {useState} from "react";
import type {FormEvent} from "react";
import CampoFormulario from "../moleculas/CampoFormulario";
import type {DatosEdicionPersonal} from "../../datos/usuarios";
import type {UsuarioAdministracion} from "../../datos/usuariosAdminApi";

interface FormularioEditarPersonalProps {
  usuario: UsuarioAdministracion;
  onGuardar: (datos: DatosEdicionPersonal) => void;
  onCancelar: () => void;
  procesando: boolean;
}

function FormularioEditarPersonal({
  usuario,
  onGuardar,
  onCancelar,
  procesando
}: FormularioEditarPersonalProps) {
  const [nombre,setNombre] = useState(usuario.nombre);
  const [apellidos,setApellidos] = useState(usuario.apellidos);
  const [direccion,setDireccion] = useState(usuario.direccion);
  const [mensaje,setMensaje] = useState("");

  function guardarCambios(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (procesando) {
      return;
    }

    const nombreLimpio = nombre.trim();
    const apellidosLimpios = apellidos.trim();
    const direccionLimpia = direccion.trim();

    if (!nombreLimpio || nombreLimpio.length > 50) {
      setMensaje("Ingresa un nombre valido de hasta 50 caracteres");
      return;
    }

    if (!apellidosLimpios || apellidosLimpios.length > 100) {
      setMensaje("Ingresa apellidos validos de hasta 100 caracteres");
      return;
    }

    if (!direccionLimpia || direccionLimpia.length > 255) {
      setMensaje("Ingresa una direccion valida de hasta 255 caracteres");
      return;
    }

    setMensaje("");

    onGuardar({
      nombre: nombreLimpio,
      apellidos: apellidosLimpios,
      direccion: direccionLimpia
    });
  }

  return (
    <section className="contenedor-formulario">
      <h2>Editar Personal</h2>

      <p>
        Modifica los datos del personal de la veterinaria
      </p>

      <form
        className="formulario-vertical"
        onSubmit={guardarCambios}
        noValidate
      >
        <CampoFormulario
          id="editarNombre"
          etiqueta="Nombre:"
          tipo="text"
          valor={nombre}
          onChange={setNombre}
          maxLength={50}
        />

        <CampoFormulario
          id="editarApellidos"
          etiqueta="Apellidos:"
          tipo="text"
          valor={apellidos}
          onChange={setApellidos}
          maxLength={100}
        />

        <CampoFormulario
          id="editarDireccion"
          etiqueta="Direccion:"
          tipo="text"
          valor={direccion}
          onChange={setDireccion}
          maxLength={255}
        />

        {mensaje && (
          <p className="mensaje-error" role="alert">
            {mensaje}
          </p>
        )}

        <div className="d-flex gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={procesando}
          >
            {procesando ? "Guardando cambios" : "Guardar cambios"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            disabled={procesando}
            onClick={onCancelar}
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}

export default FormularioEditarPersonal;