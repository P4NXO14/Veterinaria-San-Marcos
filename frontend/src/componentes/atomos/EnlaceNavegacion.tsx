import { Link } from "react-router-dom";

interface EnlaceNavegacionProps {
  destino: string;
  texto: string;
}

function EnlaceNavegacion({
  destino,
  texto
}: EnlaceNavegacionProps) {
  return (
    <Link to={destino}>
      {texto}
    </Link>
  );
}

export default EnlaceNavegacion;