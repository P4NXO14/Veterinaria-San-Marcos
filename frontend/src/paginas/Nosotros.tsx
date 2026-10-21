
function Nosotros() {
  return (
    <main className="contenedor-principal">
      <section>
        <h1>Sobre Veterinaria San Marcos</h1>

        <p>
          Veterinaria San Marcos es una clinica veterinaria ubicada
          en Rancagua, Region del Libertador General Bernardo
          O'Higgins. Fue fundada en 2009.
        </p>

        <p>
          El equipo esta compuesto por 3 medicos veterinarios,
          1 tecnico veterinario y 1 recepcionista administrativa.
        </p>

        <p>
          La clinica atiende principalmente perros y gatos,
          ademas de conejos y aves, entre sus servicios se
          encuentran consulta general, vacunacion, cirugia menor,
          desparasitacion y control de peso.
        </p>

        <p>
          Actualmente atiende un promedio de 25 pacientes por dia
          y el aumento del volumen de atencion hace necesaria
          la digitalizacion de las citas y fichas clinicas.
        </p>
      </section>

      <section className="seccion-separada">
        <h2>Ubicacion</h2>

        <p>
          La Veterinaria San Marcos se encuentra en Rancagua,
          Region del Libertador General Bernardo O'Higgins.
        </p>
      </section>

      <section className="video-veterinaria">
        <h2>Video informativo</h2>

        <div className="video-responsive">
          <video controls controlsList="nodownload" preload="metadata">
            <source
              src="/video/veterinaria-san-marcos.mp4"
              type="video/mp4"
            />
            Tu navegador no permite reproducir este video.
          </video>
        </div>
      </section>
    </main>
  );
}

export default Nosotros;