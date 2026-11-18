import {useEffect,useState} from "react";
import type {FormEvent} from "react";
import type {Sesion} from "../datos/usuarios";
import {actualizarProductoServidor,crearProductoServidor,eliminarProductoServidor,obtenerProductosServidor} from "../datos/farmaciaApi";
import type {ProductoServidor} from "../datos/farmaciaApi";

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

function generarSiguienteCodigo(productos: ProductoServidor[]): string {
  const maximo = productos.reduce((mayor,producto) => {
    const coincidencia = /^FM(\d{3,8})$/.exec(producto.id);

    if (!coincidencia) {
      return mayor;
    }

    return Math.max(mayor,Number(coincidencia[1]));
  },0);

  return `FM${String(maximo + 1).padStart(3,"0")}`;
}

function InventarioFarmacia({sesion}: InventarioFarmaciaProps) {
  const [productos,setProductos] = useState<ProductoServidor[]>([]);
  const [busqueda,setBusqueda] = useState("");
  const [formulario,setFormulario] = useState<DatosFormulario>({
    ...formularioInicial
  });

  const [idEditando,setIdEditando] = useState<string | null>(null);
  const [idEliminando,setIdEliminando] = useState<string | null>(null);
  const [mensaje,setMensaje] = useState("");
  const [clave,setClave] = useState("");
  const [cargando,setCargando] = useState(true);
  const [procesando,setProcesando] = useState(false);
  const [errorCarga,setErrorCarga] = useState("");

  const esPersonal =
    sesion?.rol === "admin" ||
    sesion?.rol === "recepcionista";

  const revisandoEliminacion = idEliminando !== null;

  useEffect(() => {
    if (!esPersonal) {
      return;
    }

    let activo = true;

    obtenerProductosServidor()
      .then((datos) => {
        if (activo) {
          setProductos(datos);
          setErrorCarga("");
        }
      })
      .catch((error: unknown) => {
        if (activo) {
          setErrorCarga(
            error instanceof Error
              ? error.message
              : "No se pudo cargar el inventario"
          );
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  },[esPersonal]);

  const productosFiltrados = productos.filter((producto) => {
    const texto = busqueda.toLowerCase().trim();

    return (
      producto.nombre.toLowerCase().includes(texto) ||
      producto.categoria.toLowerCase().includes(texto) ||
      producto.id.toLowerCase().includes(texto)
    );
  });

  async function actualizarListado() {
    const datos = await obtenerProductosServidor();
    setProductos(datos);
    setErrorCarga("");
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
    setFormulario({...formularioInicial});
    setIdEditando(null);
    setIdEliminando(null);
    setClave("");
  }

  function cargarDatosProducto(producto: ProductoServidor) {
    setFormulario({
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: String(producto.precio),
      precioAnterior:
        producto.precioAnterior != null
          ? String(producto.precioAnterior)
          : "",
      stock: String(producto.stock),
      imagen: producto.imagen,
      requiereReceta: producto.requiereReceta
    });

    setClave("");
    setMensaje("");
  }

  function editar(producto: ProductoServidor) {
    cargarDatosProducto(producto);
    setIdEditando(producto.id);
    setIdEliminando(null);

    document.querySelector(".inventario-formulario")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function seleccionarEliminar(producto: ProductoServidor) {
    cargarDatosProducto(producto);
    setIdEditando(null);
    setIdEliminando(producto.id);

    document.querySelector(".inventario-formulario")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  async function guardarProducto(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (procesando || revisandoEliminacion) {
      return;
    }

    if (!sesion || !esPersonal) {
      setMensaje("No tienes permisos para modificar el inventario");
      return;
    }

    const precio = Number(formulario.precio);
    const stock = Number(formulario.stock);

    const precioAnterior =
      formulario.precioAnterior.trim() !== ""
        ? Number(formulario.precioAnterior)
        : null;

    if (
      !formulario.nombre.trim() ||
      !formulario.categoria.trim() ||
      formulario.precio.trim() === "" ||
      formulario.stock.trim() === ""
    ) {
      setMensaje("Debes completar los campos obligatorios");
      return;
    }

    if (!Number.isInteger(precio) || precio < 0) {
      setMensaje("Ingresa un precio valido");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setMensaje("El stock debe ser un numero entero positivo o cero");
      return;
    }

    if (
      precioAnterior !== null &&
      (
        !Number.isInteger(precioAnterior) ||
        precioAnterior <= precio
      )
    ) {
      setMensaje("El precio anterior debe ser mayor al precio actual");
      return;
    }

    if (!clave) {
      setMensaje("Ingresa tu contraseña para autorizar el cambio");
      return;
    }

    const editando = idEditando !== null;

    const datos = {
      nombre: formulario.nombre.trim(),
      categoria: formulario.categoria.trim(),
      precio,
      precioAnterior,
      stock,
      imagen: formulario.imagen.trim() || "/img/logo.png",
      requiereReceta: formulario.requiereReceta
    };

    setProcesando(true);
    setMensaje("");

    try {
      const credenciales = {
        correo: sesion.correo,
        password: clave
      };

      if (idEditando !== null) {
        await actualizarProductoServidor(
          idEditando,
          {
            id: idEditando,
            ...datos
          },
          credenciales
        );
      } else {
        const productosActuales = await obtenerProductosServidor();
        const siguienteId = generarSiguienteCodigo(productosActuales);

        await crearProductoServidor(
          {
            id: siguienteId,
            ...datos
          },
          credenciales
        );
      }

      limpiarFormulario();

      try {
        await actualizarListado();

        setMensaje(
          editando
            ? "Producto actualizado correctamente"
            : "Producto agregado correctamente"
        );
      } catch {
        setErrorCarga("No se pudo actualizar el listado, recarga la pagina");
        setMensaje(
          "El producto se guardo en MySQL, pero no se pudo actualizar el listado"
        );
      }
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el producto"
      );
    } finally {
      setClave("");
      setProcesando(false);
    }
  }

  async function confirmarEliminacion() {
    if (procesando || !sesion || !esPersonal || !idEliminando) {
      return;
    }

    const producto = productos.find(
      (item) => item.id === idEliminando
    );

    if (!producto) {
      setMensaje("El producto seleccionado ya no esta disponible");
      return;
    }

    if (!clave) {
      setMensaje("Ingresa tu contraseña para autorizar la eliminacion");
      return;
    }

    const confirmar = window.confirm(
      `¿Confirmas la eliminacion de ${producto.nombre}, codigo ${producto.id}?`
    );

    if (!confirmar) {
      return;
    }

    setProcesando(true);
    setMensaje("");

    try {
      await eliminarProductoServidor(producto.id,{
        correo: sesion.correo,
        password: clave
      });

      limpiarFormulario();

      try {
        await actualizarListado();
        setMensaje("Producto eliminado correctamente");
      } catch {
        setErrorCarga("No se pudo actualizar el listado, recarga la pagina");
        setMensaje(
          "El producto se elimino en MySQL, pero no se pudo actualizar el listado"
        );
      }
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el producto"
      );
    } finally {
      setClave("");
      setProcesando(false);
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

      {cargando && (
        <p className="inventario-mensaje" role="status">
          Cargando inventario desde el servidor
        </p>
      )}

      {errorCarga && (
        <p className="inventario-mensaje" role="alert">
          {errorCarga}
        </p>
      )}

      {mensaje && (
        <p className="inventario-mensaje" role="status">
          {mensaje}
        </p>
      )}

      <section className="inventario-formulario">
        <h2>
          {revisandoEliminacion
            ? "Confirmar eliminacion de producto"
            : idEditando
              ? "Editar producto"
              : "Agregar nuevo producto"}
        </h2>

        {revisandoEliminacion && (
          <p className="inventario-mensaje" role="status">
            Codigo seleccionado: {idEliminando} - Revisa los datos antes de confirmar la eliminacion
          </p>
        )}

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
                  actualizarCampo("nombre",evento.target.value)
                }
                disabled={procesando || revisandoEliminacion}
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
                  actualizarCampo("categoria",evento.target.value)
                }
                disabled={procesando || revisandoEliminacion}
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
                  actualizarCampo("precio",evento.target.value)
                }
                disabled={procesando || revisandoEliminacion}
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
                  actualizarCampo("precioAnterior",evento.target.value)
                }
                disabled={procesando || revisandoEliminacion}
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
                  actualizarCampo("stock",evento.target.value)
                }
                disabled={procesando || revisandoEliminacion}
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
                  actualizarCampo("imagen",evento.target.value)
                }
                disabled={procesando || revisandoEliminacion}
                maxLength={500}
                placeholder="/img/farmacia/producto.png"
              />
            </div>

            <div>
              <label htmlFor="inventarioClave">
                Contraseña para autorizar cambios
              </label>

              <input
                id="inventarioClave"
                type="password"
                value={clave}
                onChange={(evento) =>
                  setClave(evento.target.value)
                }
                autoComplete="current-password"
                disabled={procesando}
                placeholder="Ingresa tu contraseña"
              />
            </div>

          </div>

          <label className="inventario-checkbox">
            <input
              type="checkbox"
              checked={formulario.requiereReceta}
              onChange={(evento) =>
                actualizarCampo("requiereReceta",evento.target.checked)
              }
              disabled={procesando || revisandoEliminacion}
            />

            Requiere receta veterinaria
          </label>

          <div className="inventario-acciones">
            {revisandoEliminacion ? (
              <>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={cargando || procesando || Boolean(errorCarga)}
                  onClick={() => {void confirmarEliminacion();}}
                >
                  {procesando
                    ? "Eliminando producto..."
                    : "Confirmar eliminacion"}
                </button>

                <button
                  type="button"
                  className="btn-secundario"
                  disabled={procesando}
                  onClick={() => {
                    limpiarFormulario();
                    setMensaje("");
                  }}
                >
                  Cancelar eliminacion
                </button>
              </>
            ) : (
              <>
                <button
                  type="submit"
                  className="btn-principal"
                  disabled={cargando || procesando || Boolean(errorCarga)}
                >
                  {idEditando
                    ? "Guardar cambios"
                    : "Agregar producto"}
                </button>

                {idEditando && (
                  <button
                    type="button"
                    className="btn-secundario"
                    disabled={procesando}
                    onClick={() => {
                      limpiarFormulario();
                      setMensaje("");
                    }}
                  >
                    Cancelar edicion
                  </button>
                )}
              </>
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
                        disabled={cargando || procesando}
                        onClick={() => editar(producto)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger"
                        disabled={cargando || procesando}
                        onClick={() => seleccionarEliminar(producto)}
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

        {!cargando && !errorCarga && productosFiltrados.length === 0 && (
          <p>No se encontraron productos</p>
        )}

      </section>

    </main>
  );
}

export default InventarioFarmacia;