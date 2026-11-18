import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {cleanup,fireEvent,render,screen,within} from "@testing-library/react";
import {MemoryRouter,Route,Routes} from "react-router-dom";
import Farmacia from "../paginas/Farmacia";
import {crearPedidoServidor,obtenerProductosServidor} from "../datos/farmaciaApi";
import type {ProductoServidor} from "../datos/farmaciaApi";
import type {Sesion} from "../datos/usuarios";

vi.mock("../datos/farmaciaApi",() => ({
  obtenerProductosServidor: vi.fn(),
  crearPedidoServidor: vi.fn()
}));

const sesionCliente: Sesion = {
  rut: "123456785",
  nombre: "Francisco",
  apellidos: "Prueba",
  correo: "cliente@gmail.com",
  rol: "cliente"
};

const productosPrueba: ProductoServidor[] = [
  {
    id: "FM001",
    nombre: "Producto Higiene",
    categoria: "Higiene",
    precio: 10000,
    precioAnterior: 15000,
    stock: 2,
    imagen: "/img/farmacia/higiene.png",
    requiereReceta: false
  },
  {
    id: "FM002",
    nombre: "Producto Suplemento",
    categoria: "Suplementos",
    precio: 8000,
    precioAnterior: null,
    stock: 5,
    imagen: "/img/farmacia/suplemento.png",
    requiereReceta: false
  },
  {
    id: "FM003",
    nombre: "Producto Recetado",
    categoria: "Medicamentos",
    precio: 12000,
    precioAnterior: null,
    stock: 4,
    imagen: "/img/farmacia/recetado.png",
    requiereReceta: true
  },
  {
    id: "FM004",
    nombre: "Producto Agotado",
    categoria: "Medicamentos",
    precio: 5000,
    precioAnterior: null,
    stock: 0,
    imagen: "/img/farmacia/agotado.png",
    requiereReceta: false
  }
];

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  sessionStorage.clear();

  vi.mocked(obtenerProductosServidor).mockResolvedValue(
    productosPrueba.map((producto) => ({...producto}))
  );
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

function mostrarFarmacia(sesion: Sesion | null = sesionCliente) {
  return render(
    <MemoryRouter initialEntries={["/farmacia"]}>
      <Routes>
        <Route
          path="/farmacia"
          element={<Farmacia sesion={sesion} />}
        />

        <Route
          path="/login"
          element={<h1>Pagina Login</h1>}
        />
      </Routes>
    </MemoryRouter>
  );
}

function obtenerTarjeta(nombre: string): HTMLElement {
  const titulo = screen.getByRole("heading",{
    name: nombre
  });

  const tarjeta = titulo.closest("article");

  if (!tarjeta) {
    throw new Error("No se encontro la tarjeta del producto");
  }

  return tarjeta;
}

function obtenerCarrito() {
  return screen.getByRole("complementary",{
    name: "Carrito de compras"
  });
}

describe("Permisos de Farmacia",() => {
  it("permite que un visitante consulte el catalogo",async () => {
    mostrarFarmacia(null);

    expect(
      await screen.findByRole("heading",{
        name: "Producto Higiene"
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading",{
        name: "Farmacia Veterinaria San Marcos"
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button",{
        name: "Confirmar compra de prueba"
      })
    ).toBeDisabled();

    expect(obtenerProductosServidor).toHaveBeenCalledTimes(1);
    expect(crearPedidoServidor).not.toHaveBeenCalled();
  });
});

describe("Carrito de compras",() => {
  it("permite agregar un producto al carrito",async () => {
    mostrarFarmacia();

    await screen.findByRole("heading",{
      name: "Producto Higiene"
    });

    fireEvent.click(
      within(obtenerTarjeta("Producto Higiene")).getByRole(
        "button",{
          name: "Agregar al carrito"
        }
      )
    );

    expect(
      screen.getByRole("status")
    ).toHaveTextContent(
      "Producto Higiene agregado al carrito"
    );

    expect(
      within(obtenerCarrito()).getByText("1 x $10.000")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button",{
        name: "Confirmar compra de prueba"
      })
    ).toBeEnabled();

    expect(crearPedidoServidor).not.toHaveBeenCalled();
  });
});