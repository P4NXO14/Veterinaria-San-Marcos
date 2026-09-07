function usuarios() {
    return JSON.parse(localStorage.getItem("usuariosSanMarcos")) || [];
}


function guardar(lista) {
    localStorage.setItem("usuariosSanMarcos", JSON.stringify(lista));
}


function renderUsuarios() {
    const c = document.getElementById("tabla-usuarios");

    if (!c) {
        return;
    }

    const lista = usuarios();

    if (!lista.length) {
        c.innerHTML = "<p>No hay usuarios registrados.</p>";
        return;
    }


    let html = `
        <div class="tabla-responsive">

            <table class="tabla-datos">

                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
    `;


    lista.forEach((u, i) => {
        html += `
            <tr>

                <td>
                    ${u.nombre} ${u.apellidos || ""}
                </td>

                <td>
                    ${u.correo}
                </td>

                <td>
                    <select data-rol="${i}">

                        <option
                            value="cliente"
                            ${u.rol === "cliente" ? "selected" : ""}
                        >
                            Dueño de mascota
                        </option>

                        <option
                            value="recepcionista"
                            ${u.rol === "recepcionista" ? "selected" : ""}
                        >
                            Recepcionista
                        </option>

                        <option
                            value="admin"
                            ${u.rol === "admin" ? "selected" : ""}
                        >
                            Administrador
                        </option>

                    </select>
                </td>

                <td>
                    ${u.activo === false ? "Inactivo" : "Activo"}
                </td>

                <td>
                    <button
                        class="btn-admin"
                        data-estado="${i}"
                    >
                        ${u.activo === false ? "Activar" : "Desactivar"}
                    </button>
                </td>

            </tr>
        `;
    });


    c.innerHTML = html + `
                </tbody>

            </table>

        </div>
    `;


    c.querySelectorAll("[data-rol]").forEach(s => {
        s.onchange = () => {
            const l = usuarios();

            l[Number(s.dataset.rol)].rol = s.value;

            guardar(l);
            renderUsuarios();
        };
    });


    c.querySelectorAll("[data-estado]").forEach(b => {
        b.onclick = () => {
            const l = usuarios();

            const i = Number(b.dataset.estado);

            l[i].activo = l[i].activo === false ? true : false;

            guardar(l);
            renderUsuarios();
        };
    });
}


renderUsuarios();