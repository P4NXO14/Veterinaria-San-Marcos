package cl.sanmarcos.reservas.service;

import cl.sanmarcos.reservas.model.Cita;
import cl.sanmarcos.reservas.repository.CitaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.SimpleTransactionStatus;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CitaServiceTest {
    @Mock
    private CitaRepository repository;

    @Mock
    private DisponibilidadService disponibilidad;

    @Mock
    private DataSource dataSource;

    @Mock
    private PlatformTransactionManager transactionManager;

    @Mock
    private Connection conexion;

    @Mock
    private PreparedStatement sentencia;

    @Mock
    private ResultSet resultadoSql;

    @InjectMocks
    private CitaService service;

    @Test
    void listarTodasLasCitas() {
        Cita primera = crearCita();
        Cita segunda = crearCita();
        segunda.setId(8L);
        segunda.setMascota("Luna");

        when(repository.findAll()).thenReturn(List.of(primera, segunda));

        List<Cita> resultado = service.listar();

        assertEquals(2, resultado.size());
        assertEquals(7L, resultado.get(0).getId());
        assertEquals(8L, resultado.get(1).getId());
        verify(repository).findAll();
    }

    @Test
    void listarCitasSinRegistros() {
        when(repository.findAll()).thenReturn(List.of());

        assertTrue(service.listar().isEmpty());
        verify(repository).findAll();
    }

    @Test
    void listarCitasPorPropietario() {
        Cita cita = crearCita();
        when(repository.findByPropietario("cliente@gmail.com")).thenReturn(List.of(cita));

        List<Cita> resultado = service.listarPorPropietario("cliente@gmail.com");

        assertEquals(1, resultado.size());
        assertEquals("cliente@gmail.com", resultado.get(0).getPropietario());
        verify(repository).findByPropietario("cliente@gmail.com");
    }

    @Test
    void listarPropietarioSinCitas() {
        when(repository.findByPropietario("sinreservas@gmail.com")).thenReturn(List.of());

        assertTrue(service.listarPorPropietario("sinreservas@gmail.com").isEmpty());
    }

    @Test
    void buscarCitaPorId() {
        Cita cita = crearCita();
        when(repository.findById(7L)).thenReturn(Optional.of(cita));

        Cita resultado = service.buscar(7L);

        assertEquals(7L, resultado.getId());
        assertEquals("Firulais", resultado.getMascota());
        assertEquals("SV001", resultado.getServicio());
        verify(repository).findById(7L);
    }

    @Test
    void rechazarBusquedaDeCitaInexistente() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.buscar(999L)
        );

        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
    }

    @Test
    void registrarCitaConEstadoPendiente() throws Exception {
        configurarBloqueo(1, true);

        Cita cita = crearCita();
        cita.setId(50L);
        cita.setEstado("Confirmada");
        cita.setFechaPropuesta(fechaFutura());
        cita.setHoraPropuesta("12:00");

        when(repository.save(any(Cita.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        Cita resultado = service.guardar(cita);

        assertNull(resultado.getId());
        assertEquals("pendiente", resultado.getEstado());
        assertEquals("", resultado.getFechaPropuesta());
        assertEquals("", resultado.getHoraPropuesta());

        verify(disponibilidad).validar(cita, null);
        verify(repository).save(cita);
    }

    @Test
    void registrarCitaConservandoDatos() throws Exception {
        configurarBloqueo(1, true);

        Cita cita = crearCita();

        when(repository.save(any(Cita.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        Cita resultado = service.guardar(cita);

        assertEquals("cliente@gmail.com", resultado.getPropietario());
        assertEquals("Cliente Prueba", resultado.getPropietarioNombre());
        assertEquals("SV001", resultado.getServicio());
        assertEquals("VET001", resultado.getProfesional());
        assertEquals("Firulais", resultado.getMascota());
        assertEquals("Perro", resultado.getEspecie());
        assertEquals("Control preventivo", resultado.getMotivo());
        assertEquals(fechaFutura(), resultado.getFecha());
        assertEquals("10:30", resultado.getHora());
    }

    @Test
    void actualizarCitaPorId() {
        Cita actual = crearCita();
        Cita datos = crearCita();
        datos.setId(90L);
        datos.setPropietario("otro@gmail.com");
        datos.setServicio("SV002");
        datos.setProfesional("VET002");
        datos.setMascota("Luna");
        datos.setEspecie("Gato");
        datos.setMotivo("Consulta general");
        datos.setEstado("Confirmada");

        when(repository.findById(7L)).thenReturn(Optional.of(actual));
        when(repository.save(any(Cita.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        Cita resultado = service.actualizar(7L, datos);

        assertEquals(7L, resultado.getId());
        assertEquals("cliente@gmail.com", resultado.getPropietario());
        assertEquals("SV002", resultado.getServicio());
        assertEquals("VET002", resultado.getProfesional());
        assertEquals("Luna", resultado.getMascota());
        assertEquals("Gato", resultado.getEspecie());
        assertEquals("Confirmada", resultado.getEstado());

        verify(disponibilidad).validar(any(Cita.class), eq(7L));
        verify(repository).save(actual);
    }

    @Test
    void rechazarActualizacionDeCitaInexistente() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.actualizar(999L, crearCita())
        );

        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        verify(repository, never()).save(any(Cita.class));
    }

    @Test
    void eliminarCitaPorId() {
        Cita cita = crearCita();
        when(repository.findById(7L)).thenReturn(Optional.of(cita));

        service.eliminar(7L);

        verify(repository).findById(7L);
        verify(repository).delete(cita);
    }

    @Test
    void rechazarEliminacionDeCitaInexistente() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.eliminar(999L)
        );

        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        verify(repository, never()).delete(any(Cita.class));
    }

    @Test
    void proponerHorarioMantieneHorarioOriginal() {
        Cita actual = crearCita();
        Cita datos = crearCita();
        datos.setEstado("Horario propuesto");
        datos.setFechaPropuesta(fechaFutura());
        datos.setHoraPropuesta("14:00");

        when(repository.findById(7L)).thenReturn(Optional.of(actual));
        when(repository.save(any(Cita.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        Cita resultado = service.actualizar(7L, datos);

        assertEquals("10:30", resultado.getHora());
        assertEquals("Horario propuesto", resultado.getEstado());
        assertEquals("14:00", resultado.getHoraPropuesta());

        verify(disponibilidad).validar(any(Cita.class), eq(7L));
    }

    @Test
    void confirmarPropuestaEstableceHorarioDefinitivo() {
        Cita actual = crearCita();
        actual.setEstado("Horario propuesto");
        actual.setFechaPropuesta(fechaFutura());
        actual.setHoraPropuesta("14:00");

        Cita datos = crearCita();
        datos.setEstado("Confirmada");

        when(repository.findById(7L)).thenReturn(Optional.of(actual));
        when(repository.save(any(Cita.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        Cita resultado = service.actualizar(7L, datos);

        assertEquals("Confirmada", resultado.getEstado());
        assertEquals(fechaFutura(), resultado.getFecha());
        assertEquals("14:00", resultado.getHora());
        assertEquals("", resultado.getFechaPropuesta());
        assertEquals("", resultado.getHoraPropuesta());

        verify(disponibilidad).validar(any(Cita.class), eq(7L));
    }

    @Test
    void cancelarCitaLiberaPropuesta() {
        Cita actual = crearCita();
        actual.setEstado("Horario propuesto");
        actual.setFechaPropuesta(fechaFutura());
        actual.setHoraPropuesta("14:00");

        Cita datos = crearCita();
        datos.setEstado("Cancelada");

        when(repository.findById(7L)).thenReturn(Optional.of(actual));
        when(repository.save(any(Cita.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        Cita resultado = service.actualizar(7L, datos);

        assertEquals("Cancelada", resultado.getEstado());
        assertEquals("", resultado.getFechaPropuesta());
        assertEquals("", resultado.getHoraPropuesta());
        verifyNoInteractions(disponibilidad);
    }

    @Test
    void rechazarTransicionNoPermitida() {
        Cita actual = crearCita();
        actual.setEstado("Confirmada");

        Cita datos = crearCita();
        datos.setEstado("pendiente");

        when(repository.findById(7L)).thenReturn(Optional.of(actual));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.actualizar(7L, datos)
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(repository, never()).save(any(Cita.class));
    }

    @Test
    void impedirModificarCitaCancelada() {
        Cita actual = crearCita();
        actual.setEstado("Cancelada");

        when(repository.findById(7L)).thenReturn(Optional.of(actual));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.actualizar(7L, crearCita())
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(repository, never()).save(any(Cita.class));
    }

    @Test
    void rechazarEstadoDesconocido() {
        Cita datos = crearCita();
        datos.setEstado("Finalizada");

        when(repository.findById(7L)).thenReturn(Optional.of(crearCita()));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.actualizar(7L, datos)
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verify(repository, never()).save(any(Cita.class));
    }

    @Test
    void noGuardarCuandoExisteConflicto() throws Exception {
        configurarBloqueo(1, true);

        Cita cita = crearCita();

        doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Horario ocupado"))
            .when(disponibilidad).validar(cita, null);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.guardar(cita)
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(repository, never()).save(any(Cita.class));
    }

    @Test
    void noGuardarSiProfesionalesNoResponde() throws Exception {
        configurarBloqueo(1, true);

        Cita cita = crearCita();

        doThrow(new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Profesionales no disponible"))
            .when(disponibilidad).validar(cita, null);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.guardar(cita)
        );

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, error.getStatusCode());
        verify(repository, never()).save(any(Cita.class));
    }

    @Test
    void validarDisponibilidadConsultandoMicroservicios() {
        RestTemplate cliente = mock(RestTemplate.class);
        configurarConsultas(cliente);

        Cita cita = crearCita();

        when(repository.buscarPosiblesConflictos("VET001", fechaFutura())).thenReturn(List.of());

        DisponibilidadService servicio = new DisponibilidadService(
            repository, cliente, "http://localhost:8085", "http://localhost:8083"
        );

        assertDoesNotThrow(() -> servicio.validar(cita, null));

        verify(cliente).getForObject(
            "http://localhost:8085/api/servicios/codigo/{codigo}",
            DisponibilidadService.ServicioRemoto.class,
            "SV001"
        );

        verify(cliente).getForObject(
            "http://localhost:8083/api/profesionales/codigo/{codigo}",
            DisponibilidadService.ProfesionalRemoto.class,
            "VET001"
        );
    }

    @Test
    void detectarSuperposicionDeHorarios() {
        RestTemplate cliente = mock(RestTemplate.class);
        configurarConsultas(cliente);

        Cita existente = crearCita();
        existente.setId(8L);
        existente.setHora("10:30");

        when(repository.buscarPosiblesConflictos("VET001", fechaFutura()))
            .thenReturn(List.of(existente));

        DisponibilidadService servicio = new DisponibilidadService(
            repository, cliente, "http://localhost:8085", "http://localhost:8083"
        );

        Cita nueva = crearCita();

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> servicio.validar(nueva, null)
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
    }

    @Test
    void rechazarHorarioFueraDeTurno() {
        RestTemplate cliente = mock(RestTemplate.class);
        configurarConsultas(cliente);

        Cita cita = crearCita();
        cita.setHora("16:00");

        DisponibilidadService servicio = new DisponibilidadService(
            repository, cliente, "http://localhost:8085", "http://localhost:8083"
        );

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> servicio.validar(cita, null)
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verify(repository, never()).buscarPosiblesConflictos(anyString(), anyString());
    }

    @Test
    void rechazarProfesionalIncompatible() {
        RestTemplate cliente = mock(RestTemplate.class);

        when(cliente.getForObject(
            "http://localhost:8085/api/servicios/codigo/{codigo}",
            DisponibilidadService.ServicioRemoto.class,
            "SV001"
        )).thenReturn(crearServicioRemoto());

        when(cliente.getForObject(
            "http://localhost:8085/api/servicios/codigo/{codigo}/profesionales",
            String[].class,
            "SV001"
        )).thenReturn(new String[]{"VET002"});

        DisponibilidadService servicio = new DisponibilidadService(
            repository, cliente, "http://localhost:8085", "http://localhost:8083"
        );

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> servicio.validar(crearCita(), null)
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
    }

    @Test
    void rechazarSiMicroservicioNoEstaDisponible() {
        RestTemplate cliente = mock(RestTemplate.class);

        when(cliente.getForObject(
            "http://localhost:8085/api/servicios/codigo/{codigo}",
            DisponibilidadService.ServicioRemoto.class,
            "SV001"
        )).thenThrow(new ResourceAccessException("Servicio desconectado"));

        DisponibilidadService servicio = new DisponibilidadService(
            repository, cliente, "http://localhost:8085", "http://localhost:8083"
        );

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> servicio.validar(crearCita(), null)
        );

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, error.getStatusCode());
    }

    @Test
    void rechazarCitaEnFechaPasada() {
        RestTemplate cliente = mock(RestTemplate.class);
        Cita cita = crearCita();
        cita.setFecha("2020-01-01");

        DisponibilidadService servicio = new DisponibilidadService(
            repository, cliente, "http://localhost:8085", "http://localhost:8083"
        );

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> servicio.validar(cita, null)
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(cliente);
    }

    @Test
    void liberarBloqueoDespuesDeConfirmarTransaccion() throws Exception {
        configurarBloqueo(1, true);

        Cita cita = crearCita();

        when(repository.save(any(Cita.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        service.guardar(cita);

        InOrder orden = inOrder(transactionManager, conexion);

        orden.verify(transactionManager).commit(any());
        orden.verify(conexion).prepareStatement("SELECT RELEASE_LOCK(?)");

        verify(sentencia, times(2)).setString(
            eq(1),
            eq("sanmarcos:reservas:VET001:" + fechaFutura())
        );
    }

    @Test
    void rechazarCuandoNoSeObtieneBloqueo() throws Exception {
        configurarBloqueo(0, false);

        Cita cita = crearCita();

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.guardar(cita)
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());

        verifyNoInteractions(disponibilidad);
        verify(repository, never()).save(any(Cita.class));
        verify(transactionManager, never()).getTransaction(any());
        verify(conexion, never()).prepareStatement("SELECT RELEASE_LOCK(?)");
    }

    private void configurarBloqueo(int respuestaBloqueo, boolean iniciarTransaccion) throws Exception {
        when(dataSource.getConnection()).thenReturn(conexion);
        when(conexion.prepareStatement(anyString())).thenReturn(sentencia);
        when(sentencia.executeQuery()).thenReturn(resultadoSql);
        when(resultadoSql.next()).thenReturn(true);
        when(resultadoSql.getInt(1)).thenReturn(respuestaBloqueo, 1);

        if (iniciarTransaccion) {
            when(transactionManager.getTransaction(any())).thenReturn(new SimpleTransactionStatus());
        }
    }

    private void configurarConsultas(RestTemplate cliente) {
        when(cliente.getForObject(
            "http://localhost:8085/api/servicios/codigo/{codigo}",
            DisponibilidadService.ServicioRemoto.class,
            "SV001"
        )).thenReturn(crearServicioRemoto());

        when(cliente.getForObject(
            "http://localhost:8085/api/servicios/codigo/{codigo}/profesionales",
            String[].class,
            "SV001"
        )).thenReturn(new String[]{"VET001", "VET002", "VET003"});

        when(cliente.getForObject(
            "http://localhost:8083/api/profesionales/codigo/{codigo}",
            DisponibilidadService.ProfesionalRemoto.class,
            "VET001"
        )).thenReturn(new DisponibilidadService.ProfesionalRemoto(
            1L,
            "VET001",
            "Medico Veterinario 1",
            "veterinario",
            "Medicina general y preventiva",
            Map.of("1", new DisponibilidadService.TurnoRemoto("08:30", "15:30"))
        ));
    }

    private DisponibilidadService.ServicioRemoto crearServicioRemoto() {
        return new DisponibilidadService.ServicioRemoto(
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

    private String fechaFutura() {
        LocalDate fecha = LocalDate.now(ZoneId.of("America/Santiago")).plusDays(1);

        while (fecha.getDayOfWeek() != DayOfWeek.MONDAY) {
            fecha = fecha.plusDays(1);
        }

        return fecha.toString();
    }

    private Cita crearCita() {
        Cita cita = new Cita();
        cita.setId(7L);
        cita.setPropietario("cliente@gmail.com");
        cita.setPropietarioNombre("Cliente Prueba");
        cita.setServicio("SV001");
        cita.setProfesional("VET001");
        cita.setMascota("Firulais");
        cita.setEspecie("Perro");
        cita.setMotivo("Control preventivo");
        cita.setFecha(fechaFutura());
        cita.setHora("10:30");
        cita.setEstado("pendiente");
        cita.setFechaPropuesta("");
        cita.setHoraPropuesta("");
        return cita;
    }
}