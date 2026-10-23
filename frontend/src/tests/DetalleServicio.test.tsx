import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {cleanup,render,screen} from "@testing-library/react";
import {MemoryRouter,Route,Routes} from "react-router-dom";
import DetalleServicio from "../paginas/DetalleServicio";
import type {Sesion} from "../datos/usuarios";

const sesionCliente: Sesion = {
  rut: "123456785",
  nombre: "Francisco",
  apellidos: "Prueba",
  correo: "cliente@gmail.com",
  rol: "cliente"
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  vi.restoreAllMocks();
});

function mostrarDetalle(
  id: string | null = "SV001",
  sesion: Sesion | null = sesionCliente
) {
  const ruta = id
    ? `/servicios/${id}`
    : "/servicios";

  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route
          path="/servicios"
          element={<DetalleServicio sesion={sesion} />}
        />

        <Route
          path="/servicios/:id"
          element={<DetalleServicio sesion={sesion} />}
        />

        <Route
          path="/login"
          element={<h1>Pagina Login</h1>}
        />

        <Route
          path="/reserva"
          element={<h1>Pagina Reservas</h1>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("Servicios inexistentes", () => {

  it("muestra un aviso para un servicio inexistente", () => {
    mostrarDetalle("INVALIDO");

    expect(
      screen.getByRole("heading", {
        name: "Servicio no encontrado"
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "El servicio solicitado no existe en nuestro catalogo"
      )
    ).toBeInTheDocument();
  });

});