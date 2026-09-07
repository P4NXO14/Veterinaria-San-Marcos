function mostrarMensaje(elemento, texto, tipo) {
    if (!elemento) return;
    elemento.textContent = texto;
    elemento.classList.remove("mensaje-error", "mensaje-exito");
    elemento.classList.add(tipo === "exito" ? "mensaje-exito" : "mensaje-error");
}

// Validacion de RUN chileno sin puntos ni guion
function validarRUT(rut) {
    if (!/^[0-9]+[0-9kK]{1}$/.test(rut)) return false;

    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1).toUpperCase();
    let suma = 0;
    let multiplo = 2;

    for (let i = 1; i <= cuerpo.length; i++) {
        suma += multiplo * rut.charAt(cuerpo.length - i);
        multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    let dvEsperado = 11 - (suma % 11);
    dvEsperado = dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();
    return dvEsperado === dv;
}

function obtenerUsuarios() {
    return JSON.parse(localStorage.getItem("usuariosSanMarcos")) || [];
}

function guardarUsuarios(usuarios) {
    localStorage.setItem("usuariosSanMarcos", JSON.stringify(usuarios));
}

// Registro. Para este prototipo frontend los usuarios se guardan en localStorage.
const formRegistro = document.getElementById("formRegistro");
if (formRegistro) {
    formRegistro.addEventListener("submit", event => {
        event.preventDefault();

        const rut = document.getElementById("rut").value.trim();
        const nombre = document.getElementById("nombre").value.trim();
        const apellidos = document.getElementById("apellidos").value.trim();
        const correo = document.getElementById("correo").value.trim().toLowerCase();
        const direccion = document.getElementById("direccion").value.trim();
        const pass = document.getElementById("registroPass").value;
        const passConfirmar = document.getElementById("registroPassConfirmar").value;
        const mensaje = document.getElementById("mensaje-error");

        if (!validarRUT(rut)) {
            mostrarMensaje(mensaje, "Error: El RUN no es valido. Ingresalo sin puntos ni guion.", "error");
            return;
        }

        if (nombre === "" || nombre.length > 50) {
            mostrarMensaje(mensaje, "Error: El nombre es obligatorio y admite hasta 50 caracteres.", "error");
            return;
        }

        if (apellidos === "" || apellidos.length > 100) {
            mostrarMensaje(mensaje, "Error: Los apellidos son obligatorios y admiten hasta 100 caracteres.", "error");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || correo.length > 100) {
            mostrarMensaje(mensaje, "Error: Ingresa un correo valido de hasta 100 caracteres.", "error");
            return;
        }

        if (direccion === "" || direccion.length > 300) {
            mostrarMensaje(mensaje, "Error: La direccion es obligatoria y admite hasta 300 caracteres.", "error");
            return;
        }

        if (pass.length < 4 || pass.length > 10) {
            mostrarMensaje(mensaje, "Error: La contraseña debe tener entre 4 y 10 caracteres.", "error");
            return;
        }

        if (pass !== passConfirmar) {
            mostrarMensaje(mensaje, "Error: Las contraseñas no coinciden.", "error");
            return;
        }

        const usuarios = obtenerUsuarios();

        if (usuarios.some(usuario => usuario.rut.toUpperCase() === rut.toUpperCase())) {
            mostrarMensaje(mensaje, "Error: Ya existe un usuario registrado con ese RUN.", "error");
            return;
        }

        if (usuarios.some(usuario => usuario.correo === correo)) {
            mostrarMensaje(mensaje, "Error: Ya existe un usuario registrado con ese correo.", "error");
            return;
        }

        const nuevoUsuario = {
            rut,
            nombre,
            apellidos,
            correo,
            direccion,
            password: pass,
            rol: "cliente",
            activo: true
        };

        usuarios.push(nuevoUsuario);
        guardarUsuarios(usuarios);

        mostrarMensaje(mensaje, "Usuario registrado correctamente. Ahora puedes iniciar sesion.", "exito");
        formRegistro.reset();

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);
    });
}

