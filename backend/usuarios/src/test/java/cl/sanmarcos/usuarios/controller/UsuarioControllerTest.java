package cl.sanmarcos.usuarios.controller;

import cl.sanmarcos.usuarios.dto.EditarPersonalRequest;
import cl.sanmarcos.usuarios.dto.EstadoPersonalRequest;
import cl.sanmarcos.usuarios.dto.LoginRequest;
import cl.sanmarcos.usuarios.dto.PersonalRequest;
import cl.sanmarcos.usuarios.dto.RegistroRequest;
import cl.sanmarcos.usuarios.model.Usuario;
import cl.sanmarcos.usuarios.service.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UsuarioControllerTest {
    @Mock
    private UsuarioService service;

    private MockMvc mockMvc;

    @BeforeEach
    void configurar() {
        mockMvc = MockMvcBuilders.standaloneSetup(new UsuarioController(service)).build();
    }

    @Test
    void registrarClienteDevuelve201() throws Exception {
        Usuario usuario = crearUsuario(2L, "cliente");
        when(service.registrar(any(RegistroRequest.class))).thenReturn(usuario);

        mockMvc.perform(post("/api/usuarios/registro")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                    "rut": "111111111",
                    "nombre": "Juan",
                    "apellidos": "Perez",
                    "correo": "juan@gmail.com",
                    "direccion": "Santiago",
                    "password": "Clave123"
                }
                """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(2))
            .andExpect(jsonPath("$.rol").value("cliente"))
            .andExpect(jsonPath("$.correo").value("juan@gmail.com"))
            .andExpect(jsonPath("$.passwordHash").doesNotExist());

        verify(service).registrar(any(RegistroRequest.class));
    }

    @Test
    void iniciarSesionDevuelve200() throws Exception {
        Usuario usuario = crearUsuario(2L, "cliente");
        when(service.iniciarSesion(any(LoginRequest.class))).thenReturn(usuario);

        mockMvc.perform(post("/api/usuarios/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                    "correo": "juan@gmail.com",
                    "password": "Clave123"
                }
                """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(2))
            .andExpect(jsonPath("$.rol").value("cliente"))
            .andExpect(jsonPath("$.passwordHash").doesNotExist());

        verify(service).iniciarSesion(any(LoginRequest.class));
    }

    @Test
    void rechazarRegistroConCamposVacios() throws Exception {
        mockMvc.perform(post("/api/usuarios/registro")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                    "rut": "",
                    "nombre": "",
                    "apellidos": "",
                    "correo": "",
                    "direccion": "",
                    "password": ""
                }
                """))
            .andExpect(status().isBadRequest());

        verify(service, never()).registrar(any(RegistroRequest.class));
    }

    @Test
    void rechazarLoginSinCorreo() throws Exception {
        mockMvc.perform(post("/api/usuarios/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                    "correo": "",
                    "password": "Clave123"
                }
                """))
            .andExpect(status().isBadRequest());

        verify(service, never()).iniciarSesion(any(LoginRequest.class));
    }

    @Test
    void listarUsuariosDevuelve200() throws Exception {
        Usuario cliente = crearUsuario(2L, "cliente");
        Usuario personal = crearUsuario(3L, "recepcionista");

        when(service.listar()).thenReturn(List.of(cliente, personal));

        mockMvc.perform(get("/api/usuarios/admin/usuarios"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].id").value(2))
            .andExpect(jsonPath("$[1].id").value(3))
            .andExpect(jsonPath("$[1].rol").value("recepcionista"));

        verify(service).listar();
    }

    @Test
    void crearPersonalDevuelve201() throws Exception {
        Usuario usuario = crearUsuario(3L, "recepcionista");
        when(service.crearPersonal(any(PersonalRequest.class))).thenReturn(usuario);

        mockMvc.perform(post("/api/usuarios/admin/personal")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                    "rut": "111111111",
                    "nombre": "Maria",
                    "apellidos": "Lopez",
                    "correo": "personal@sanmarcos.com",
                    "direccion": "Santiago",
                    "password": "Clave123"
                }
                """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(3))
            .andExpect(jsonPath("$.rol").value("recepcionista"))
            .andExpect(jsonPath("$.activo").value(true));

        verify(service).crearPersonal(any(PersonalRequest.class));
    }

    @Test
    void editarPersonalPorIdDevuelve200() throws Exception {
        Usuario usuario = crearUsuario(3L, "recepcionista");
        usuario.setNombre("Maria Elena");
        usuario.setApellidos("Lopez Soto");
        usuario.setDireccion("Valparaiso");

        when(service.editarPersonal(eq(3L), any(EditarPersonalRequest.class))).thenReturn(usuario);

        mockMvc.perform(put("/api/usuarios/admin/personal/3")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                    "nombre": "Maria Elena",
                    "apellidos": "Lopez Soto",
                    "direccion": "Valparaiso"
                }
                """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(3))
            .andExpect(jsonPath("$.nombre").value("Maria Elena"))
            .andExpect(jsonPath("$.direccion").value("Valparaiso"));

        verify(service).editarPersonal(eq(3L), any(EditarPersonalRequest.class));
    }

    @Test
    void desactivarPersonalPorIdDevuelve200() throws Exception {
        Usuario usuario = crearUsuario(3L, "recepcionista");
        usuario.setActivo(false);

        when(service.cambiarEstado(3L, false)).thenReturn(usuario);

        mockMvc.perform(patch("/api/usuarios/admin/personal/3/estado")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                    "activo": false
                }
                """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(3))
            .andExpect(jsonPath("$.activo").value(false));

        verify(service).cambiarEstado(3L, false);
    }

    @Test
    void rechazarEstadoSinValor() throws Exception {
        mockMvc.perform(patch("/api/usuarios/admin/personal/3/estado")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                    "activo": null
                }
                """))
            .andExpect(status().isBadRequest());

        verify(service, never()).cambiarEstado(any(Long.class), anyBoolean());
    }

    @Test
    void eliminarPersonalPorIdDevuelve204() throws Exception {
        mockMvc.perform(delete("/api/usuarios/admin/personal/3"))
            .andExpect(status().isNoContent());

        verify(service).eliminarPersonal(3L);
    }

    private Usuario crearUsuario(Long id, String rol) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setRut("111111111");
        usuario.setNombre("Juan");
        usuario.setApellidos("Perez");
        usuario.setCorreo("juan@gmail.com");
        usuario.setDireccion("Santiago");
        usuario.setPasswordHash("hash-de-prueba");
        usuario.setRol(rol);
        usuario.setActivo(true);
        return usuario;
    }
}