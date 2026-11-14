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

@Service
public class UsuarioService {
    private final UsuarioRepository repository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public Usuario registrar(RegistroRequest datos) {
        if (repository.existsByCorreo(datos.correo())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Correo ya registrado");
        }

        if (repository.existsByRut(datos.rut())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "RUT ya registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setRut(datos.rut());
        usuario.setNombre(datos.nombre());
        usuario.setApellidos(datos.apellidos());
        usuario.setCorreo(datos.correo());
        usuario.setDireccion(datos.direccion());
        usuario.setPasswordHash(passwordEncoder.encode(datos.password()));
        usuario.setRol("cliente");
        usuario.setActivo(true);

        return repository.save(usuario);
    }

    public Usuario iniciarSesion(LoginRequest datos) {
        Usuario usuario = repository.findByCorreo(datos.correo())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas"));

        if (!passwordEncoder.matches(datos.password(), usuario.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas");
        }

        if (!usuario.getActivo()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cuenta desactivada");
        }

        return usuario;
    }

    public Usuario obtenerPorCorreo(String correo) {
        Usuario usuario = repository.findByCorreo(correo)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (!usuario.getActivo()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cuenta desactivada");
        }

        return usuario;
    }

    public List<Usuario> listar() {
        return repository.findAll();
    }

    public Usuario crearPersonal(PersonalRequest datos) {
        if (repository.existsByCorreo(datos.correo())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Correo ya registrado");
        }

        if (repository.existsByRut(datos.rut())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "RUT ya registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setRut(datos.rut());
        usuario.setNombre(datos.nombre());
        usuario.setApellidos(datos.apellidos());
        usuario.setCorreo(datos.correo());
        usuario.setDireccion(datos.direccion());
        usuario.setPasswordHash(passwordEncoder.encode(datos.password()));
        usuario.setRol("recepcionista");
        usuario.setActivo(true);

        return repository.save(usuario);
    }

    public Usuario editarPersonal(String rut, EditarPersonalRequest datos) {
        Usuario usuario = obtenerPersonal(rut);
        usuario.setNombre(datos.nombre());
        usuario.setApellidos(datos.apellidos());
        usuario.setDireccion(datos.direccion());
        return repository.save(usuario);
    }

    public Usuario cambiarEstado(String rut, boolean activo) {
        Usuario usuario = obtenerPersonal(rut);
        usuario.setActivo(activo);
        return repository.save(usuario);
    }

    public void eliminarPersonal(String rut) {
        Usuario usuario = obtenerPersonal(rut);
        repository.delete(usuario);
    }

    private Usuario obtenerPersonal(String rut) {
        Usuario usuario = repository.findByRut(rut)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (!usuario.getRol().equals("recepcionista")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo se puede modificar personal");
        }

        return usuario;
    }
}