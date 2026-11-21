package cl.sanmarcos.usuarios.service;

import cl.sanmarcos.usuarios.dto.EditarPersonalRequest;
import cl.sanmarcos.usuarios.dto.LoginRequest;
import cl.sanmarcos.usuarios.dto.PersonalRequest;
import cl.sanmarcos.usuarios.dto.RegistroRequest;
import cl.sanmarcos.usuarios.model.Usuario;
import cl.sanmarcos.usuarios.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class UsuarioService {
    private final UsuarioRepository repository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private static final Pattern CORREO_CLIENTE = Pattern.compile("^[a-z0-9._%+-]+@(gmail|hotmail)\\.com$");
    private static final Pattern CORREO_PERSONAL = Pattern.compile("^[a-z0-9._%+-]+@sanmarcos\\.com$");

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public Usuario registrar(RegistroRequest datos) {
        String rut = normalizarRut(datos.rut());
        String nombre = validarTexto(datos.nombre(), "nombre", 50);
        String apellidos = validarTexto(datos.apellidos(), "apellidos", 100);
        String correo = normalizarCorreo(datos.correo());
        String direccion = validarTexto(datos.direccion(), "direccion", 255);

        validarRut(rut);
        validarCorreo(correo, "cliente");
        validarPassword(datos.password());
        validarDuplicados(rut, correo);

        Usuario usuario = new Usuario();
        usuario.setRut(rut);
        usuario.setNombre(nombre);
        usuario.setApellidos(apellidos);
        usuario.setCorreo(correo);
        usuario.setDireccion(direccion);
        usuario.setPasswordHash(passwordEncoder.encode(datos.password()));
        usuario.setRol("cliente");
        usuario.setActivo(true);

        return repository.save(usuario);
    }

    public Usuario iniciarSesion(LoginRequest datos) {
        String correo = normalizarCorreo(datos.correo());

        if (correo.isBlank() || datos.password() == null || datos.password().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Correo y contraseña obligatorios");
        }

        Usuario usuario = repository.findByCorreo(correo)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas"));

        if (!passwordEncoder.matches(datos.password(), usuario.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas");
        }

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cuenta desactivada");
        }

        return usuario;
    }

    public Usuario obtenerPorCorreo(String correo) {
        Usuario usuario = repository.findByCorreo(normalizarCorreo(correo))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cuenta desactivada");
        }

        return usuario;
    }

    public List<Usuario> listar() {
        return repository.findAll();
    }

    public Usuario crearPersonal(PersonalRequest datos) {
        String rut = normalizarRut(datos.rut());
        String nombre = validarTexto(datos.nombre(), "nombre", 50);
        String apellidos = validarTexto(datos.apellidos(), "apellidos", 100);
        String correo = normalizarCorreo(datos.correo());
        String direccion = validarTexto(datos.direccion(), "direccion", 255);

        validarRut(rut);
        validarCorreo(correo, "recepcionista");
        validarPassword(datos.password());
        validarDuplicados(rut, correo);

        Usuario usuario = new Usuario();
        usuario.setRut(rut);
        usuario.setNombre(nombre);
        usuario.setApellidos(apellidos);
        usuario.setCorreo(correo);
        usuario.setDireccion(direccion);
        usuario.setPasswordHash(passwordEncoder.encode(datos.password()));
        usuario.setRol("recepcionista");
        usuario.setActivo(true);

        return repository.save(usuario);
    }

    public Usuario editarPersonal(Long id, EditarPersonalRequest datos) {
        Usuario usuario = obtenerPersonal(id);

        usuario.setNombre(validarTexto(datos.nombre(), "nombre", 50));
        usuario.setApellidos(validarTexto(datos.apellidos(), "apellidos", 100));
        usuario.setDireccion(validarTexto(datos.direccion(), "direccion", 255));

        return repository.save(usuario);
    }

    public Usuario cambiarEstado(Long id, boolean activo) {
        Usuario usuario = obtenerPersonal(id);
        usuario.setActivo(activo);
        return repository.save(usuario);
    }

    public void eliminarPersonal(Long id) {
        Usuario usuario = obtenerPersonal(id);
        repository.delete(usuario);
    }

    public void eliminarCliente(Long id) {
        Usuario usuario = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (!"cliente".equals(usuario.getRol())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo se pueden eliminar cuentas de clientes");
        }

        repository.delete(usuario);
    }

    private Usuario obtenerPersonal(Long id) {
        Usuario usuario = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (!"recepcionista".equals(usuario.getRol())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo se puede modificar personal");
        }

        return usuario;
    }

    private void validarDuplicados(String rut, String correo) {
        if (repository.existsByCorreo(correo)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Correo ya registrado");
        }

        if (repository.existsByRut(rut)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "RUT ya registrado");
        }
    }

    private String normalizarRut(String rut) {
        return rut == null ? "" : rut.trim().toUpperCase();
    }

    private String normalizarCorreo(String correo) {
        return correo == null ? "" : correo.trim().toLowerCase();
    }

    private String validarTexto(String valor, String campo, int maximo) {
        if (valor == null || valor.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El campo " + campo + " es obligatorio");
        }

        String texto = valor.trim();

        if (texto.length() > maximo) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El campo " + campo + " admite hasta " + maximo + " caracteres");
        }

        return texto;
    }

    private void validarRut(String rut) {
        if (rut.length() > 12 || !rut.matches("^[0-9]+[0-9K]$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "RUT invalido. Ingresalo sin puntos ni guion");
        }

        String cuerpo = rut.substring(0, rut.length() - 1);
        char dv = rut.charAt(rut.length() - 1);

        int suma = 0;
        int multiplo = 2;

        for (int i = cuerpo.length() - 1; i >= 0; i--) {
            suma += Character.getNumericValue(cuerpo.charAt(i)) * multiplo;
            multiplo = multiplo < 7 ? multiplo + 1 : 2;
        }

        int resultado = 11 - (suma % 11);
        char esperado = resultado == 11 ? '0' : resultado == 10 ? 'K' : Character.forDigit(resultado, 10);

        if (dv != esperado) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El digito verificador del RUT es incorrecto");
        }
    }

    private void validarCorreo(String correo, String rol) {
        if (correo.isBlank() || correo.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Correo invalido");
        }

        if ("cliente".equals(rol)) {
            if (!CORREO_CLIENTE.matcher(correo).matches()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El cliente debe utilizar un correo @gmail.com o @hotmail.com");
            }
        } else if ("recepcionista".equals(rol)) {
            if (!CORREO_PERSONAL.matcher(correo).matches() || correo.equals("admin@sanmarcos.com")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El personal debe utilizar un correo @sanmarcos.com distinto al administrador");
            }
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol invalido");
        }
    }

    private void validarPassword(String password) {
        if (password == null || password.length() < 4 || password.length() > 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña debe tener entre 4 y 10 caracteres");
        }
    }
}