
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import TarjetaServicio from "../componentes/moleculas/TarjetaServicio";

import { servicios } from "../datos/servicios";
import type { Sesion } from "../datos/usuarios";

interface ServiciosProps {
  sesion: Sesion | null;
}

function Servicios({ sesion }: ServiciosProps) {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [mensaje, setMensaje] = useState("");

  const categorias = [
    "Todas",
    ...new Set(
      servicios.map((servicio) => servicio.categoria)
    )
  ];

  const serviciosFiltrados = servicios.filter((servicio) => {
    const texto = busqueda.toLowerCase().trim();

    const coincideBusqueda =
      servicio.nombre.toLowerCase().includes(texto) ||
      servicio.id.toLowerCase().includes(texto) ||
      servicio.especie.toLowerCase().includes(texto);

    const coincideCategoria =
      categoria === "Todas" ||
      servicio.categoria === categoria;

    return coincideBusqueda && coincideCategoria;
  });

  function solicitarCita(id: string) {
    setMensaje("");

    const servicioSeleccionado = servicios.find(
      (servicio) => servicio.id === id
    );

    if (!servicioSeleccionado) {
      setMensaje("No se encontro el servicio seleccionado");
      return;
    }

    if (id === "OT004") {
      setMensaje(
        "La hospitalizacion requiere coordinacion directa con la veterinaria"
      );
      return;
    }

    if (!sesion) {
      const continuar = window.confirm(
        "Debes iniciar sesion como cliente para solicitar una cita ¿Deseas continuar?"
      );

      if (!continuar) {
        return;
      }

      sessionStorage.setItem(
        "servicioCitaSanMarcos",
        id
      );

      localStorage.setItem(
        "destinoSanMarcos",
        "/reserva"
      );

      navigate("/login");
      return;
    }

    if (sesion.rol !== "cliente") {
      setMensaje(
        "Solo los clientes pueden solicitar citas desde el catalogo"
      );
      return;
    }

    sessionStorage.setItem(
      "servicioCitaSanMarcos",
      id
    );

    navigate("/reserva");
  }

  function limpiarFiltros() {
    setBusqueda("");
    setCategoria("Todas");
    setMensaje("");
  }

  return (
    <main className="servicios-pagina">

      <section className="servicios-encabezado">
        <h1>Servicios Veterinarios</h1>

        <p>
          Conoce nuestros servicios de atencion, vacunacion, cirugia, desparasitacion y examenes veterinarios
        </p>

        <p>
          Selecciona un servicio para consultar sus detalles o solicitar una cita
        </p>
      </section>

      <section
        className="servicios-contenido"
        aria-label="Catalogo de servicios veterinarios"
      >

        <div className="servicios-filtros">

          <div className="servicios-filtro">
            <label htmlFor="buscarServicio">
              Buscar servicio
            </label>

            <input
              id="buscarServicio"
              type="search"
              value={busqueda}
              onChange={(evento) => {
                setBusqueda(evento.target.value);
                setMensaje("");
              }}
              placeholder="Buscar por nombre, codigo o especie"
            />
          </div>

          <div className="servicios-filtro">
            <label htmlFor="categoriaServicio">
              Categoria
            </label>

            <select
              id="categoriaServicio"
              value={categoria}
              onChange={(evento) => {
                setCategoria(evento.target.value);
                setMensaje("");
              }}
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

          <button
            type="button"
            className="servicios-limpiar"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>

        </div>

        <div className="servicios-resumen">
          <p>
            Servicios encontrados:{" "}
            <strong>
              {serviciosFiltrados.length}
            </strong>
            {" "}de {servicios.length}
          </p>
        </div>

        {mensaje && (
          <p
            className="servicios-mensaje"
            role="status"
          >
            {mensaje}
          </p>
        )}

        {serviciosFiltrados.length > 0 ? (

          <div className="servicios-grid">

            {serviciosFiltrados.map((servicio) => (
              <TarjetaServicio
                key={servicio.id}
                servicio={servicio}
                onSolicitarCita={solicitarCita}
              />
            ))}

          </div>

        ) : (

          <div className="servicios-sin-resultados">
            <h2>No se encontraron servicios</h2>

            <p>
              Prueba con otro nombre o selecciona una categoria diferente
            </p>

            <button
              type="button"
              onClick={limpiarFiltros}
            >
              Mostrar todos los servicios
            </button>
          </div>

        )}

      </section>

    </main>
  );
}

export default Servicios;