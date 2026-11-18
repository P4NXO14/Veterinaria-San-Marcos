import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {cleanup,render,screen} from "@testing-library/react";
import {MemoryRouter,Route,Routes} from "react-router-dom";
import {obtenerServicioServidor} from "../datos/catalogoApi";
import DetalleServicio from "../paginas/DetalleServicio";
import type {Sesion} from "../datos/usuarios";

vi.mock("../datos/catalogoApi",() => ({
  obtenerServicioServidor: vi.fn()
}));

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
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

function mostrarDetalle(
  id: string | null = "SV001",
  sesion: Sesion | null = sesionCliente
) {
  const ruta = id ? `/servicios/${id}` : "/servicios";

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

describe("Detalle de servicios",() => {
  it("muestra un aviso para un servicio inexistente",async () => {
    vi.mocked(obtenerServicioServidor).mockRejectedValue(
      new Error("Servicio no encontrado")
    );

    mostrarDetalle("INVALIDO");

    expect(
      await screen.findByRole("heading",{
        name: "Servicio no encontrado"
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent("Servicio no encontrado");
  });

  it("muestra los datos recibidos del microservicio",async () => {
    vi.mocked(obtenerServicioServidor).mockResolvedValue({
      id: "SV001",
      categoria: "Consultas",
      nombre: "Consulta general",
      especie: "Perro / Gato",
      duracion: "30 min",
      precio: 15000,
      obs: "Sin observaciones adicionales",
      imagen: "/img/resto_operaciones.jpg"
    });

    mostrarDetalle("SV001");

    expect(
      await screen.findByRole("heading",{
        name: "Consulta general"
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("$15.000")
    ).toBeInTheDocument();
  });
});