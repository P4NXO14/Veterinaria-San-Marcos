package cl.sanmarcos.contacto.controller;

import cl.sanmarcos.contacto.model.Contacto;
import cl.sanmarcos.contacto.service.AutorizacionContacto;
import cl.sanmarcos.contacto.service.ContactoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ContactoControllerTest {
    @Mock
    private ContactoService service;

    @Mock
    private AutorizacionContacto autorizacion;

    private MockMvc mockMvc;

    @BeforeEach
    void configurar() {
        mockMvc = MockMvcBuilders
            .standaloneSetup(new ContactoController(service,autorizacion))
            .build();
    }

    @Test
    void clientePuedeEnviarConsulta() throws Exception {
        when(autorizacion.exigirCliente("Basic cliente")).thenReturn("cliente@gmail.com");
        when(service.guardar(any(Contacto.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        mockMvc.perform(post("/api/contactos")
            .header("Authorization","Basic cliente")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datosValidos()))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.correoCuenta").value("cliente@gmail.com"))
            .andExpect(jsonPath("$.mensaje").value("Consulta de prueba"));

        verify(service).guardar(any(Contacto.class));
    }

    @Test
    void noPermitirCrearConsultasSinAutenticacion() throws Exception {
        when(autorizacion.exigirCliente(null)).thenThrow(
            new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Debes autenticarte")
        );

        mockMvc.perform(post("/api/contactos")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datosValidos()))
            .andExpect(status().isUnauthorized());

        verify(service,never()).guardar(any(Contacto.class));
    }

    @Test
    void noPermitirCrearConsultasComoPersonal() throws Exception {
        when(autorizacion.exigirCliente("Basic personal")).thenThrow(
            new ResponseStatusException(HttpStatus.FORBIDDEN,"Solo clientes")
        );

        mockMvc.perform(post("/api/contactos")
            .header("Authorization","Basic personal")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datosValidos()))
            .andExpect(status().isForbidden());

        verify(service,never()).guardar(any(Contacto.class));
    }

    @Test
    void ignorarCorreoCuentaFalsificado() throws Exception {
        when(autorizacion.exigirCliente("Basic cliente")).thenReturn("cliente@gmail.com");
        when(service.guardar(any(Contacto.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        mockMvc.perform(post("/api/contactos")
            .header("Authorization","Basic cliente")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datosValidos()))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.correoCuenta").value("cliente@gmail.com"));

        ArgumentCaptor<Contacto> captor = ArgumentCaptor.forClass(Contacto.class);
        verify(service).guardar(captor.capture());

        assertEquals("cliente@gmail.com",captor.getValue().getCorreoCuenta());
    }

    @Test
    void personalPuedeListarTodosLosMensajes() throws Exception {
        when(autorizacion.exigirPersonal("Basic personal")).thenReturn("personal@sanmarcos.com");
        when(service.listar()).thenReturn(List.of(crearContacto()));

        mockMvc.perform(get("/api/contactos")
            .header("Authorization","Basic personal"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(7))
            .andExpect(jsonPath("$[0].mensaje").value("Consulta de prueba"));

        verify(service).listar();
    }

    @Test
    void noPermitirListarMensajesSinAutenticacion() throws Exception {
        when(autorizacion.exigirPersonal(null)).thenThrow(
            new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Debes autenticarte")
        );

        mockMvc.perform(get("/api/contactos"))
            .andExpect(status().isUnauthorized());

        verify(service,never()).listar();
    }

    @Test
    void clienteNoPuedeListarTodosLosMensajes() throws Exception {
        when(autorizacion.exigirPersonal("Basic cliente")).thenThrow(
            new ResponseStatusException(HttpStatus.FORBIDDEN,"Solo personal")
        );

        mockMvc.perform(get("/api/contactos")
            .header("Authorization","Basic cliente"))
            .andExpect(status().isForbidden());

        verify(service,never()).listar();
    }

    @Test
    void clientePuedeConsultarSusMensajes() throws Exception {
        when(autorizacion.exigirCliente("Basic cliente")).thenReturn("cliente@gmail.com");
        when(service.listarPorCuenta("cliente@gmail.com")).thenReturn(List.of(crearContacto()));

        mockMvc.perform(get("/api/contactos/mis-mensajes")
            .header("Authorization","Basic cliente"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].correoCuenta").value("cliente@gmail.com"));

        verify(service).listarPorCuenta("cliente@gmail.com");
    }

    @Test
    void personalPuedeMarcarComoAtendido() throws Exception {
        Contacto contacto = crearContacto();
        contacto.setEstado("ATENDIDO");

        when(autorizacion.exigirPersonal("Basic personal")).thenReturn("personal@sanmarcos.com");
        when(service.atender(7L)).thenReturn(contacto);

        mockMvc.perform(put("/api/contactos/7")
            .header("Authorization","Basic personal"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.estado").value("ATENDIDO"));

        verify(service).atender(7L);
    }

    @Test
    void clienteNoPuedeMarcarComoAtendido() throws Exception {
        when(autorizacion.exigirPersonal("Basic cliente")).thenThrow(
            new ResponseStatusException(HttpStatus.FORBIDDEN,"Solo personal")
        );

        mockMvc.perform(put("/api/contactos/7")
            .header("Authorization","Basic cliente"))
            .andExpect(status().isForbidden());

        verify(service,never()).atender(any(Long.class));
    }

    @Test
    void personalPuedeResponderConsultas() throws Exception {
        Contacto contacto = crearContacto();
        contacto.setEstado("ATENDIDO");
        contacto.setRespuesta("Respuesta de prueba");
        contacto.setRespondidoPor("personal@sanmarcos.com");

        when(autorizacion.exigirPersonal("Basic personal")).thenReturn("personal@sanmarcos.com");
        when(service.responder(7L,"Respuesta de prueba","personal@sanmarcos.com")).thenReturn(contacto);

        mockMvc.perform(put("/api/contactos/7/respuesta")
            .header("Authorization","Basic personal")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"respuesta\":\"Respuesta de prueba\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.estado").value("ATENDIDO"))
            .andExpect(jsonPath("$.respuesta").value("Respuesta de prueba"));

        verify(service).responder(7L,"Respuesta de prueba","personal@sanmarcos.com");
    }

    @Test
    void clienteNoPuedeResponderConsultas() throws Exception {
        when(autorizacion.exigirPersonal("Basic cliente")).thenThrow(
            new ResponseStatusException(HttpStatus.FORBIDDEN,"Solo personal")
        );

        mockMvc.perform(put("/api/contactos/7/respuesta")
            .header("Authorization","Basic cliente")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"respuesta\":\"Respuesta no autorizada\"}"))
            .andExpect(status().isForbidden());

        verify(service,never()).responder(any(Long.class),any(String.class),any(String.class));
    }

    @Test
    void personalPuedeEliminarMensajes() throws Exception {
        when(autorizacion.exigirPersonal("Basic personal")).thenReturn("personal@sanmarcos.com");

        mockMvc.perform(delete("/api/contactos/7")
            .header("Authorization","Basic personal"))
            .andExpect(status().isNoContent());

        verify(service).eliminar(7L);
    }

    @Test
    void clienteNoPuedeEliminarMensajes() throws Exception {
        when(autorizacion.exigirPersonal("Basic cliente")).thenThrow(
            new ResponseStatusException(HttpStatus.FORBIDDEN,"Solo personal")
        );

        mockMvc.perform(delete("/api/contactos/7")
            .header("Authorization","Basic cliente"))
            .andExpect(status().isForbidden());

        verify(service,never()).eliminar(any(Long.class));
    }

    @Test
    void noPermitirEliminarSinAutenticacion() throws Exception {
        when(autorizacion.exigirPersonal(null)).thenThrow(
            new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Debes autenticarte")
        );

        mockMvc.perform(delete("/api/contactos/7"))
            .andExpect(status().isUnauthorized());

        verify(service,never()).eliminar(any(Long.class));
    }

    private Contacto crearContacto() {
        Contacto contacto = new Contacto();
        contacto.setId(7L);
        contacto.setNombreCompleto("Cliente Prueba");
        contacto.setCorreo("consulta@gmail.com");
        contacto.setCorreoCuenta("cliente@gmail.com");
        contacto.setMensaje("Consulta de prueba");
        contacto.setEstado("PENDIENTE");
        contacto.setFechaCreacion(LocalDateTime.of(2026,11,18,10,30));
        return contacto;
    }

    private String datosValidos() {
        return """
            {
                "nombreCompleto": "Cliente Prueba",
                "correo": "consulta@gmail.com",
                "correoCuenta": "otra@gmail.com",
                "mensaje": "Consulta de prueba"
            }
            """;
    }
}