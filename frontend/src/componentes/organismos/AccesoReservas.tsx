import {useState} from "react";
import type {FormEvent,ReactNode} from "react";
import {guardarCredencialesReservas,limpiarCredencialesReservas,obtenerCitasServidor,obtenerTodasCitasServidor} from "../../datos/citasApi";
import type {Sesion} from "../../datos/usuarios";

interface AccesoReservasProps {
sesion: Sesion | null;
tipo: "cliente" | "personal";
children: ReactNode;
}

function AccesoReservas({sesion,tipo,children}: AccesoReservasProps) {
const [clave,setClave] = useState("");
const [correoAutorizado,setCorreoAutorizado] = useState("");
const [verificando,setVerificando] = useState(false);
const [error,setError] = useState("");

const esCliente = tipo === "cliente";
const tienePermiso = esCliente
    ? sesion?.rol === "cliente"
    : sesion?.rol === "admin" || sesion?.rol === "recepcionista";
const autorizado = tienePermiso && correoAutorizado === sesion?.correo;

async function ingresar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!sesion || !tienePermiso || verificando) {
    return;
    }

    if (!clave.trim()) {
    setError("Debes ingresar tu contraseña para continuar");
    return;
    }

    setVerificando(true);
    setError("");
    guardarCredencialesReservas(sesion.correo,clave);

    try {
    if (esCliente) {
        await obtenerCitasServidor(sesion.correo);
    } else {
        await obtenerTodasCitasServidor();
    }

    setCorreoAutorizado(sesion.correo);
    setClave("");
    } catch (fallo) {
    limpiarCredencialesReservas();
    setError(
        fallo instanceof Error
        ? fallo.message
        : "No se pudo autorizar el acceso a Reservas"
    );
    } finally {
    setVerificando(false);
    }
}

if (!tienePermiso || autorizado) {
    return <>{children}</>;
}

return (
    <main className="contenedor-principal">
    <h1>{esCliente ? "Acceso a Mis Citas" : "Acceso a Recepcion"}</h1>

    <p>
        Ingresa tu contraseña para {esCliente
        ? "solicitar y consultar tus citas"
        : "gestionar las citas de la veterinaria"}
    </p>

    <form
        className="mb-3"
        onSubmit={(evento) => {void ingresar(evento);}}
    >
        <label htmlFor="claveAccesoReservas" className="form-label">
        Contraseña de tu cuenta
        </label>

        <div className="d-flex flex-wrap gap-2">
        <input
            id="claveAccesoReservas"
            type="password"
            className="form-control"
            style={{maxWidth: "300px"}}
            autoComplete="current-password"
            placeholder="Ingresa tu contraseña"
            value={clave}
            onChange={(evento) => {
            setClave(evento.target.value);
            setError("");
            }}
            disabled={verificando}
        />

        <button
            type="submit"
            className="btn btn-primary"
            disabled={verificando}
        >
            {verificando
            ? "Verificando"
            : esCliente
                ? "Ingresar a Mis Citas"
                : "Ingresar a Recepcion"}
        </button>
        </div>
    </form>

    {error && (
        <p
        className="mensaje-formulario mensaje-error"
        role="alert"
        >
        {error}
        </p>
    )}
    </main>
);
}

export default AccesoReservas;