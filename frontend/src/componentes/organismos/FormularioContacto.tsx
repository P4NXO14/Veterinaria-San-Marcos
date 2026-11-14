import {useState} from "react";
import type {FormEvent} from "react";
import CampoFormulario from "../moleculas/CampoFormulario";
import {guardarMensajeContacto} from "../../datos/mensajesContacto";
import type {Sesion} from "../../datos/usuarios";

interface FormularioContactoProps {
    sesion: Sesion;
}

function FormularioContacto({sesion}: FormularioContactoProps) {
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [comentario, setComentario] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState<"error" | "exito">("error");
    const [enviando, setEnviando] = useState(false);

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
            mostrarError("Error: El nombre es obligatorio y admite hasta 100 caracteres.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio) || correoLimpio.length > 100) {
            mostrarError("Error: Ingresa un correo valido de hasta 100 caracteres.");
            return;
        }

        if (comentarioLimpio === "" || comentarioLimpio.length > 500) {
            mostrarError("Error: El mensaje es obligatorio y admite hasta 500 caracteres.");
            return;
        }

        setEnviando(true);
        setMensaje("");

        try {
            await guardarMensajeContacto({
                nombre: nombreLimpio,
                correo: correoLimpio,
                comentario: comentarioLimpio,
                correoCuenta: sesion.correo
            });

            setMensaje("Mensaje enviado correctamente a recepcion.");
            setTipoMensaje("exito");
            setNombre("");
            setCorreo("");
            setComentario("");
        } catch {
            mostrarError("Error: No se pudo guardar el mensaje.");
        } finally {
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

            <button type="submit" className="btn-principal" disabled={enviando}>
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