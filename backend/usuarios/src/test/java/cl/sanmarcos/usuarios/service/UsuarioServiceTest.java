package cl.sanmarcos.usuarios.service;

import cl.sanmarcos.usuarios.dto.EditarPersonalRequest;
import cl.sanmarcos.usuarios.dto.LoginRequest;
import cl.sanmarcos.usuarios.dto.PersonalRequest;
import cl.sanmarcos.usuarios.dto.RegistroRequest;
import cl.sanmarcos.usuarios.model.Usuario;
import cl.sanmarcos.usuarios.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {
    @Mock
    private UsuarioRepository repository;

    @InjectMocks
    private UsuarioService service;

    private RegistroRequest registro;

    @BeforeEach
    void configurar() {
        registro = new RegistroRequest(
            "111111111",
            "Juan",
            "Perez",
            "juan@gmail.com",
            "Santiago",
            "Clave123"
        );
    }

    @Test
    void registrarClienteCorrectamente() {
        when(repository.save(any(Usuario.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        Usuario usuario = service.registrar(registro);

        assertEquals("cliente", usuario.getRol());
        assertEquals("juan@gmail.com", usuario.getCorreo());
        assertEquals("111111111", usuario.getRut());
        assertTrue(usuario.getActivo());
        assertNotEquals("Clave123", usuario.getPasswordHash());
        assertTrue(new BCryptPasswordEncoder().matches("Clave123", usuario.getPasswordHash()));

        verify(repository).save(any(Usuario.class));
    }

    @Test
    void rechazarRutInvalido() {
        RegistroRequest datos = new RegistroRequest(
            "111111112",
            "Juan",
            "Perez",
            "juan@gmail.com",
            "Santiago",
            "Clave123"
        );

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.registrar(datos)
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verify(repository, never()).save(any(Usuario.class));
    }

    @Test
    void rechazarCorreoNoPermitido() {
        RegistroRequest datos = new RegistroRequest(
            "111111111",
            "Juan",
            "Perez",
            "juan@yahoo.com",
            "Santiago",
            "Clave123"
        );

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.registrar(datos)
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verify(repository, never()).save(any(Usuario.class));
    }

    @Test
    void aceptarPasswordDeCuatroCaracteresEnCliente() {
        RegistroRequest datos = new RegistroRequest(
            "111111111","Juan","Perez","juan@gmail.com","Santiago","Ab12"
        );

        when(repository.save(any(Usuario.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        Usuario usuario = service.registrar(datos);

        assertTrue(new BCryptPasswordEncoder().matches("Ab12",usuario.getPasswordHash()));
        verify(repository).save(any(Usuario.class));
    }

    @Test
    void aceptarPasswordDeDiezCaracteresEnCliente() {
        RegistroRequest datos = new RegistroRequest(
            "111111111","Juan","Perez","juan@gmail.com","Santiago","Clave12345"
        );

        when(repository.save(any(Usuario.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        Usuario usuario = service.registrar(datos);

        assertTrue(new BCryptPasswordEncoder().matches("Clave12345",usuario.getPasswordHash()));
        verify(repository).save(any(Usuario.class));
    }

    @Test
    void rechazarPasswordDeTresCaracteresEnCliente() {
        RegistroRequest datos = new RegistroRequest(
            "111111111","Juan","Perez","juan@gmail.com","Santiago","Ab1"
        );

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.registrar(datos)
        );

        assertEquals(HttpStatus.BAD_REQUEST,error.getStatusCode());
        verify(repository,never()).save(any(Usuario.class));
    }

    @Test
    void rechazarPasswordDeOnceCaracteresEnCliente() {
        RegistroRequest datos = new RegistroRequest(
            "111111111","Juan","Perez","juan@gmail.com","Santiago","Clave123456"
        );

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.registrar(datos)
        );

        assertEquals(HttpStatus.BAD_REQUEST,error.getStatusCode());
        verify(repository,never()).save(any(Usuario.class));
    }

    @Test
    void aceptarPasswordDeCuatroCaracteresEnPersonal() {
        PersonalRequest datos = new PersonalRequest(
            "111111111","Maria","Lopez","personal@sanmarcos.com","Santiago","Ab12"
        );

        when(repository.save(any(Usuario.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        Usuario usuario = service.crearPersonal(datos);

        assertTrue(new BCryptPasswordEncoder().matches("Ab12",usuario.getPasswordHash()));
        verify(repository).save(any(Usuario.class));
    }

    @Test
    void aceptarPasswordDeDiezCaracteresEnPersonal() {
        PersonalRequest datos = new PersonalRequest(
            "111111111","Maria","Lopez","personal@sanmarcos.com","Santiago","Clave12345"
        );

        when(repository.save(any(Usuario.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        Usuario usuario = service.crearPersonal(datos);

        assertTrue(new BCryptPasswordEncoder().matches("Clave12345",usuario.getPasswordHash()));
        verify(repository).save(any(Usuario.class));
    }

    @Test
    void rechazarPasswordDeTresCaracteresEnPersonal() {
        PersonalRequest datos = new PersonalRequest(
            "111111111","Maria","Lopez","personal@sanmarcos.com","Santiago","Ab1"
        );

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crearPersonal(datos)
        );

        assertEquals(HttpStatus.BAD_REQUEST,error.getStatusCode());
        verify(repository,never()).save(any(Usuario.class));
    }

    @Test
    void rechazarPasswordDeOnceCaracteresEnPersonal() {
        PersonalRequest datos = new PersonalRequest(
            "111111111","Maria","Lopez","personal@sanmarcos.com","Santiago","Clave123456"
        );

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crearPersonal(datos)
        );

        assertEquals(HttpStatus.BAD_REQUEST,error.getStatusCode());
        verify(repository,never()).save(any(Usuario.class));
    }

    @Test
    void rechazarCorreoDuplicado() {
        when(repository.existsByCorreo("juan@gmail.com")).thenReturn(true);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.registrar(registro)
        );

        assertEquals(HttpStatus.CONFLICT,error.getStatusCode());
        verify(repository,never()).save(any(Usuario.class));
    }

    @Test
    void rechazarRutDuplicado() {
        when(repository.existsByRut("111111111")).thenReturn(true);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.registrar(registro)
        );

        assertEquals(HttpStatus.CONFLICT,error.getStatusCode());
        verify(repository,never()).save(any(Usuario.class));
    }

    @Test
    void iniciarSesionCorrectamente() {
        Usuario usuario = crearUsuario();
        when(repository.findByCorreo("juan@gmail.com")).thenReturn(Optional.of(usuario));

        Usuario resultado = service.iniciarSesion(new LoginRequest("juan@gmail.com","Clave123"));

        assertEquals("juan@gmail.com",resultado.getCorreo());
        assertEquals("cliente",resultado.getRol());
    }

    @Test
    void rechazarPasswordIncorrecta() {
        Usuario usuario = crearUsuario();
        when(repository.findByCorreo("juan@gmail.com")).thenReturn(Optional.of(usuario));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.iniciarSesion(new LoginRequest("juan@gmail.com","Incorrecta"))
        );

        assertEquals(HttpStatus.UNAUTHORIZED,error.getStatusCode());
    }

    @Test
    void rechazarUsuarioNoRegistrado() {
        when(repository.findByCorreo("desconocido@gmail.com")).thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.iniciarSesion(new LoginRequest("desconocido@gmail.com","Clave123"))
        );

        assertEquals(HttpStatus.UNAUTHORIZED,error.getStatusCode());
    }

    @Test
    void rechazarCuentaDesactivada() {
        Usuario usuario = crearUsuario();
        usuario.setActivo(false);

        when(repository.findByCorreo("juan@gmail.com")).thenReturn(Optional.of(usuario));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.iniciarSesion(new LoginRequest("juan@gmail.com","Clave123"))
        );

        assertEquals(HttpStatus.FORBIDDEN,error.getStatusCode());
    }

    @Test
    void crearPersonalCorrectamente() {
        PersonalRequest datos = new PersonalRequest(
            "111111111",
            "Maria",
            "Lopez",
            "personal@sanmarcos.com",
            "Santiago",
            "Clave123"
        );

        when(repository.save(any(Usuario.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        Usuario usuario = service.crearPersonal(datos);

        assertEquals("recepcionista",usuario.getRol());
        assertEquals("personal@sanmarcos.com",usuario.getCorreo());
        assertTrue(usuario.getActivo());
        assertTrue(new BCryptPasswordEncoder().matches("Clave123",usuario.getPasswordHash()));

        verify(repository).save(any(Usuario.class));
    }

    @Test
    void editarPersonalPorId() {
        Usuario usuario = crearPersonal();
        when(repository.findById(3L)).thenReturn(Optional.of(usuario));
        when(repository.save(any(Usuario.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        EditarPersonalRequest datos = new EditarPersonalRequest(
            "Maria Elena",
            "Lopez Soto",
            "Valparaiso"
        );

        Usuario resultado = service.editarPersonal(3L,datos);

        assertEquals(3L,resultado.getId());
        assertEquals("Maria Elena",resultado.getNombre());
        assertEquals("Lopez Soto",resultado.getApellidos());
        assertEquals("Valparaiso",resultado.getDireccion());
        assertEquals("personal@sanmarcos.com",resultado.getCorreo());

        verify(repository).findById(3L);
        verify(repository).save(usuario);
    }

    @Test
    void activarPersonalPorId() {
        Usuario usuario = crearPersonal();
        usuario.setActivo(false);

        when(repository.findById(3L)).thenReturn(Optional.of(usuario));
        when(repository.save(any(Usuario.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        Usuario resultado = service.cambiarEstado(3L,true);

        assertTrue(resultado.getActivo());
        verify(repository).save(usuario);
    }

    @Test
    void desactivarPersonalPorId() {
        Usuario usuario = crearPersonal();
        when(repository.findById(3L)).thenReturn(Optional.of(usuario));
        when(repository.save(any(Usuario.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        Usuario resultado = service.cambiarEstado(3L,false);

        assertFalse(resultado.getActivo());
        verify(repository).save(usuario);
    }

    @Test
    void eliminarPersonalPorId() {
        Usuario usuario = crearPersonal();
        when(repository.findById(3L)).thenReturn(Optional.of(usuario));

        service.eliminarPersonal(3L);

        verify(repository).findById(3L);
        verify(repository).delete(usuario);
    }

    @Test
    void rechazarEdicionDeCliente() {
        Usuario usuario = crearUsuario();
        usuario.setId(2L);

        when(repository.findById(2L)).thenReturn(Optional.of(usuario));

        EditarPersonalRequest datos = new EditarPersonalRequest(
            "Nuevo Nombre",
            "Nuevo Apellido",
            "Santiago"
        );

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.editarPersonal(2L,datos)
        );

        assertEquals(HttpStatus.FORBIDDEN,error.getStatusCode());
        verify(repository,never()).save(any(Usuario.class));
    }

    @Test
    void rechazarEliminacionDeAdministrador() {
        Usuario usuario = crearUsuario();
        usuario.setId(1L);
        usuario.setRol("admin");
        usuario.setCorreo("admin@sanmarcos.com");

        when(repository.findById(1L)).thenReturn(Optional.of(usuario));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.eliminarPersonal(1L)
        );

        assertEquals(HttpStatus.FORBIDDEN,error.getStatusCode());
        verify(repository,never()).delete(any(Usuario.class));
    }

    @Test
    void rechazarIdInexistente() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        EditarPersonalRequest datos = new EditarPersonalRequest(
            "Maria",
            "Lopez",
            "Santiago"
        );

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.editarPersonal(999L,datos)
        );

        assertEquals(HttpStatus.NOT_FOUND,error.getStatusCode());
        verify(repository,never()).save(any(Usuario.class));
    }

    @Test
    void rechazarDesactivacionDeAdministrador() {
        Usuario usuario = crearUsuario();
        usuario.setId(1L);
        usuario.setRol("admin");
        usuario.setCorreo("admin@sanmarcos.com");

        when(repository.findById(1L)).thenReturn(Optional.of(usuario));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.cambiarEstado(1L,false)
        );

        assertEquals(HttpStatus.FORBIDDEN,error.getStatusCode());
        verify(repository,never()).save(any(Usuario.class));
    }

    private Usuario crearUsuario() {
        Usuario usuario = new Usuario();
        usuario.setRut("111111111");
        usuario.setNombre("Juan");
        usuario.setApellidos("Perez");
        usuario.setCorreo("juan@gmail.com");
        usuario.setDireccion("Santiago");
        usuario.setPasswordHash(new BCryptPasswordEncoder().encode("Clave123"));
        usuario.setRol("cliente");
        usuario.setActivo(true);
        return usuario;
    }

    private Usuario crearPersonal() {
        Usuario usuario = new Usuario();
        usuario.setId(3L);
        usuario.setRut("111111111");
        usuario.setNombre("Maria");
        usuario.setApellidos("Lopez");
        usuario.setCorreo("personal@sanmarcos.com");
        usuario.setDireccion("Santiago");
        usuario.setPasswordHash(new BCryptPasswordEncoder().encode("Clave123"));
        usuario.setRol("recepcionista");
        usuario.setActivo(true);
        return usuario;
    }
}