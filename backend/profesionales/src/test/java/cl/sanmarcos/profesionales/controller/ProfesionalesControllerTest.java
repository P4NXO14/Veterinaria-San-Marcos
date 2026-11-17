package cl.sanmarcos.profesionales.controller;

import cl.sanmarcos.profesionales.dto.ProfesionalResponse;
import cl.sanmarcos.profesionales.service.ProfesionalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ProfesionalControllerTest {
    @Mock
    private ProfesionalService service;

    private MockMvc mockMvc;

    @BeforeEach
    void configurar() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ProfesionalController(service)).build();
    }

    @Test
    void listarProfesionalesDevuelve200() throws Exception {
        when(service.listar()).thenReturn(List.of(crearRespuesta()));

        mockMvc.perform(get("/api/profesionales"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[0].codigo").value("VET001"))
            .andExpect(jsonPath("$[0].tipo").value("veterinario"));

        verify(service).listar();
    }

    @Test
    void listarSinProfesionalesDevuelveListaVacia() throws Exception {
        when(service.listar()).thenReturn(List.of());

        mockMvc.perform(get("/api/profesionales"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));

        verify(service).listar();
    }

    @Test
    void buscarPorIdDevuelve200() throws Exception {
        when(service.buscarPorId(1L)).thenReturn(crearRespuesta());

        mockMvc.perform(get("/api/profesionales/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nombre").value("Medico Veterinario 1"))
            .andExpect(jsonPath("$.turnos['1'].inicio").value("08:30"));

        verify(service).buscarPorId(1L);
    }

    @Test
    void buscarPorCodigoDevuelve200() throws Exception {
        when(service.buscarPorCodigo("VET001")).thenReturn(crearRespuesta());

        mockMvc.perform(get("/api/profesionales/codigo/VET001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.codigo").value("VET001"))
            .andExpect(jsonPath("$.especialidad").value("Medicina general y preventiva"));

        verify(service).buscarPorCodigo("VET001");
    }

    @Test
    void buscarIdInexistenteDevuelve404() throws Exception {
        when(service.buscarPorId(999L)).thenThrow(
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Profesional no encontrado")
        );

        mockMvc.perform(get("/api/profesionales/999"))
            .andExpect(status().isNotFound());

        verify(service).buscarPorId(999L);
    }

    @Test
    void buscarCodigoInexistenteDevuelve404() throws Exception {
        when(service.buscarPorCodigo("VET999")).thenThrow(
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Profesional no encontrado")
        );

        mockMvc.perform(get("/api/profesionales/codigo/VET999"))
            .andExpect(status().isNotFound());

        verify(service).buscarPorCodigo("VET999");
    }

    private ProfesionalResponse crearRespuesta() {
        Map<Integer, ProfesionalResponse.TurnoResponse> turnos = new LinkedHashMap<>();

        for (int dia = 0; dia <= 6; dia++) {
            turnos.put(dia, null);
        }

        turnos.put(1, new ProfesionalResponse.TurnoResponse("08:30", "15:30"));

        return new ProfesionalResponse(
            1L,
            "VET001",
            "Medico Veterinario 1",
            "veterinario",
            "Medicina general y preventiva",
            turnos
        );
    }
}