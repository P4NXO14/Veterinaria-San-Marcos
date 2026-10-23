import { useState } from "react";

    interface SelectorHorarioProps {
    fechaSeleccionada: string;
    horaConfirmada: string;
    horasDisponibles: string[];
    onSeleccionarFecha: (fecha: string) => void;
    onConfirmarHora: (hora: string) => void;
    }

    const diasSemana = [
    "Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"
    ];

    function formatearFecha(
    año: number,
    mes: number,
    dia: number
    ): string {
    return `${año}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    }

    function SelectorHorario({
    fechaSeleccionada,
    horaConfirmada,
    horasDisponibles,
    onSeleccionarFecha,
    onConfirmarHora
    }: SelectorHorarioProps) {

    const hoy = new Date();

    const [mesVisible, setMesVisible] = useState(() => {
        const fechaInicial = fechaSeleccionada
        ? new Date(`${fechaSeleccionada}T12:00:00`)
        : new Date();

        return new Date(
        fechaInicial.getFullYear(),
        fechaInicial.getMonth(),
        1
        );
    });

    const [horaPendiente, setHoraPendiente] = useState("");

    const año = mesVisible.getFullYear();
    const mes = mesVisible.getMonth();

    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);

    const espaciosIniciales = (primerDia.getDay() + 6) % 7;
    const cantidadDias = ultimoDia.getDate();

    const fechaActual = formatearFecha(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate()
    );

    const esMesActual =
        año === hoy.getFullYear() &&
        mes === hoy.getMonth();

    const calendario = Array.from(
        { length: espaciosIniciales + cantidadDias },
        (_, indice) => {
        const dia = indice - espaciosIniciales + 1;
        return dia > 0 ? dia : null;
        }
    );

    function cambiarMes(cantidad: number) {
        setMesVisible(
            new Date(año, mes + cantidad, 1)
        );

        setHoraPendiente("");
        onSeleccionarFecha("");
        }

    function seleccionarDia(dia: number) {
        const fecha = formatearFecha(año, mes, dia);

        if (fecha < fechaActual) {
        return;
        }

        setHoraPendiente("");
        onSeleccionarFecha(fecha);
    }

    function confirmarHora() {
        if (
        !horaPendiente ||
        !horasDisponibles.includes(horaPendiente)
        ) {
        return;
        }

        onConfirmarHora(horaPendiente);
    }

    return (
        <section className="selector-horario">
        <h2>Agenda de Horarios</h2>

        <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
            <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => cambiarMes(-1)}
            disabled={
                año < hoy.getFullYear() ||
                esMesActual
            }
            >
            Anterior
            </button>

            <h3 className="mb-0 text-capitalize fs-5">
            {mesVisible.toLocaleDateString("es-CL", {
                month: "long",
                year: "numeric"
            })}
            </h3>

            <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => cambiarMes(1)}
            >
            Siguiente
            </button>
        </div>

        <div className="agenda-calendario">
            {diasSemana.map((dia) => (
            <div className="agenda-encabezado" key={dia}>
                {dia}
            </div>
            ))}

            {calendario.map((dia, indice) => {
            if (dia === null) {
                return <span key={`vacio-${indice}`} />;
            }

            const fecha = formatearFecha(año, mes, dia);
            const seleccionada = fechaSeleccionada === fecha;

            return (
                <button
                key={fecha}
                type="button"
                disabled={fecha < fechaActual}
                aria-label={`Seleccionar fecha ${fecha}`}
                aria-pressed={seleccionada}
                className={`agenda-dia ${
                    seleccionada ? "agenda-dia-seleccionado" : ""
                }`}
                onClick={() => seleccionarDia(dia)}
                >
                {dia}
                </button>
            );
            })}
        </div>

        <div className="mt-4">
            <h3 className="fs-5">Horas disponibles</h3>

            {!fechaSeleccionada ? (
            <p>Selecciona una fecha del calendario.</p>
            ) : horasDisponibles.length === 0 ? (
            <p>No hay horas disponibles para la fecha seleccionada.</p>
            ) : (
            <div className="agenda-horas">
                {horasDisponibles.map((hora) => (
                <button
                    key={hora}
                    type="button"
                    aria-pressed={
                    horaPendiente === hora ||
                    (!horaPendiente && horaConfirmada === hora)
                    }
                    className={`btn ${
                    horaPendiente === hora ||
                    (!horaPendiente && horaConfirmada === hora)
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setHoraPendiente(hora)}
                >
                    {hora}
                </button>
                ))}
            </div>
            )}
        </div>

        <div className="mt-4">
            <label className="form-label">
            Hora seleccionada:
            </label>

            <input
            className="form-control"
            type="text"
            value={horaPendiente || horaConfirmada}
            placeholder="Sin seleccionar"
            readOnly
            />

            <button
            type="button"
            className="btn btn-success mt-3"
            disabled={!horaPendiente}
            onClick={confirmarHora}
            >
            Confirmar hora
            </button>

            {horaConfirmada && (
            <p className="mensaje-exito mt-2" role="status">
                Hora confirmada: {horaConfirmada}
            </p>
            )}
        </div>
        </section>
    );
}

export default SelectorHorario;