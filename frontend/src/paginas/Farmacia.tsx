import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import type { Sesion } from "../datos/usuarios";
import type { ProductoFarmacia } from "../datos/productosFarmacia";

import {
  obtenerProductosFarmacia,
  guardarProductosFarmacia
} from "../datos/productosFarmacia";

interface FarmaciaProps {
  sesion: Sesion | null;
}

interface ProductoCarrito {
  id: string;
  cantidad: number;
}

function formatearPrecio(precio: number): string {
  return `$${precio.toLocaleString("es-CL")}`;
}

function Farmacia({ sesion }: FarmaciaProps) {
  const navigate = useNavigate();

  const [productos, setProductos] = useState<ProductoFarmacia[]>(
    obtenerProductosFarmacia
  );

  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [mensaje, setMensaje] = useState("");

  const categorias = [
    "Todas",
    ...new Set(
      productos.map((producto) => producto.categoria)
    )
  ];

  const productosFiltrados = productos.filter((producto) => {
    const coincideNombre = producto.nombre
      .toLowerCase()
      .includes(busqueda.trim().toLowerCase());

    const coincideCategoria =
      categoria === "Todas" ||
      producto.categoria === categoria;

    return coincideNombre && coincideCategoria;
  });

  const detalleCarrito = carrito.flatMap((item) => {
    const producto = productos.find(
      (actual) => actual.id === item.id
    );

    return producto
      ? [{ producto, cantidad: item.cantidad }]
      : [];
  });

  const totalCarrito = detalleCarrito.reduce(
    (total, item) =>
      total + item.producto.precio * item.cantidad,
    0
  );

  function agregarAlCarrito(producto: ProductoFarmacia) {

    if (!sesion) {
      const confirmar = window.confirm(
        "Debes iniciar sesion o registrarte para agregar productos al carrito ¿Deseas ir a iniciar sesion?"
      );

      if (confirmar) {
        localStorage.setItem(
          "destinoSanMarcos",
          "/farmacia"
        );

        navigate("/login");
      }

      return;
    }

    if (sesion.rol !== "cliente") {
      setMensaje(
        "Solo los clientes pueden realizar compras de prueba."
      );
      return;
    }

    if (producto.requiereReceta) {
      setMensaje(
        "Este producto requiere validacion de receta."
      );
      return;
    }

    const cantidadActual = carrito.find(
      (item) => item.id === producto.id
    )?.cantidad ?? 0;

    if (cantidadActual >= producto.stock) {
      setMensaje(
        "No hay mas unidades disponibles de este producto."
      );
      return;
    }

    if (cantidadActual === 0) {
      setCarrito([
        ...carrito,
        {
          id: producto.id,
          cantidad: 1
        }
      ]);
    } else {
      setCarrito(
        carrito.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1
              }
            : item
        )
      );
    }

    setMensaje(
      `${producto.nombre} agregado al carrito.`
    );
  }

  function quitarDelCarrito(id: string) {
    setCarrito(
      carrito.flatMap((item) => {
        if (item.id !== id) {
          return [item];
        }

        if (item.cantidad > 1) {
          return [
            {
              ...item,
              cantidad: item.cantidad - 1
            }
          ];
        }

        return [];
      })
    );

    setMensaje("");
  }

  function confirmarCompra() {
    if (!sesion || sesion.rol !== "cliente") {
      setMensaje(
        "Debes iniciar sesion como cliente."
      );
      return;
    }

    if (carrito.length === 0) {
      setMensaje("El carrito esta vacio.");
      return;
    }

    // Consultar nuevamente el inventario guardado

    const inventarioActual = obtenerProductosFarmacia();

    const sinDisponibilidad = carrito.some((item) => {
      const producto = inventarioActual.find(
        (actual) => actual.id === item.id
      );

      return (
        !producto ||
        producto.requiereReceta ||
        producto.stock < item.cantidad
      );
    });

    if (sinDisponibilidad) {
      setProductos(inventarioActual);

      setMensaje(
        "El inventario cambio. Revisa las cantidades del carrito"
      );

      return;
    }

    // Confirmar la compra simulada

    const aceptada = window.confirm(
      "¿Confirmas esta compra de prueba? Se descontara stock, pero no se realizara ningun pago"
    );

    if (!aceptada) {
      return;
    }

    // Descontar las unidades compradas del inventario

    const inventarioActualizado = inventarioActual.map(
      (producto) => {
        const cantidad = carrito.find(
          (item) => item.id === producto.id
        )?.cantidad ?? 0;

        return {
          ...producto,
          stock: producto.stock - cantidad
        };
      }
    );

    guardarProductosFarmacia(inventarioActualizado);

    setProductos(inventarioActualizado);
    setCarrito([]);

    setMensaje(
      "Compra de prueba registrada y stock actualizado."
    );
  }

  // Restringir el acceso del administrador y recepcionista

  if (sesion && sesion.rol !== "cliente") {
    return (
      <main className="contenedor-principal">
        <h1>Acceso restringido</h1>

        <p>
          La farmacia esta disponible solamente
          para visitantes y clientes de la veterinaria.
        </p>

        <p>
          Para gestionar productos, precios y existencias,
          utiliza la seccion Inventario
        </p>

        <Link to="/inventario-farmacia">
          Ir al Inventario
        </Link>
      </main>
    );
  }

  return (
    <main className="farmacia-pagina">

      <header className="farmacia-titulo">
        <h1>Farmacia Veterinaria San Marcos</h1>

        <p>
          Revisa nuestros productos, precios y disponibilidad
          Catalogo de demostracion sin pagos reales
        </p>
      </header>

      <div className="farmacia-layout">

        <section
          className="farmacia-catalogo"
          aria-label="Productos de farmacia"
        >

          <div className="farmacia-filtros">

            <div>
              <label htmlFor="buscarFarmacia">
                Buscar producto
              </label>

              <input
                id="buscarFarmacia"
                type="search"
                value={busqueda}
                onChange={(evento) =>
                  setBusqueda(evento.target.value)
                }
                placeholder="Ej: dental, gato, suplemento"
              />
            </div>

            <div>
              <label htmlFor="categoriaFarmacia">
                Categoria
              </label>

              <select
                id="categoriaFarmacia"
                value={categoria}
                onChange={(evento) =>
                  setCategoria(evento.target.value)
                }
              >
                {categorias.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <p className="farmacia-cantidad">
            {productosFiltrados.length} productos encontrados
          </p>

          <div className="farmacia-grid">

            {productosFiltrados.map((producto) => {
              const enCarrito = carrito.find(
                (item) => item.id === producto.id
              )?.cantidad ?? 0;

              const disponibles =
                producto.stock - enCarrito;

              const descuento =
                producto.precioAnterior &&
                producto.precioAnterior > producto.precio
                  ? Math.round(
                      (
                        1 -
                        producto.precio /
                        producto.precioAnterior
                      ) * 100
                    )
                  : null;

              return (
                <article
                  className="farmacia-tarjeta"
                  key={producto.id}
                >

                  <div className="farmacia-foto">

                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      onError={(evento) => {
                        evento.currentTarget.style.display = "none";
                      }}
                    />

                    {descuento !== null && (
                      <span className="farmacia-descuento">
                        -{descuento}%
                      </span>
                    )}

                  </div>

                  <div className="farmacia-informacion">

                    <span className="farmacia-categoria">
                      {producto.categoria}
                    </span>

                    <h2>
                      {producto.nombre}
                    </h2>

                    <div className="farmacia-precios">

                      {producto.precioAnterior && (
                        <span className="farmacia-precio-anterior">
                          {formatearPrecio(
                            producto.precioAnterior
                          )}
                        </span>
                      )}

                      <strong>
                        {formatearPrecio(producto.precio)}
                      </strong>

                    </div>

                    <p
                      className={
                        producto.stock === 0
                          ? "farmacia-stock agotado"
                          : "farmacia-stock"
                      }
                    >
                      {producto.stock === 0
                        ? "Sin stock"
                        : `Stock disponible: ${producto.stock}`}
                    </p>

                    {producto.requiereReceta ? (
                      <>
                        <span className="farmacia-receta">
                          Requiere receta
                        </span>

                        <button
                          type="button"
                          disabled
                        >
                          Compra no disponible
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={disponibles <= 0}
                        onClick={() =>
                          agregarAlCarrito(producto)
                        }
                      >
                        {disponibles <= 0
                          ? "Sin unidades disponibles"
                          : "Agregar al carrito"}
                      </button>
                    )}

                  </div>

                </article>
              );
            })}

          </div>

          {productosFiltrados.length === 0 && (
            <p>
              No se encontraron productos para esa busqueda
            </p>
          )}

        </section>

        <aside
          className="farmacia-carrito"
          aria-label="Carrito de compras"
        >

          <h2>Mi carrito</h2>

          <p>Compra simulada</p>

          {detalleCarrito.length === 0 ? (
            <p>Tu carrito esta vacio</p>
          ) : (
            <ul>

              {detalleCarrito.map((item) => (
                <li key={item.producto.id}>

                  <strong>
                    {item.producto.nombre}
                  </strong>

                  <div className="farmacia-carrito-fila">

                    <span>
                      {item.cantidad} x{" "}
                      {formatearPrecio(
                        item.producto.precio
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        quitarDelCarrito(
                          item.producto.id
                        )
                      }
                      aria-label={
                        `Quitar una unidad de ${item.producto.nombre}`
                      }
                    >
                      Quitar 1
                    </button>

                  </div>

                </li>
              ))}

            </ul>
          )}

          <div className="farmacia-total">
            <span>Total</span>

            <strong>
              {formatearPrecio(totalCarrito)}
            </strong>
          </div>

          <button
            type="button"
            className="farmacia-comprar"
            disabled={
              carrito.length === 0 ||
              sesion?.rol !== "cliente"
            }
            onClick={confirmarCompra}
          >
            Confirmar compra de prueba
          </button>

          {sesion?.rol !== "cliente" && (
            <p>
              Solo los clientes registrados pueden comprar
            </p>
          )}

          <p className="farmacia-nota">
            Los productos que requieren receta no pueden comprarse desde este prototipo
          </p>

          {sesion?.rol === "cliente" && (
            <Link to="/contacto">
              Consultar a la veterinaria
            </Link>
          )}

        </aside>

      </div>

      {mensaje && (
        <p
          className="farmacia-mensaje"
          role="status"
        >
          {mensaje}
        </p>
      )}

    </main>
  );
}

export default Farmacia;