// Inicio de sesion con un usuario previamente registrado
const formLogin = document.getElementById("formLogin");
if (formLogin) {
    formLogin.addEventListener("submit", event => {
        event.preventDefault();

        const correo = document.getElementById("loginCorreo").value.trim().toLowerCase();
        const pass = document.getElementById("loginPass").value;
        const mensaje = document.getElementById("login-error");

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || correo.length > 100) {
            mostrarMensaje(mensaje, "Error: Ingresa un correo valido de hasta 100 caracteres.", "error");
            return;
        }

        if (pass.length < 4 || pass.length > 10) {
            mostrarMensaje(mensaje, "Error: La contraseña debe tener entre 4 y 10 caracteres.", "error");
            return;
        }

        const usuarios = obtenerUsuarios();
        const usuario = usuarios.find(item => item.correo === correo && item.password === pass);

        if (!usuario) {
            mostrarMensaje(mensaje, "Error: Correo o contraseña incorrectos. Debes registrarte antes de iniciar sesion.", "error");
            return;
        }

        if (usuario.activo === false) {
            mostrarMensaje(mensaje, "Error: Esta cuenta se encuentra desactivada.", "error");
            return;
        }

        const sesion = {
            rut: usuario.rut,
            nombre: usuario.nombre,
            apellidos: usuario.apellidos,
            correo: usuario.correo,
            rol: usuario.rol
        };

        localStorage.setItem("sesionSanMarcos", JSON.stringify(sesion));
        mostrarMensaje(mensaje, `Bienvenido ${usuario.nombre}. Inicio de sesion correcto.`, "exito");

        const destino = localStorage.getItem("destinoSanMarcos") || "servicios.html";
        localStorage.removeItem("destinoSanMarcos");

        setTimeout(() => {
            window.location.href = destino;
        }, 800);
    });
}

// Contacto
const formContacto = document.getElementById("formContacto");
if (formContacto) {
    formContacto.addEventListener("submit", event => {
        event.preventDefault();

        const nombre = document.getElementById("contactoNombre").value.trim();
        const correo = document.getElementById("contactoCorreo").value.trim();
        const comentario = document.getElementById("contactoMensaje").value.trim();
        const mensaje = document.getElementById("contacto-error");

        if (nombre === "" || nombre.length > 100) {
            mostrarMensaje(mensaje, "Error: El nombre es obligatorio y admite hasta 100 caracteres.", "error");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || correo.length > 100) {
            mostrarMensaje(mensaje, "Error: Ingresa un correo valido de hasta 100 caracteres.", "error");
            return;
        }

        if (comentario === "" || comentario.length > 500) {
            mostrarMensaje(mensaje, "Error: El mensaje es obligatorio y admite hasta 500 caracteres.", "error");
            return;
        }

        mostrarMensaje(mensaje, "Mensaje validado correctamente.", "exito");
        formContacto.reset();
    });
}

// Mantenedor de servicios del panel administrador
const formAdminServicio = document.getElementById("formAdminServicio");
if (formAdminServicio) {
    formAdminServicio.addEventListener("submit", event => {
        event.preventDefault();

        const nombre = document.getElementById("adminServicioNombre").value.trim();
        const precio = Number(document.getElementById("adminServicioPrecio").value);
        const mensaje = document.getElementById("admin-servicio-mensaje");

        if (nombre.length < 3 || nombre.length > 100) {
            mostrarMensaje(mensaje, "Error: El servicio debe tener entre 3 y 100 caracteres.", "error");
            return;
        }

        if (!Number.isFinite(precio) || precio <= 0) {
            mostrarMensaje(mensaje, "Error: El precio debe ser mayor que cero.", "error");
            return;
        }

        mostrarMensaje(mensaje, "Servicio validado correctamente.", "exito");
        formAdminServicio.reset();
    });
}

// Mantenedor de usuarios del panel administrador
const formAdminUsuario = document.getElementById("formAdminUsuario");
if (formAdminUsuario) {
    formAdminUsuario.addEventListener("submit", event => {
        event.preventDefault();

        const nombre = document.getElementById("adminUsuarioNombre").value.trim();
        const correo = document.getElementById("adminUsuarioCorreo").value.trim();
        const rol = document.getElementById("adminUsuarioRol").value;
        const mensaje = document.getElementById("admin-usuario-mensaje");

        if (nombre.length < 3 || nombre.length > 100) {
            mostrarMensaje(mensaje, "Error: El nombre debe tener entre 3 y 100 caracteres.", "error");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || correo.length > 100) {
            mostrarMensaje(mensaje, "Error: Ingresa un correo valido.", "error");
            return;
        }

        if (rol === "") {
            mostrarMensaje(mensaje, "Error: Selecciona un rol.", "error");
            return;
        }

        mostrarMensaje(mensaje, "Usuario validado correctamente.", "exito");
        formAdminUsuario.reset();
    });
}
