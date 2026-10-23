import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {cleanup,fireEvent,render,screen,within} from "@testing-library/react";
import {MemoryRouter,Route,Routes} from "react-router-dom";
import Farmacia from "../paginas/Farmacia";
import {guardarProductosFarmacia} from "../datos/productosFarmacia";
import type {ProductoFarmacia} from "../datos/productosFarmacia";
import type {Sesion} from "../datos/usuarios";

const sesionCliente: Sesion = {
  rut: "123456785",
  nombre: "Francisco",
  apellidos: "Prueba",
  correo: "cliente@gmail.com",
  rol: "cliente"
};

const productoLibre: ProductoFarmacia = {
  id: "FMTEST1",
  nombre: "Producto Higiene",
  categoria: "Higiene",
  precio: 10000,
  precioAnterior: 15000,
  stock: 2,
  imagen: "/img/farmacia/higiene.png",
  requiereReceta: false
};

const productoSuplemento: ProductoFarmacia = {
  id: "FMTEST2",
  nombre: "Producto Suplemento",
  categoria: "Suplementos",
  precio: 8000,
  stock: 5,
  imagen: "/img/farmacia/suplemento.png",
  requiereReceta: false
};

const productoReceta: ProductoFarmacia = {
  id: "FMTEST3",
  nombre: "Producto Recetado",
  categoria: "Medicamentos",
  precio: 12000,
  stock: 4,
  imagen: "/img/farmacia/recetado.png",
  requiereReceta: true
};

const productoAgotado: ProductoFarmacia = {
  id: "FMTEST4",
  nombre: "Producto Agotado",
  categoria: "Medicamentos",
  precio: 5000,
  stock: 0,
  imagen: "/img/farmacia/agotado.png",
  requiereReceta: false
};

const productosPrueba: ProductoFarmacia[] = [
  productoLibre,
  productoSuplemento,
  productoReceta,
  productoAgotado
];

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

function mostrarFarmacia(
  sesion: Sesion | null = sesionCliente,
  productos: ProductoFarmacia[] = productosPrueba
) {
  guardarProductosFarmacia(productos);

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

function obtenerTarjeta(
  nombre: string
): HTMLElement {
  const titulo = screen.getByRole("heading", {
    name: nombre
  });

  const tarjeta = titulo.closest("article");

  if (!tarjeta) {
    throw new Error("No se encontro la tarjeta del producto");
  }

  return tarjeta;
}

function obtenerCarrito() {
  return screen.getByRole("complementary", {
    name: "Carrito de compras"
  });
}

function agregarProducto(
  nombre: string
) {
  fireEvent.click(
    within(obtenerTarjeta(nombre)).getByRole(
      "button",
      {name: "Agregar al carrito"}
    )
  );
}

describe("Permisos de Farmacia", () => {

  it("permite que un visitante consulte el catalogo", () => {
    mostrarFarmacia(null);

    expect(
      screen.getByRole("heading", {
        name: "Farmacia Veterinaria San Marcos"
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Producto Higiene"
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Confirmar compra de prueba"
      })
    ).toBeDisabled();
  });

});

describe("Carrito de compras", () => {

  it("permite agregar un producto al carrito", () => {
    mostrarFarmacia();

    agregarProducto("Producto Higiene");

    expect(
      screen.getByRole("status")
    ).toHaveTextContent(
      "Producto Higiene agregado al carrito"
    );

    expect(
      within(obtenerCarrito()).getByText("1 x $10.000")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Confirmar compra de prueba"
      })
    ).toBeEnabled();
  });

});