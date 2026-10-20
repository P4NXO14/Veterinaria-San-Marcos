export function validarRUT(rut: string): boolean {
  if (!/^[0-9]+[0-9kK]{1}$/.test(rut)) {
    return false;
  }

  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1).toUpperCase();

  let suma = 0;
  let multiplo = 2;

  for (let i = 1; i <= cuerpo.length; i++) {
    suma += multiplo * Number(cuerpo.charAt(cuerpo.length - i));
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  let dvEsperado: string;
  const resultado = 11 - (suma % 11);

  if (resultado === 11) {
    dvEsperado = "0";
  } else if (resultado === 10) {
    dvEsperado = "K";
  } else {
    dvEsperado = resultado.toString();
  }

  return dvEsperado === dv;
}