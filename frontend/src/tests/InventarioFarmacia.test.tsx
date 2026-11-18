import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {cleanup,fireEvent,render,screen} from "@testing-library/react";
import InventarioFarmacia from "../paginas/InventarioFarmacia";
import {actualizarProductoServidor,crearProductoServidor,eliminarProductoServidor,obtenerProductosServidor} from "../datos/farmaciaApi";
import type {ProductoServidor} from "../datos/farmaciaApi";
import type {Sesion} from "../datos/usuarios";

vi.mock("../datos/farmaciaApi",() => ({
  obtenerProductosServidor: vi.fn(),
  crearProductoServidor: vi.fn(),
  actualizarProductoServidor: vi.fn(),
  eliminarProductoServidor: vi.fn()
}));

const sesionRecepcionista: Sesion = {
  rut: "900000022",
  nombre: "Personal",
  apellidos: "Prueba",
  correo: "personal@sanmarcos.com",
  rol: "recepcionista"
};

const sesionCliente: Sesion = {
  rut: "123456785",
  nombre: "Cliente",
  apellidos: "Prueba",
  correo: "cliente@gmail.com",
  rol: "cliente"
};

const productoPrueba: ProductoServidor = {
  id: "FM001",
  nombre: "Producto Prueba",
  categoria: "Medicamentos",
  precio: 10000,
  precioAnterior: 15000,
  stock: 5,
  imagen: "/img/farmacia/prueba.png",
  requiereReceta: false
};

const segundoProducto: ProductoServidor = {
  id: "FM002",
  nombre: "Suplemento Prueba",
  categoria: "Suplementos",
  precio: 8000,
  precioAnterior: null,
  stock: 12,
  imagen: "/img/farmacia/suplemento.png",
  requiereReceta: true
};

let productosEnServidor: ProductoServidor[] = [];

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();

  Element.prototype.scrollIntoView = vi.fn();

  productosEnServidor = [
    {...productoPrueba},
    {...segundoProducto}
  ];

  vi.mocked(obtenerProductosServidor).mockImplementation(
    async () =>
      productosEnServidor.map((producto) => ({
        ...producto
      }))
  );

  vi.mocked(crearProductoServidor).mockImplementation(
    async (producto) => {
      productosEnServidor = [
        ...productosEnServidor,
        {...producto}
      ];

      return {...producto};
    }
  );

  vi.mocked(actualizarProductoServidor).mockImplementation(
    async (id,producto) => {
      productosEnServidor = productosEnServidor.map(
        (actual) =>
          actual.id === id
            ? {...producto,id}
            : actual
      );

      return {...producto,id};
    }
  );

  vi.mocked(eliminarProductoServidor).mockImplementation(
    async (id) => {
      productosEnServidor = productosEnServidor.filter(
        (producto) => producto.id !== id
      );
    }
  );
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

function mostrarInventario(
  sesion: Sesion | null = sesionRecepcionista,
  productos: ProductoServidor[] = [
    productoPrueba,
    segundoProducto
  ]
) {
  productosEnServidor = productos.map((producto) => ({
    ...producto
  }));

  return render(
    <InventarioFarmacia sesion={sesion} />
  );
}

function cambiarCampo(etiqueta: string,valor: string) {
  fireEvent.change(
    screen.getByLabelText(etiqueta),{
      target: {
        value: valor
      }
    }
  );
}

function completarProducto() {
  cambiarCampo(
    "Nombre del producto",
    "Nuevo Producto"
  );

  cambiarCampo(
    "Categoria",
    "Higiene"
  );

  cambiarCampo(
    "Precio actual ($)",
    "12000"
  );

  cambiarCampo(
    "Stock disponible",
    "8"
  );

  cambiarCampo(
    "Ruta de la imagen",
    "/img/farmacia/nuevo.png"
  );

  cambiarCampo(
    "Contraseña para autorizar cambios",
    "Clave123"
  );
}

function enviarProducto() {
  const boton = screen.getByRole("button",{
    name: /^(Agregar producto|Guardar cambios)$/
  });

  const formulario = boton.closest("form");

  if (!formulario) {
    throw new Error("No se encontro el formulario");
  }

  fireEvent.submit(formulario);
}

describe("Permisos de Inventario de Farmacia",() => {
  it("impide acceder con una cuenta de cliente",() => {
    mostrarInventario(sesionCliente);

    expect(
      screen.getByText(
        /Esta seccion esta disponible solamente para administradores y recepcionistas/
      )
    ).toBeInTheDocument();

    expect(obtenerProductosServidor).not.toHaveBeenCalled();
  });
});

