import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {cleanup,fireEvent,render,screen} from "@testing-library/react";
import InventarioFarmacia from "../paginas/InventarioFarmacia";
import {guardarProductosFarmacia,obtenerProductosFarmacia} from "../datos/productosFarmacia";
import type {ProductoFarmacia} from "../datos/productosFarmacia";
import type {Sesion} from "../datos/usuarios";

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

const productoPrueba: ProductoFarmacia = {
  id: "FMTEST1",
  nombre: "Producto Prueba",
  categoria: "Medicamentos",
  precio: 10000,
  precioAnterior: 15000,
  stock: 5,
  imagen: "/img/farmacia/prueba.png",
  requiereReceta: false
};

const segundoProducto: ProductoFarmacia = {
  id: "FMTEST2",
  nombre: "Suplemento Prueba",
  categoria: "Suplementos",
  precio: 8000,
  stock: 12,
  imagen: "/img/farmacia/suplemento.png",
  requiereReceta: true
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

function mostrarInventario(
  sesion: Sesion | null = sesionRecepcionista,
  productos: ProductoFarmacia[] = [
    productoPrueba,
    segundoProducto
  ]
) {
  guardarProductosFarmacia(productos);

  return render(
    <InventarioFarmacia sesion={sesion} />
  );
}

function cambiarCampo(
  etiqueta: string,
  valor: string
) {
  fireEvent.change(
    screen.getByLabelText(etiqueta),
    {
      target: {value: valor}
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
}

function enviarProducto() {
  const boton = screen.getByRole("button", {
    name: /^(Agregar producto|Guardar cambios)$/
  });

  const formulario = boton.closest("form");

  if (!formulario) {
    throw new Error("No se encontro el formulario");
  }

  fireEvent.submit(formulario);
}

describe("Permisos de Inventario de Farmacia", () => {

  it("impide acceder con una cuenta de cliente", () => {
    mostrarInventario(sesionCliente);

    expect(
      screen.getByText(
        /Esta seccion esta disponible solamente para administradores y recepcionistas/
      )
    ).toBeInTheDocument();
  });

});

describe("Listado de productos de Farmacia", () => {

  it("muestra los productos registrados", () => {
    mostrarInventario();

    expect(
      screen.getByText("Producto Prueba")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Suplemento Prueba")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Productos encontrados: 2")
    ).toBeInTheDocument();
  });

  it("filtra productos por nombre", () => {
    mostrarInventario();

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

  it("filtra productos por categoria", () => {
    mostrarInventario();

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

describe("Registro de productos", () => {

  it("rechaza un formulario con campos vacios", () => {
    mostrarInventario();

    enviarProducto();

    expect(
      screen.getByRole("status")
    ).toHaveTextContent(
      "Debes completar los campos obligatorios"
    );
  });

  it("agrega correctamente un nuevo producto", () => {
    mostrarInventario();

    completarProducto();

    enviarProducto();

    expect(
      screen.getByRole("status")
    ).toHaveTextContent(
      "Producto agregado correctamente"
    );

    const productos = obtenerProductosFarmacia();

    expect(productos).toHaveLength(3);

    expect(productos).toContainEqual(
      expect.objectContaining({
        nombre: "Nuevo Producto",
        categoria: "Higiene",
        precio: 12000,
        stock: 8,
        imagen: "/img/farmacia/nuevo.png",
        requiereReceta: false
      })
    );
  });

});

describe("Edicion de productos", () => {

  it("guarda correctamente los cambios de un producto", () => {
    mostrarInventario(
      sesionRecepcionista,
      [productoPrueba]
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Editar"
      })
    );

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

    enviarProducto();

    expect(
      obtenerProductosFarmacia()[0]
    ).toMatchObject({
      id: "FMTEST1",
      nombre: "Producto Actualizado",
      precio: 11000,
      stock: 9
    });

    expect(
      screen.getByRole("status")
    ).toHaveTextContent(
      "Producto actualizado correctamente"
    );
  });

});

describe("Eliminacion de productos", () => {

  it("elimina correctamente un producto", () => {
    vi.spyOn(
      window,
      "confirm"
    ).mockReturnValue(true);

    mostrarInventario(
      sesionRecepcionista,
      [productoPrueba]
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Eliminar"
      })
    );

    expect(obtenerProductosFarmacia()).toEqual([]);

    expect(
      screen.getByRole("status")
    ).toHaveTextContent(
      "Producto eliminado correctamente"
    );

    expect(
      screen.getByText("Productos encontrados: 0")
    ).toBeInTheDocument();
  });

});