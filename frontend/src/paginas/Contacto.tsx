import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import FormularioContacto from "../componentes/organismos/FormularioContacto";
import type { Sesion } from "../datos/usuarios";

interface ContactoProps {
  sesion: Sesion | null;
}

function Contacto({ sesion }: ContactoProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!sesion) {
      navigate("/login", {
        replace: true,
        state: {
          destino: "/contacto"
        }
      });
    }
  }, [sesion, navigate]);

  if (!sesion) {
    return null;
  }

  if (sesion.rol !== "cliente") {
    return (
      <main className="contenedor-principal">
        <h1>Acceso restringido</h1>

        <p>
          Esta seccion esta disponible solamente para los clientes de la veterinaria
        </p>
      </main>
    );
  }

  return (
    <main className="contenedor-formulario">
      <section>
        <h1>Envianos tu consulta</h1>

        <FormularioContacto sesion={sesion} />
      </section>
    </main>
  );
}

export default Contacto;