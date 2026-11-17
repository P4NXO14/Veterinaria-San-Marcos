package cl.sanmarcos.servicios.controller;

import cl.sanmarcos.servicios.dto.ServicioResponse;
import cl.sanmarcos.servicios.service.ServicioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ServicioControllerTest {
    @Mock
    private ServicioService service;

    private MockMvc mockMvc;

    @BeforeEach
    void configurar() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ServicioController(service)).build();
    }

    @Test
    void listarServiciosDevuelve200() throws Exception {
        when(service.listar()).thenReturn(List.of(crearRespuesta()));

        mockMvc.perform(get("/api/servicios"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].codigo").value("SV001"))
            .andExpect(jsonPath("$[0].precio").value(15000));

        verify(service).listar();
    }

    @Test
    void listarSinServiciosDevuelveListaVacia() throws Exception {
        when(service.listar()).thenReturn(List.of());

        mockMvc.perform(get("/api/servicios"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));

        verify(service).listar();
    }

    @Test
    void buscarPorIdDevuelve200() throws Exception {
        when(service.buscarPorId(1L)).thenReturn(crearRespuesta());

        mockMvc.perform(get("/api/servicios/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nombre").value("Consulta general"))
            .andExpect(jsonPath("$.duracionMinutos").value(30));

        verify(service).buscarPorId(1L);
    }

    @Test
    void buscarPorCodigoDevuelve200() throws Exception {
        when(service.buscarPorCodigo("SV001")).thenReturn(crearRespuesta());

        mockMvc.perform(get("/api/servicios/codigo/SV001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.codigo").value("SV001"))
            .andExpect(jsonPath("$.especie").value("Perro / Gato"));

        verify(service).buscarPorCodigo("SV001");
    }

    @Test
    void listarPorCategoriaDevuelve200() throws Exception {
        when(service.listarPorCategoria("Consultas")).thenReturn(List.of(crearRespuesta()));

        mockMvc.perform(get("/api/servicios/categoria/Consultas"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].categoria").value("Consultas"));

        verify(service).listarPorCategoria("Consultas");
    }

    @Test
    void obtenerProfesionalesDevuelve200() throws Exception {
        when(service.profesionalesCompatibles("CI001")).thenReturn(List.of("VET002"));

        mockMvc.perform(get("/api/servicios/codigo/CI001/profesionales"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0]").value("VET002"));

        verify(service).profesionalesCompatibles("CI001");
    }

    @Test
    void buscarIdInexistenteDevuelve404() throws Exception {
        when(service.buscarPorId(999L)).thenThrow(
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Servicio no encontrado")
        );

        mockMvc.perform(get("/api/servicios/999"))
            .andExpect(status().isNotFound());

        verify(service).buscarPorId(999L);
    }

    @Test
    void hospitalizacionDevuelveListaVacia() throws Exception {
        when(service.profesionalesCompatibles("OT004")).thenReturn(List.of());

        mockMvc.perform(get("/api/servicios/codigo/OT004/profesionales"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));

        verify(service).profesionalesCompatibles("OT004");
    }

    private ServicioResponse crearRespuesta() {
        return new ServicioResponse(
            1L,
            "SV001",
            "Consultas",
            "Consulta general",
            "Perro / Gato",
            "30 min",
            30,
            15000,
            "Sin observaciones adicionales",
            "/img/resto_operaciones.jpg"
        );
    }
}