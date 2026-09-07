function obtenerCitas() {
    return JSON.parse(localStorage.getItem("citasSanMarcos")) || [];
}

function guardarCitas(citas) {
    localStorage.setItem("citasSanMarcos", JSON.stringify(citas));
}

function sesionActual() {
    return JSON.parse(localStorage.getItem("sesionSanMarcos"));
}

function escapar(texto) {
    const d = document.createElement("div");
    d.textContent = texto;
    return d.innerHTML;
}


const formCita = document.getElementById("formCita");

if (formCita) {
    const fecha = document.getElementById("citaFecha");

    fecha.min = new Date().toISOString().split("T")[0];

    formCita.addEventListener("submit", e => {
        e.preventDefault();

        const sesion = sesionActual();
        const mensaje = document.getElementById("citaMensaje");

        if (!sesion || sesion.rol !== "cliente") {
            mensaje.textContent = "Debes iniciar sesion como dueño de mascota.";
            mensaje.className = "mensaje-formulario mensaje-error";
            return;
        }

        const servicio = document.getElementById("citaServicio").value;
        const mascota = document.getElementById("citaMascota").value.trim();
        const especie = document.getElementById("citaEspecie").value;
        const motivo = document.getElementById("citaMotivo").value.trim();
        const fechaValor = fecha.value;
        const hora = document.getElementById("citaHora").value;

        if (
            !servicio ||
            !mascota ||
            !especie ||
            !motivo ||
            !fechaValor ||
            !hora
        ) {
            mensaje.textContent = "Completa todos los campos de la solicitud.";
            mensaje.className = "mensaje-formulario mensaje-error";
            return;
        }

        const citas = obtenerCitas();

        citas.push({
            id: "C" + Date.now(),
            propietario: sesion.correo,
            propietarioNombre: `${sesion.nombre} ${sesion.apellidos || ""}`.trim(),
            servicio: servicio,
            mascota: mascota,
            especie: especie,
            motivo: motivo,
            fecha: fechaValor,
            hora: hora,
            estado: "Pendiente",
            fechaPropuesta: "",
            horaPropuesta: ""
        });

        guardarCitas(citas);

        formCita.reset();

        mensaje.textContent =
            "Solicitud de cita enviada. Queda pendiente de confirmacion por recepcion.";

        mensaje.className = "mensaje-formulario mensaje-exito";

        renderMisCitas();
    });
}


function nombreServicio(codigo) {
    const s = (typeof servicios !== "undefined")
        ? servicios.find(x => x.id === codigo)
        : null;

    return s ? s.nombre : codigo;
}


function renderMisCitas() {
    const cont = document.getElementById("contenedor-citas");

    if (!cont) {
        return;
    }

    const sesion = sesionActual();

    const citas = obtenerCitas().filter(c =>
        sesion && c.propietario === sesion.correo
    );

    cont.innerHTML = "";

    if (!citas.length) {
        cont.innerHTML =
            '<p class="reserva-vacia">Aun no tienes solicitudes de cita.</p>';

        return;
    }

    citas
        .slice()
        .reverse()
        .forEach(c => {
            const a = document.createElement("article");

            a.className = "cita-item";

            const propuesta = c.fechaPropuesta
                ? `
                    <p>
                        <strong>Horario propuesto:</strong>
                        ${c.fechaPropuesta} ${c.horaPropuesta}
                    </p>
                `
                : "";

            a.innerHTML = `
                <h3>${escapar(nombreServicio(c.servicio))}</h3>

                <p>
                    <strong>Mascota:</strong>
                    ${escapar(c.mascota)} (${escapar(c.especie)})
                </p>

                <p>
                    <strong>Solicitado:</strong>
                    ${c.fecha} ${c.hora}
                </p>

                <p>
                    <strong>Estado:</strong>
                    <span class="estado-cita">
                        ${escapar(c.estado)}
                    </span>
                </p>

                ${propuesta}
            `;

            cont.appendChild(a);
        });
}


function renderRecepcion() {
    const cont = document.getElementById("lista-recepcion-citas");

    if (!cont) {
        return;
    }

    const citas = obtenerCitas();

    cont.innerHTML = "";

    if (!citas.length) {
        cont.innerHTML = "<p>No existen solicitudes registradas.</p>";
        return;
    }

    citas.forEach(c => {
        const a = document.createElement("article");

        a.className = "cita-item";

        a.innerHTML = `
            <h3>
                ${escapar(c.servicio)} - ${escapar(c.mascota)}
            </h3>

            <p>
                <strong>Dueño:</strong>
                ${escapar(c.propietarioNombre)}
                (${escapar(c.propietario)})
            </p>

            <p>
                <strong>Fecha solicitada:</strong>
                ${c.fecha} ${c.hora}
            </p>

            <p>
                <strong>Motivo:</strong>
                ${escapar(c.motivo)}
            </p>

            <p>
                <strong>Estado:</strong>
                ${escapar(c.estado)}
            </p>

            <div class="acciones-cita">
                <button
                    class="btn-principal"
                    data-confirmar="${c.id}"
                >
                    Confirmar
                </button>

                <button
                    class="btn-secundario"
                    data-reagendar="${c.id}"
                >
                    Proponer otro horario
                </button>
            </div>
        `;

        cont.appendChild(a);
    });

    cont.querySelectorAll("[data-confirmar]").forEach(b => {
        b.onclick = () => {
            cambiarEstado(b.dataset.confirmar, "Confirmada");
        };
    });

    cont.querySelectorAll("[data-reagendar]").forEach(b => {
        b.onclick = () => {
            proponerHorario(b.dataset.reagendar);
        };
    });
}


function cambiarEstado(id, estado) {
    const citas = obtenerCitas();

    const c = citas.find(x => x.id === id);

    if (c) {
        c.estado = estado;

        guardarCitas(citas);
        renderRecepcion();
    }
}


function proponerHorario(id) {
    const f = prompt("Nueva fecha (AAAA-MM-DD):");

    if (!f) {
        return;
    }

    const h = prompt("Nueva hora (HH:MM):");

    if (!h) {
        return;
    }

    const citas = obtenerCitas();

    const c = citas.find(x => x.id === id);

    if (c) {
        c.estado = "Horario propuesto";
        c.fechaPropuesta = f;
        c.horaPropuesta = h;

        guardarCitas(citas);
        renderRecepcion();
    }
}


renderMisCitas();
renderRecepcion();