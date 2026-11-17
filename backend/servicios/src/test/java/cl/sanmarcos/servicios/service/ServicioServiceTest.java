package cl.sanmarcos.servicios.service;

import cl.sanmarcos.servicios.dto.ServicioResponse;
import cl.sanmarcos.servicios.model.Compatibilidad;
import cl.sanmarcos.servicios.model.Servicio;
import cl.sanmarcos.servicios.repository.CompatibilidadRepository;
import cl.sanmarcos.servicios.repository.ServicioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServicioServiceTest {
    @Mock
    private ServicioRepository servicioRepository;

    @Mock
    private CompatibilidadRepository compatibilidadRepository;

    @InjectMocks
    private ServicioService service;

    @Test
    void listarServiciosOrdenados() {
        Servicio primero = crearServicio(1L, "SV001");
        Servicio segundo = crearServicio(2L, "SV002");

        when(servicioRepository.findAllByOrderByIdAsc()).thenReturn(List.of(primero, segundo));

        List<ServicioResponse> resultado = service.listar();

        assertEquals(2, resultado.size());
        assertEquals("SV001", resultado.get(0).codigo());
        assertEquals("SV002", resultado.get(1).codigo());
        verify(servicioRepository).findAllByOrderByIdAsc();
    }

    @Test
    void listarSinServicios() {
        when(servicioRepository.findAllByOrderByIdAsc()).thenReturn(List.of());

        List<ServicioResponse> resultado = service.listar();

        assertTrue(resultado.isEmpty());
        verifyNoInteractions(compatibilidadRepository);
    }

    @Test
    void buscarServicioPorId() {
        Servicio servicio = crearServicio(1L, "SV001");

        when(servicioRepository.findById(1L)).thenReturn(Optional.of(servicio));

        ServicioResponse resultado = service.buscarPorId(1L);

        assertEquals(1L, resultado.id());
        assertEquals("SV001", resultado.codigo());
        assertEquals("Consulta general", resultado.nombre());
        assertEquals(30, resultado.duracionMinutos());
    }

    @Test
    void rechazarIdInexistente() {
        when(servicioRepository.findById(999L)).thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.buscarPorId(999L)
        );

        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
    }

    @Test
    void buscarPorCodigoNormalizado() {
        Servicio servicio = crearServicio(1L, "SV001");

        when(servicioRepository.findByCodigoIgnoreCase("SV001")).thenReturn(Optional.of(servicio));

        ServicioResponse resultado = service.buscarPorCodigo(" sv001 ");

        assertEquals("SV001", resultado.codigo());
        verify(servicioRepository).findByCodigoIgnoreCase("SV001");
    }

    @Test
    void rechazarCodigoInexistente() {
        when(servicioRepository.findByCodigoIgnoreCase("SV999")).thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.buscarPorCodigo("SV999")
        );

        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
    }

    @Test
    void rechazarCodigoVacio() {
        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.buscarPorCodigo(" ")
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(servicioRepository, compatibilidadRepository);
    }

    @Test
    void listarPorCategoria() {
        Servicio servicio = crearServicio(1L, "SV001");

        when(servicioRepository.findByCategoriaIgnoreCaseOrderByIdAsc("Consultas")).thenReturn(List.of(servicio));

        List<ServicioResponse> resultado = service.listarPorCategoria(" Consultas ");

        assertEquals(1, resultado.size());
        assertEquals("Consultas", resultado.get(0).categoria());
        verify(servicioRepository).findByCategoriaIgnoreCaseOrderByIdAsc("Consultas");
    }

    @Test
    void rechazarCategoriaVacia() {
        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.listarPorCategoria("")
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(servicioRepository);
    }

    @Test
    void obtenerProfesionalesCompatibles() {
        Servicio servicio = crearServicio(12L, "CI001");
        Compatibilidad compatibilidad = crearCompatibilidad("CI001", "VET002");

        when(servicioRepository.findByCodigoIgnoreCase("CI001")).thenReturn(Optional.of(servicio));
        when(compatibilidadRepository.findByServicioCodigoOrderByIdAsc("CI001"))
            .thenReturn(List.of(compatibilidad));

        List<String> resultado = service.profesionalesCompatibles("CI001");

        assertEquals(List.of("VET002"), resultado);
        verify(compatibilidadRepository).findByServicioCodigoOrderByIdAsc("CI001");
    }

    @Test
    void hospitalizacionSinProfesionales() {
        Servicio servicio = crearServicio(31L, "OT004");
        servicio.setDuracion("24 h");

        when(servicioRepository.findByCodigoIgnoreCase("OT004")).thenReturn(Optional.of(servicio));
        when(compatibilidadRepository.findByServicioCodigoOrderByIdAsc("OT004")).thenReturn(List.of());

        List<String> resultado = service.profesionalesCompatibles("OT004");

        assertTrue(resultado.isEmpty());
    }

    @Test
    void convertirHorasEnMinutos() {
        Servicio servicio = crearServicio(31L, "OT004");
        servicio.setDuracion("24 h");

        when(servicioRepository.findById(31L)).thenReturn(Optional.of(servicio));

        ServicioResponse resultado = service.buscarPorId(31L);

        assertEquals("24 h", resultado.duracion());
        assertEquals(1440, resultado.duracionMinutos());
    }

    @Test
    void conservarPrecioEImagen() {
        Servicio servicio = crearServicio(1L, "SV001");

        when(servicioRepository.findById(1L)).thenReturn(Optional.of(servicio));

        ServicioResponse resultado = service.buscarPorId(1L);

        assertEquals(15000, resultado.precio());
        assertEquals("/img/resto_operaciones.jpg", resultado.imagen());
        assertEquals("Perro / Gato", resultado.especie());
        assertEquals("Sin observaciones adicionales", resultado.obs());
    }

    private Servicio crearServicio(Long id, String codigo) {
        Servicio servicio = new Servicio();
        servicio.setId(id);
        servicio.setCodigo(codigo);
        servicio.setCategoria("Consultas");
        servicio.setNombre("Consulta general");
        servicio.setEspecie("Perro / Gato");
        servicio.setDuracion("30 min");
        servicio.setPrecio(15000);
        servicio.setObs("Sin observaciones adicionales");
        servicio.setImagen("/img/resto_operaciones.jpg");
        return servicio;
    }

    private Compatibilidad crearCompatibilidad(String codigoServicio, String codigoProfesional) {
        Compatibilidad compatibilidad = new Compatibilidad();
        compatibilidad.setId(1L);
        compatibilidad.setServicioCodigo(codigoServicio);
        compatibilidad.setProfesionalCodigo(codigoProfesional);
        return compatibilidad;
    }
}