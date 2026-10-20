import Input from "../atomos/Input";

interface CampoFormularioProps {
  id: string;
  etiqueta: string;
  tipo: "text" | "email" | "password";
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  maxLength?: number;
}

function CampoFormulario({
  id,
  etiqueta,
  tipo,
  valor,
  onChange,
  placeholder,
  autoComplete,
  minLength,
  maxLength
}: CampoFormularioProps) {
  return (
    <>
      <label htmlFor={id}>{etiqueta}</label>

      <Input
        id={id}
        name={id}
        type={tipo}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        maxLength={maxLength}
        required
      />
    </>
  );
}

export default CampoFormulario;