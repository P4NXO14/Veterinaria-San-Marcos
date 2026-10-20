import { Link } from "react-router-dom";
import FormularioLogin from "../componentes/organismos/FormularioLogin";
import type { Sesion } from "../datos/usuarios";

interface LoginProps {
  onIniciarSesion: (sesion: Sesion) => void;
}

function Login({ onIniciarSesion }: LoginProps) {
  return (
    <main>
      <section className="contenedor-formulario pequeño">
        <h1>Iniciar Sesion</h1>

        <p>Ingresa con una cuenta previamente registrada.</p>

        <FormularioLogin onIniciarSesion={onIniciarSesion} />

        <p className="ayuda-formulario">
          ¿No tienes cuenta?{" "}
          <Link to="/registro">Registrate aqui</Link>.
        </p>
      </section>
    </main>
  );
}

export default Login;