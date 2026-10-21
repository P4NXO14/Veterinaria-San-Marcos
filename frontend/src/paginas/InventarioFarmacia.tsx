import { useState } from "react";
import type { FormEvent } from "react";

import type { Sesion } from "../datos/usuarios";
import type { ProductoFarmacia } from "../datos/productosFarmacia";

import {
  obtenerProductosFarmacia,
  agregarProductoFarmacia,
  editarProductoFarmacia,
  eliminarProductoFarmacia
} from "../datos/productosFarmacia";

interface InventarioFarmaciaProps {
  sesion: Sesion | null;
}

interface DatosFormulario {
  nombre: string;
  categoria: string;
  precio: string;
  precioAnterior: string;
  stock: string;
  imagen: string;
  requiereReceta: boolean;
}

const formularioInicial: DatosFormulario = {
  nombre: "",
  categoria: "Medicamentos",
  precio: "",
  precioAnterior: "",
  stock: "",
  imagen: "",
  requiereReceta: false
};

function formatearPrecio(precio: number): string {
  return `$${precio.toLocaleString("es-CL")}`;
}

function InventarioFarmacia({
  sesion
}: InventarioFarmaciaProps) {

  const [productos, setProductos] = useState<ProductoFarmacia[]>(
    obtenerProductosFarmacia
  );

  const [busqueda, setBusqueda] = useState("");
  const [formulario, setFormulario] = useState<DatosFormulario>({
    ...formularioInicial
  });

  const [idEditando, setIdEditando] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");

  const esPersonal =
    sesion?.rol === "admin" ||
    sesion?.rol === "recepcionista";

  const productosFiltrados = productos.filter((producto) => {
    const texto = busqueda.toLowerCase().trim();

    return (
      producto.nombre.toLowerCase().includes(texto) ||
      producto.categoria.toLowerCase().includes(texto) ||
      producto.id.toLowerCase().includes(texto)
    );
  });

  function actualizarListado() {
    setProductos(obtenerProductosFarmacia());
  }

  function actualizarCampo(
    campo: keyof DatosFormulario,
    valor: string | boolean
  ) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor
    }));

    setMensaje("");
  }

  function limpiarFormulario() {
    setFormulario({ ...formularioInicial });
    setIdEditando(null);
  }

  function editar(producto: ProductoFarmacia) {
    setIdEditando(producto.id);

    setFormulario({
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: String(producto.precio),
      precioAnterior:
        producto.precioAnterior !== undefined
          ? String(producto.precioAnterior)
          : "",
      stock: String(producto.stock),
      imagen: producto.imagen,
      requiereReceta: producto.requiereReceta
    });

    setMensaje("");
  }

  function guardarProducto(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!esPersonal) {
      setMensaje("No tienes permisos para modificar el inventario");
      return;
    }

    const precio = Number(formulario.precio);
    const stock = Number(formulario.stock);

    const precioAnterior =
      formulario.precioAnterior.trim() !== ""
        ? Number(formulario.precioAnterior)
        : undefined;

    if (
      !formulario.nombre.trim() ||
      !formulario.categoria.trim() ||
      formulario.precio.trim() === "" ||
      formulario.stock.trim() === ""
    ) {
      setMensaje("Debes completar los campos obligatorios");
      return;
    }

    if (!Number.isFinite(precio) || precio < 0) {
      setMensaje("Ingresa un precio valido");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setMensaje("El stock debe ser un numero entero positivo o cero");
      return;
    }

    if (
      precioAnterior !== undefined &&
      (
        !Number.isFinite(precioAnterior) ||
        precioAnterior <= precio
      )
    ) {
      setMensaje(
        "El precio anterior debe ser mayor al precio actual"
      );
      return;
    }

    const datos = {
      nombre: formulario.nombre.trim(),
      categoria: formulario.categoria.trim(),
      precio,
      precioAnterior,
      stock,
      imagen: formulario.imagen.trim() || "/img/logo.png",
      requiereReceta: formulario.requiereReceta
    };

    let resultado = false;

    if (idEditando) {
      resultado = editarProductoFarmacia(idEditando, datos);
    } else {
      const nuevoProducto: ProductoFarmacia = {
        id: `FM${Date.now()}`,
        ...datos
      };

      resultado = agregarProductoFarmacia(nuevoProducto);
    }

    if (resultado) {
      actualizarListado();
      limpiarFormulario();

      setMensaje(
        idEditando
          ? "Producto actualizado correctamente."
          : "Producto agregado correctamente."
      );
    } else {
      setMensaje("No se pudo guardar el producto.");
    }
  }

  function eliminar(id: string) {
    if (!esPersonal) {
      return;
    }

    const producto = productos.find(
      (item) => item.id === id
    );

    if (!producto) {
      return;
    }

    const confirmar = window.confirm(
      `¿Estas seguro de que deseas eliminar ${producto.nombre}?`
    );

    if (!confirmar) {
      return;
    }

    const resultado = eliminarProductoFarmacia(id);

    if (resultado) {
      actualizarListado();

      if (idEditando === id) {
        limpiarFormulario();
      }

      setMensaje("Producto eliminado correctamente");
    } else {
      setMensaje("No se pudo eliminar el producto");
    }
  }

  if (!esPersonal) {
    return (
      <main className="contenedor-principal">
        <h1>Acceso restringido</h1>
        <p>
          Esta seccion esta disponible solamente para administradores y recepcionistas
        </p>
      </main>
    );
  }

  return (
    <main className="inventario-pagina">

      <section className="inventario-encabezado">
        <h1>Inventario de Farmacia</h1>

        <p>
          Administra los productos, precios y stock de la Farmacia Veterinaria San Marcos
        </p>
      </section>

      {mensaje && (
        <p className="inventario-mensaje" role="status">
          {mensaje}
        </p>
      )}

      <section className="inventario-formulario">
        <h2>
          {idEditando
            ? "Editar producto"
            : "Agregar nuevo producto"}
        </h2>

        <form onSubmit={guardarProducto}>

          <div className="inventario-campos">

            <div>
              <label htmlFor="inventarioNombre">
                Nombre del producto
              </label>

              <input
                id="inventarioNombre"
                type="text"
                value={formulario.nombre}
                onChange={(evento) =>
                  actualizarCampo("nombre", evento.target.value)
                }
                maxLength={120}
                required
              />
            </div>

            <div>
              <label htmlFor="inventarioCategoria">
                Categoria
              </label>

              <select
                id="inventarioCategoria"
                value={formulario.categoria}
                onChange={(evento) =>
                  actualizarCampo("categoria", evento.target.value)
                }
                required
              >
                <option value="Medicamentos">
                  Medicamentos
                </option>

                <option value="Suplementos">
                  Suplementos
                </option>

                <option value="Higiene">
                  Higiene
                </option>

                <option value="Accesorios">
                  Accesorios
                </option>
              </select>
            </div>

            <div>
              <label htmlFor="inventarioPrecio">
                Precio actual ($)
              </label>

              <input
                id="inventarioPrecio"
                type="number"
                min="0"
                step="1"
                value={formulario.precio}
                onChange={(evento) =>
                  actualizarCampo("precio", evento.target.value)
                }
                required
              />
            </div>

            <div>
              <label htmlFor="inventarioPrecioAnterior">
                Precio anterior ($) - opcional
              </label>

              <input
                id="inventarioPrecioAnterior"
                type="number"
                min="0"
                step="1"
                value={formulario.precioAnterior}
                onChange={(evento) =>
                  actualizarCampo(
                    "precioAnterior",
                    evento.target.value
                  )
                }
              />
            </div>

            <div>
              <label htmlFor="inventarioStock">
                Stock disponible
              </label>

              <input
                id="inventarioStock"
                type="number"
                min="0"
                step="1"
                value={formulario.stock}
                onChange={(evento) =>
                  actualizarCampo("stock", evento.target.value)
                }
                required
              />
            </div>

            <div>
              <label htmlFor="inventarioImagen">
                Ruta de la imagen
              </label>

              <input
                id="inventarioImagen"
                type="text"
                value={formulario.imagen}
                onChange={(evento) =>
                  actualizarCampo("imagen", evento.target.value)
                }
                placeholder="/img/farmacia/producto.png"
              />
            </div>

          </div>

          <label className="inventario-checkbox">
            <input
              type="checkbox"
              checked={formulario.requiereReceta}
              onChange={(evento) =>
                actualizarCampo(
                  "requiereReceta",
                  evento.target.checked
                )
              }
            />

            Requiere receta veterinaria
          </label>

          <div className="inventario-acciones">
            <button
              type="submit"
              className="btn-principal"
            >
              {idEditando
                ? "Guardar cambios"
                : "Agregar producto"}
            </button>

            {idEditando && (
              <button
                type="button"
                className="btn-secundario"
                onClick={() => {
                  limpiarFormulario();
                  setMensaje("");
                }}
              >
                Cancelar edicion
              </button>
            )}
          </div>

        </form>
      </section>

      <section className="inventario-listado">

        <h2>Productos registrados</h2>

        <label htmlFor="inventarioBusqueda">
          Buscar producto
        </label>

        <input
          id="inventarioBusqueda"
          type="search"
          value={busqueda}
          onChange={(evento) =>
            setBusqueda(evento.target.value)
          }
          placeholder="Buscar por nombre, categoria o codigo"
        />

        <p>
          Productos encontrados: {productosFiltrados.length}
        </p>

        <div className="inventario-tabla-contenedor">
          <table className="inventario-tabla">

            <thead>
              <tr>
                <th>Imagen</th>
                <th>Codigo</th>
                <th>Producto</th>
                <th>Categoria</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Receta</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {productosFiltrados.map((producto) => (
                <tr key={producto.id}>

                  <td>
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="inventario-imagen"
                    />
                  </td>

                  <td>{producto.id}</td>

                  <td>{producto.nombre}</td>

                  <td>{producto.categoria}</td>

                  <td>
                    {formatearPrecio(producto.precio)}
                  </td>

                  <td>
                    <span
                      className={
                        producto.stock <= 5
                          ? "inventario-stock-bajo"
                          : "inventario-stock-normal"
                      }
                    >
                      {producto.stock}
                    </span>
                  </td>

                  <td>
                    {producto.requiereReceta ? "Si" : "No"}
                  </td>

                  <td>
                    <div className="inventario-botones">
                      <button
                        type="button"
                        className="btn-principal"
                        onClick={() => editar(producto)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => eliminar(producto.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        </div>

        {productosFiltrados.length === 0 && (
          <p>No se encontraron productos</p>
        )}

      </section>

    </main>
  );
}

export default InventarioFarmacia;