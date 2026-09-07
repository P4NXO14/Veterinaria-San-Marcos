function obtenerSesionSanMarcos() { return JSON.parse(localStorage.getItem("sesionSanMarcos")); }

function protegerVista() {
    const sesion = obtenerSesionSanMarcos();
    const requiere = document.body.dataset.auth === "true";
    const rol = document.body.dataset.role;
    const roles = (document.body.dataset.roles || "").split(",").map(r => r.trim()).filter(Boolean);

    if (requiere && !sesion) {
        localStorage.setItem("destinoSanMarcos", location.pathname.split("/").pop() || "index.html");
        location.href = "login.html";
        return false;
    }

    if (rol && sesion && sesion.rol !== rol) {
        alert("No tienes permisos para acceder a esta vista.");
        location.href = "index.html";
        return false;
    }

    if (roles.length && sesion && !roles.includes(sesion.rol)) {
        alert("No tienes permisos para acceder a esta vista.");
        location.href = "index.html";
        return false;
    }

    return true;
}

function agregarEnlace(nav, href, texto) {
    if (nav.querySelector(`a[href="${href}"]`)) return;
    const a = document.createElement("a");
    a.href = href;
    a.textContent = texto;
    nav.appendChild(a);
}

function actualizarNavegacionSesion() {
    const sesion = obtenerSesionSanMarcos();
    const nav = document.querySelector("header nav");
    if (!nav) return;

    const reg = nav.querySelector('a[href="registro.html"]');
    const login = nav.querySelector('a[href="login.html"]');

    if (!sesion) {
        nav.querySelectorAll('a:not([href="registro.html"]):not([href="login.html"])').forEach(a => {
            if (document.body.dataset.publica === "true") a.classList.add("oculto-publico");
        });
        return;
    }

    if (reg) reg.remove();
    if (login) login.remove();

    if (sesion.rol === "admin" || sesion.rol === "recepcionista") {
        agregarEnlace(nav, "medicamentos.html", "Stock clinico");
    }

    if (sesion.rol === "admin") {
        agregarEnlace(nav, "admin.html", "Administracion");
    }

    if (sesion.rol === "recepcionista") {
        agregarEnlace(nav, "recepcion.html", "Recepcion");
    }

    const u = document.createElement("span");
    u.className = "usuario-sesion";
    u.textContent = `Hola, ${sesion.nombre}`;
    nav.appendChild(u);

    const c = document.createElement("a");
    c.href = "#";
    c.textContent = "Cerrar Sesion";
    c.onclick = e => {
        e.preventDefault();
        localStorage.removeItem("sesionSanMarcos");
        location.href = "login.html";
    };
    nav.appendChild(c);
}

function configurarMenuMovil() {
    const b = document.querySelector(".menu-toggle");
    const n = document.querySelector(".menu-principal");
    if (!b || !n) return;

    b.onclick = () => {
        const abierto = n.classList.toggle("menu-abierto");
        b.setAttribute("aria-expanded", abierto ? "true" : "false");
    };
}

if (protegerVista()) {
    actualizarNavegacionSesion();
    configurarMenuMovil();
}