describe("Listado de productos de Farmacia",() => {
  it("muestra los productos registrados",async () => {
    mostrarInventario();

    expect(
      await screen.findByText("Producto Prueba")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Suplemento Prueba")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Productos encontrados: 2")
    ).toBeInTheDocument();

    expect(obtenerProductosServidor).toHaveBeenCalledTimes(1);
  });

  it("filtra productos por nombre",async () => {
    mostrarInventario();

    await screen.findByText("Producto Prueba");

    cambiarCampo(
      "Buscar producto",
      "PRODUCTO PRUEBA"
    );

    expect(
      screen.getByText("Productos encontrados: 1")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Producto Prueba")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Suplemento Prueba")
    ).not.toBeInTheDocument();
  });

  it("filtra productos por categoria",async () => {
    mostrarInventario();

    await screen.findByText("Producto Prueba");

    cambiarCampo(
      "Buscar producto",
      "Suplementos"
    );

    expect(
      screen.getByText("Productos encontrados: 1")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Suplemento Prueba")
    ).toBeInTheDocument();
  });
});

describe("Registro de productos",() => {
  it("rechaza un formulario con campos vacios",async () => {
    mostrarInventario();

    await screen.findByText("Producto Prueba");

    enviarProducto();

    expect(
      screen.getByText("Debes completar los campos obligatorios")
    ).toBeInTheDocument();

    expect(crearProductoServidor).not.toHaveBeenCalled();
  });

  it("agrega correctamente un nuevo producto",async () => {
    mostrarInventario();

    await screen.findByText("Producto Prueba");

    completarProducto();
    enviarProducto();

    expect(
      await screen.findByText("Producto agregado correctamente")
    ).toBeInTheDocument();

    expect(productosEnServidor).toHaveLength(3);

    expect(productosEnServidor).toContainEqual(
      expect.objectContaining({
        id: "FM003",
        nombre: "Nuevo Producto",
        categoria: "Higiene",
        precio: 12000,
        stock: 8,
        imagen: "/img/farmacia/nuevo.png",
        requiereReceta: false
      })
    );

    expect(crearProductoServidor).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "FM003",
        nombre: "Nuevo Producto"
      }),
      {
        correo: "personal@sanmarcos.com",
        password: "Clave123"
      }
    );

    expect(
      screen.getByText("Productos encontrados: 3")
    ).toBeInTheDocument();
  });
});

describe("Edicion de productos",() => {
  it("guarda correctamente los cambios de un producto",async () => {
    mostrarInventario(
      sesionRecepcionista,
      [productoPrueba]
    );

    await screen.findByText("Producto Prueba");

    fireEvent.click(
      screen.getByRole("button",{
        name: "Editar"
      })
    );

    expect(
      screen.getByRole("heading",{
        name: "Editar producto"
      })
    ).toBeInTheDocument();

    cambiarCampo(
      "Nombre del producto",
      "Producto Actualizado"
    );

    cambiarCampo(
      "Precio actual ($)",
      "11000"
    );

    cambiarCampo(
      "Stock disponible",
      "9"
    );

    cambiarCampo(
      "Contraseña para autorizar cambios",
      "Clave123"
    );

    enviarProducto();

    expect(
      await screen.findByText("Producto actualizado correctamente")
    ).toBeInTheDocument();

    expect(productosEnServidor[0]).toMatchObject({
      id: "FM001",
      nombre: "Producto Actualizado",
      precio: 11000,
      stock: 9
    });

    expect(actualizarProductoServidor).toHaveBeenCalledWith(
      "FM001",
      expect.objectContaining({
        nombre: "Producto Actualizado",
        precio: 11000,
        stock: 9
      }),
      {
        correo: "personal@sanmarcos.com",
        password: "Clave123"
      }
    );

    expect(
      screen.getByText("Producto Actualizado")
    ).toBeInTheDocument();
  });
});

describe("Eliminacion de productos",() => {
  it("elimina correctamente un producto",async () => {
    vi.spyOn(window,"confirm").mockReturnValue(true);

    mostrarInventario(
      sesionRecepcionista,
      [productoPrueba]
    );

    await screen.findByText("Producto Prueba");

    fireEvent.click(
      screen.getByRole("button",{
        name: "Eliminar"
      })
    );

    expect(
      screen.getByRole("heading",{
        name: "Confirmar eliminacion de producto"
      })
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("Producto Prueba")
    ).toBeDisabled();

    cambiarCampo(
      "Contraseña para autorizar cambios",
      "Clave123"
    );

    fireEvent.click(
      screen.getByRole("button",{
        name: "Confirmar eliminacion"
      })
    );

    expect(
      await screen.findByText("Producto eliminado correctamente")
    ).toBeInTheDocument();

    expect(eliminarProductoServidor).toHaveBeenCalledWith(
      "FM001",
      {
        correo: "personal@sanmarcos.com",
        password: "Clave123"
      }
    );

    expect(productosEnServidor).toEqual([]);

    expect(
      screen.getByText("Productos encontrados: 0")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Producto Prueba")
    ).not.toBeInTheDocument();
  });
});