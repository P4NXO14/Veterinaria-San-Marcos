import {useState} from "react";
import type {FormEvent} from "react";
import CampoFormulario from "../moleculas/CampoFormulario";
import {guardarMensajeContacto} from "../../datos/mensajesContacto";
import type {Sesion} from "../../datos/usuarios";

interface FormularioContactoProps {
    sesion: Sesion;
}

function FormularioContacto({sesion}: FormularioContactoProps) {
    const [nombre,setNombre] = useState("");
    const [correo,setCorreo] = useState("");
    const [comentario,setComentario] = useState("");
    const [clave,setClave] = useState("");
    const [mensaje,setMensaje] = useState("");
    const [tipoMensaje,setTipoMensaje] = useState<"error" | "exito">("error");
    const [enviando,setEnviando] = useState(false);

    function mostrarError(texto: string) {
        setMensaje(texto);
        setTipoMensaje("error");
    }

    async function enviarMensaje(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (enviando) {
            return;
        }

        const nombreLimpio = nombre.trim();
        const correoLimpio = correo.trim();
        const comentarioLimpio = comentario.trim();

        if (nombreLimpio === "" || nombreLimpio.length > 100) {
            mostrarError("El nombre es obligatorio y admite hasta 100 caracteres");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio) || correoLimpio.length > 100) {
            mostrarError("Ingresa un correo valido de hasta 100 caracteres");
            return;
        }

        if (comentarioLimpio === "" || comentarioLimpio.length > 500) {
            mostrarError("El mensaje es obligatorio y admite hasta 500 caracteres");
            return;
        }

        if (clave.length < 4 || clave.length > 10) {
            mostrarError("La contraseña debe tener entre 4 y 10 caracteres");
            return;
        }

        setEnviando(true);
        setMensaje("");

        try {
            await guardarMensajeContacto({
                nombre: nombreLimpio,
                correo: correoLimpio,
                comentario: comentarioLimpio
            },{
                correo: sesion.correo,
                password: clave
            });

            setMensaje("Mensaje enviado correctamente a recepcion");
            setTipoMensaje("exito");
            setNombre("");
            setCorreo("");
            setComentario("");
        } catch (error) {
            mostrarError(
                error instanceof Error
                    ? error.message
                    : "No se pudo guardar el mensaje"
            );
        } finally {
            setClave("");
            setEnviando(false);
        }
    }

    return (
        <form
            id="formContacto"
            className="formulario-vertical"
            onSubmit={enviarMensaje}
            noValidate
        >
            <CampoFormulario
                id="contactoNombre"
                etiqueta="Nombre:"
                tipo="text"
                valor={nombre}
                onChange={setNombre}
                maxLength={100}
                autoComplete="name"
                placeholder="Ingresa tu nombre"
            />

            <CampoFormulario
                id="contactoCorreo"
                etiqueta="Correo electronico:"
                tipo="email"
                valor={correo}
                onChange={setCorreo}
                maxLength={100}
                autoComplete="email"
                placeholder="nombre@correo.cl"
            />

            <label htmlFor="contactoMensaje">
                Comentario:
            </label>

            <textarea
                id="contactoMensaje"
                name="mensaje"
                rows={5}
                maxLength={500}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Escribe aqui tu consulta"
                required
            />

            <CampoFormulario
                id="contactoClaveEnvio"
                etiqueta="Contraseña para enviar la consulta:"
                tipo="password"
                valor={clave}
                onChange={setClave}
                minLength={4}
                maxLength={10}
                autoComplete="current-password"
                placeholder="Ingresa tu contraseña"
            />

            <button
                type="submit"
                className="btn-principal"
                disabled={enviando}
            >
                {enviando ? "Enviando..." : "Enviar Mensaje"}
            </button>

            {mensaje && (
                <p
                    className={`mensaje-formulario mensaje-${tipoMensaje}`}
                    role={tipoMensaje === "error" ? "alert" : "status"}
                >
                    {mensaje}
                </p>
            )}
        </form>
    );
}

export default FormularioContacto;