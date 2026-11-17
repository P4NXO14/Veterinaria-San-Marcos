package cl.sanmarcos.profesionales.service;

import cl.sanmarcos.profesionales.dto.ProfesionalResponse;
import cl.sanmarcos.profesionales.model.Profesional;
import cl.sanmarcos.profesionales.model.Turno;
import cl.sanmarcos.profesionales.repository.ProfesionalRepository;
import cl.sanmarcos.profesionales.repository.TurnoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfesionalServiceTest {
    @Mock
    private ProfesionalRepository profesionalRepository;

    @Mock
    private TurnoRepository turnoRepository;

    @InjectMocks
    private ProfesionalService service;

    @Test
    void listarProfesionalesOrdenadosPorId() {
        Profesional veterinario = crearProfesional(1L, "VET001");
        Profesional tecnico = crearProfesional(4L, "TEC001");

        when(profesionalRepository.findAll()).thenReturn(List.of(tecnico, veterinario));
        when(turnoRepository.findByProfesionalId(1L)).thenReturn(List.of());
        when(turnoRepository.findByProfesionalId(4L)).thenReturn(List.of());

        List<ProfesionalResponse> resultado = service.listar();

        assertEquals(2, resultado.size());
        assertEquals("VET001", resultado.get(0).codigo());
        assertEquals("TEC001", resultado.get(1).codigo());

        verify(profesionalRepository).findAll();
    }

    @Test
    void listarSinProfesionales() {
        when(profesionalRepository.findAll()).thenReturn(List.of());

        List<ProfesionalResponse> resultado = service.listar();

        assertTrue(resultado.isEmpty());
        verifyNoInteractions(turnoRepository);
    }

    @Test
    void buscarProfesionalPorId() {
        Profesional profesional = crearProfesional(1L, "VET001");
        Turno turno = crearTurno(profesional, 1, "08:30", "15:30");

        when(profesionalRepository.findById(1L)).thenReturn(Optional.of(profesional));
        when(turnoRepository.findByProfesionalId(1L)).thenReturn(List.of(turno));

        ProfesionalResponse resultado = service.buscarPorId(1L);

        assertEquals(1L, resultado.id());
        assertEquals("VET001", resultado.codigo());
        assertEquals("Medico Veterinario 1", resultado.nombre());
        assertEquals("08:30", resultado.turnos().get(1).inicio());
        assertEquals("15:30", resultado.turnos().get(1).fin());
    }

    @Test
    void buscarProfesionalPorCodigoNormalizado() {
        Profesional profesional = crearProfesional(1L, "VET001");

        when(profesionalRepository.findByCodigo("VET001")).thenReturn(Optional.of(profesional));
        when(turnoRepository.findByProfesionalId(1L)).thenReturn(List.of());

        ProfesionalResponse resultado = service.buscarPorCodigo(" vet001 ");

        assertEquals("VET001", resultado.codigo());
        verify(profesionalRepository).findByCodigo("VET001");
    }

    @Test
    void rechazarIdInexistente() {
        when(profesionalRepository.findById(999L)).thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.buscarPorId(999L)
        );

        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        verifyNoInteractions(turnoRepository);
    }

    @Test
    void rechazarCodigoInexistente() {
        when(profesionalRepository.findByCodigo("VET999")).thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.buscarPorCodigo("VET999")
        );

        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        verifyNoInteractions(turnoRepository);
    }

    @Test
    void rechazarCodigoVacio() {
        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.buscarPorCodigo(" ")
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(profesionalRepository, turnoRepository);
    }

    @Test
    void representarDiasSinTurno() {
        Profesional profesional = crearProfesional(1L, "VET001");
        Turno sabado = crearTurno(profesional, 6, "10:00", "16:00");

        when(profesionalRepository.findById(1L)).thenReturn(Optional.of(profesional));
        when(turnoRepository.findByProfesionalId(1L)).thenReturn(List.of(sabado));

        ProfesionalResponse resultado = service.buscarPorId(1L);

        assertEquals(7, resultado.turnos().size());
        assertNull(resultado.turnos().get(0));
        assertNull(resultado.turnos().get(1));
        assertEquals("10:00", resultado.turnos().get(6).inicio());
        assertEquals("16:00", resultado.turnos().get(6).fin());
    }

    private Profesional crearProfesional(Long id, String codigo) {
        Profesional profesional = new Profesional();
        profesional.setId(id);
        profesional.setCodigo(codigo);
        profesional.setNombre("Medico Veterinario 1");
        profesional.setTipo("veterinario");
        profesional.setEspecialidad("Medicina general y preventiva");
        return profesional;
    }

    private Turno crearTurno(Profesional profesional, int dia, String inicio, String fin) {
        Turno turno = new Turno();
        turno.setId(1L);
        turno.setProfesional(profesional);
        turno.setDiaSemana(dia);
        turno.setInicio(LocalTime.parse(inicio));
        turno.setFin(LocalTime.parse(fin));
        return turno;
    }
}