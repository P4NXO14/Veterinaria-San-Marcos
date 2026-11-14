package cl.sanmarcos.usuarios.configuracion;

import cl.sanmarcos.usuarios.model.Usuario;
import cl.sanmarcos.usuarios.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UsuariosIniciales implements CommandLineRunner {
    private final UsuarioRepository repository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${sanmarcos.admin.password:}")
    private String passwordAdmin;

    @Value("${sanmarcos.personal.password:}")
    private String passwordPersonal;

    public UsuariosIniciales(UsuarioRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        crearUsuario("900000014", "Administrador", "San Marcos", "admin@sanmarcos.com", passwordAdmin, "admin");
        crearUsuario("900000022", "Personal", "San Marcos", "personal@sanmarcos.com", passwordPersonal, "recepcionista");
    }

    private void crearUsuario(String rut, String nombre, String apellidos, String correo, String password, String rol) {
        if (repository.existsByCorreo(correo)) {
            return;
        }

        if (repository.existsByRut(rut)) {
            throw new IllegalStateException("RUT ya registrado: " + rut);
        }

        if (password == null || password.isBlank()) {
            throw new IllegalStateException("Falta configurar la password de " + correo);
        }

        Usuario usuario = new Usuario();
        usuario.setRut(rut);
        usuario.setNombre(nombre);
        usuario.setApellidos(apellidos);
        usuario.setCorreo(correo);
        usuario.setDireccion("Veterinaria San Marcos");
        usuario.setPasswordHash(passwordEncoder.encode(password));
        usuario.setRol(rol);
        usuario.setActivo(true);

        repository.save(usuario);
    }
}