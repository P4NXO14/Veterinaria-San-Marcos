package cl.sanmarcos.reservas.controller;

import cl.sanmarcos.reservas.model.Cita;
import cl.sanmarcos.reservas.service.AutorizacionReservas;
import cl.sanmarcos.reservas.service.CitaService;
import jakarta.persistence.PersistenceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.web.server.ResponseStatusException;
import java.sql.SQLException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CitaControllerTest {
    @Mock
    private CitaService service;

    @Mock
    private AutorizacionReservas autorizacion;

    private MockMvc mockMvc;

    private final AutorizacionReservas.Identidad cliente = new AutorizacionReservas.Identidad(
        "cliente@gmail.com","cliente","Cliente Prueba"
    );

    private final AutorizacionReservas.Identidad personal = new AutorizacionReservas.Identidad(
        "personal@sanmarcos.com","recepcionista","Personal San Marcos"
    );

    @BeforeEach
    void configurar() {
        mockMvc = MockMvcBuilders.standaloneSetup(new CitaController(service,autorizacion)).build();
        lenient().when(autorizacion.exigirPersonal("Basic personal")).thenReturn(personal);
        lenient().when(autorizacion.exigirCliente("Basic cliente")).thenReturn(cliente);
        lenient().when(autorizacion.exigirUsuario("Basic cliente")).thenReturn(cliente);
    }

    @Test
    void listarCitasDevuelve200() throws Exception {
        when(service.listar()).thenReturn(List.of(crearCita()));

        mockMvc.perform(get("/api/citas").header("Authorization","Basic personal"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].id").value(7))
            .andExpect(jsonPath("$[0].mascota").value("Firulais"));

        verify(service).listar();
    }

    @Test
    void listarCitasPorPropietario() throws Exception {
        when(service.listarPorPropietario("cliente@gmail.com")).thenReturn(List.of(crearCita()));

        mockMvc.perform(get("/api/citas")
            .param("propietario","cliente@gmail.com")
            .header("Authorization","Basic cliente"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].propietario").value("cliente@gmail.com"));

        verify(service).listarPorPropietario("cliente@gmail.com");
    }

    @Test
    void buscarCitaPorIdDevuelve200() throws Exception {
        when(service.buscar(7L)).thenReturn(crearCita());

        mockMvc.perform(get("/api/citas/7").header("Authorization","Basic cliente"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(7))
            .andExpect(jsonPath("$.servicio").value("SV001"))
            .andExpect(jsonPath("$.estado").value("pendiente"));

        verify(service).buscar(7L);
    }

    @Test
    void buscarCitaInexistenteDevuelve404() throws Exception {
        when(service.buscar(999L)).thenThrow(
            new ResponseStatusException(HttpStatus.NOT_FOUND,"Cita no encontrada")
        );

        mockMvc.perform(get("/api/citas/999").header("Authorization","Basic cliente"))
            .andExpect(status().isNotFound());

        verify(service).buscar(999L);
    }

    @Test
    void crearCitaDevuelve201() throws Exception {
        when(service.guardar(any(Cita.class))).thenReturn(crearCita());

        mockMvc.perform(post("/api/citas")
            .header("Authorization","Basic cliente")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datosValidos()))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(7))
            .andExpect(jsonPath("$.mascota").value("Firulais"))
            .andExpect(jsonPath("$.estado").value("pendiente"));

        verify(service).guardar(any(Cita.class));
    }

    @Test
    void rechazarCitaSinPropietario() throws Exception {
        String datos = datosValidos().replace("cliente@gmail.com","");

        mockMvc.perform(post("/api/citas")
            .header("Authorization","Basic cliente")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datos))
            .andExpect(status().isBadRequest());

        verify(service,never()).guardar(any(Cita.class));
    }

    @Test
    void rechazarCorreoInvalido() throws Exception {
        String datos = datosValidos().replace("cliente@gmail.com","correo-invalido");

        mockMvc.perform(post("/api/citas")
            .header("Authorization","Basic cliente")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datos))
            .andExpect(status().isBadRequest());

        verify(service,never()).guardar(any(Cita.class));
    }

    @Test
    void rechazarCitaSinMascota() throws Exception {
        String datos = datosValidos().replace("Firulais","");

        mockMvc.perform(post("/api/citas")
            .header("Authorization","Basic cliente")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datos))
            .andExpect(status().isBadRequest());

        verify(service,never()).guardar(any(Cita.class));
    }

    @Test
    void rechazarFechaConFormatoIncorrecto() throws Exception {
        String datos = datosValidos().replace("2026-11-20","20-11-2026");

        mockMvc.perform(post("/api/citas")
            .header("Authorization","Basic cliente")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datos))
            .andExpect(status().isBadRequest());

        verify(service,never()).guardar(any(Cita.class));
    }

    @Test
    void rechazarHoraConFormatoIncorrecto() throws Exception {
        String datos = datosValidos().replace("10:30","25:80");

        mockMvc.perform(post("/api/citas")
            .header("Authorization","Basic cliente")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datos))
            .andExpect(status().isBadRequest());

        verify(service,never()).guardar(any(Cita.class));
    }

    @Test
    void rechazarMotivoDemasiadoLargo() throws Exception {
        String datos = datosValidos().replace("Control preventivo","A".repeat(301));

        mockMvc.perform(post("/api/citas")
            .header("Authorization","Basic cliente")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datos))
            .andExpect(status().isBadRequest());

        verify(service,never()).guardar(any(Cita.class));
    }

    @Test
    void actualizarCitaPorIdDevuelve200() throws Exception {
        Cita cita = crearCita();
        cita.setMascota("Firulais Actualizado");

        when(service.actualizar(eq(7L),any(Cita.class))).thenReturn(cita);

        String datos = datosValidos().replace("Firulais","Firulais Actualizado");

        mockMvc.perform(put("/api/citas/7")
            .header("Authorization","Basic personal")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datos))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(7))
            .andExpect(jsonPath("$.mascota").value("Firulais Actualizado"));

        verify(service).actualizar(eq(7L),any(Cita.class));
    }

    @Test
    void rechazarActualizacionSinServicio() throws Exception {
        String datos = datosValidos().replace("SV001","");

        mockMvc.perform(put("/api/citas/7")
            .header("Authorization","Basic personal")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datos))
            .andExpect(status().isBadRequest());

        verify(service,never()).actualizar(any(Long.class),any(Cita.class));
    }

    @Test
    void eliminarCitaPorIdDevuelve204() throws Exception {
        mockMvc.perform(delete("/api/citas/7").header("Authorization","Basic personal"))
            .andExpect(status().isNoContent());

        verify(service).eliminar(7L);
    }

    @Test
    void crearCitaConHorarioOcupadoDevuelve409() throws Exception {
        when(service.guardar(any(Cita.class))).thenThrow(
            new ResponseStatusException(HttpStatus.CONFLICT,"Horario ocupado")
        );

        mockMvc.perform(post("/api/citas")
            .header("Authorization","Basic cliente")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datosValidos()))
            .andExpect(status().isConflict());

        verify(service).guardar(any(Cita.class));
    }

    @Test
    void actualizarSinMicroserviciosDisponiblesDevuelve503() throws Exception {
        when(service.actualizar(eq(7L),any(Cita.class))).thenThrow(
            new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Microservicio no disponible")
        );

        mockMvc.perform(put("/api/citas/7")
            .header("Authorization","Basic personal")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datosValidos()))
            .andExpect(status().isServiceUnavailable());

        verify(service).actualizar(eq(7L),any(Cita.class));
    }

    @Test
    void crearCitaConErrorDeBloqueoDevuelve409() throws Exception {
        when(service.guardar(any(Cita.class))).thenThrow(
            new CannotAcquireLockException("No se pudo obtener el bloqueo")
        );

        mockMvc.perform(post("/api/citas")
            .header("Authorization","Basic cliente")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datosValidos()))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.error").value("Conflicto de concurrencia"))
            .andExpect(jsonPath("$.mensaje").value("No se pudo completar la operacion debido a otra solicitud simultanea"));

        verify(service).guardar(any(Cita.class));
    }

    @Test
    void actualizarCitaConConflictoTransaccionalDevuelve409() throws Exception {
        when(service.actualizar(eq(7L),any(Cita.class))).thenThrow(
            new PessimisticLockingFailureException("Conflicto transaccional")
        );

        mockMvc.perform(put("/api/citas/7")
            .header("Authorization","Basic personal")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datosValidos()))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.error").value("Conflicto de concurrencia"))
            .andExpect(jsonPath("$.mensaje").value("No se pudo completar la operacion debido a otra solicitud simultanea"));

        verify(service).actualizar(eq(7L),any(Cita.class));
    }

    @Test
    void errorSqlDeadlockDevuelve409() throws Exception {
        SQLException sql = new SQLException("Deadlock","40001",1213);

        when(service.guardar(any(Cita.class))).thenThrow(
            new TransactionSystemException("Error transaccional",sql)
        );

        mockMvc.perform(post("/api/citas")
            .header("Authorization","Basic cliente")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datosValidos()))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.error").value("Conflicto de concurrencia"));

        verify(service).guardar(any(Cita.class));
    }

    @Test
    void errorSqlTiempoEsperaBloqueoDevuelve409() throws Exception {
        SQLException sql = new SQLException("Tiempo de espera agotado","HY000",1205);

        when(service.guardar(any(Cita.class))).thenThrow(
            new PersistenceException("Error de persistencia",sql)
        );

        mockMvc.perform(post("/api/citas")
            .header("Authorization","Basic cliente")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datosValidos()))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.error").value("Conflicto de concurrencia"));

        verify(service).guardar(any(Cita.class));
    }

    @Test
    void errorInternoDiferenteConserva500() throws Exception {
        SQLException sql = new SQLException("Error de conexion","08001",2003);

        when(service.guardar(any(Cita.class))).thenThrow(
            new DataAccessResourceFailureException("No se pudo conectar a MySQL",sql)
        );

        mockMvc.perform(post("/api/citas")
            .header("Authorization","Basic cliente")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datosValidos()))
            .andExpect(status().isInternalServerError())
            .andExpect(jsonPath("$.error").value("Error interno"));

        verify(service).guardar(any(Cita.class));
    }

    @Test
    void ocupacionesPublicasNoExponenDatosPersonales() throws Exception {
        Cita confirmada = crearCita();
        Cita cancelada = crearCita();
        cancelada.setId(8L);
        cancelada.setEstado("Cancelada");
        when(service.listar()).thenReturn(List.of(confirmada,cancelada));

        mockMvc.perform(get("/api/citas/ocupaciones"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].servicio").value("SV001"))
            .andExpect(jsonPath("$[0].hora").value("10:30"))
            .andExpect(jsonPath("$[0].propietario").doesNotExist())
            .andExpect(jsonPath("$[0].mascota").doesNotExist())
            .andExpect(jsonPath("$[0].motivo").doesNotExist());
    }

    @Test
    void noPermitirConsultarTodasLasCitasSinAutenticacion() throws Exception {
        when(autorizacion.exigirPersonal(null)).thenThrow(
            new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Debes autenticarte")
        );

        mockMvc.perform(get("/api/citas"))
            .andExpect(status().isUnauthorized());

        verify(service,never()).listar();
    }

    @Test
    void clienteNoPuedeConsultarListadoCompleto() throws Exception {
        when(autorizacion.exigirPersonal("Basic cliente")).thenThrow(
            new ResponseStatusException(HttpStatus.FORBIDDEN,"Solo personal")
        );

        mockMvc.perform(get("/api/citas").header("Authorization","Basic cliente"))
            .andExpect(status().isForbidden());

        verify(service,never()).listar();
    }

    @Test
    void clienteNoPuedeConsultarCitasDeOtraCuenta() throws Exception {
        mockMvc.perform(get("/api/citas")
            .param("propietario","otra@gmail.com")
            .header("Authorization","Basic cliente"))
            .andExpect(status().isForbidden());

        verify(service,never()).listarPorPropietario(any());
    }

    @Test
    void clienteNoPuedeConsultarDetalleAjeno() throws Exception {
        Cita citaAjena = crearCita();
        citaAjena.setPropietario("otra@gmail.com");
        when(service.buscar(7L)).thenReturn(citaAjena);

        mockMvc.perform(get("/api/citas/7").header("Authorization","Basic cliente"))
            .andExpect(status().isForbidden());
    }

    @Test
    void nuevaCitaUtilizaLaIdentidadAutenticada() throws Exception {
        when(service.guardar(any(Cita.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        String datos = datosValidos()
            .replace("cliente@gmail.com","otra@gmail.com")
            .replace("Cliente Prueba","Otro Nombre");

        mockMvc.perform(post("/api/citas")
            .header("Authorization","Basic cliente")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datos))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.propietario").value("cliente@gmail.com"))
            .andExpect(jsonPath("$.propietarioNombre").value("Cliente Prueba"));

        ArgumentCaptor<Cita> captor = ArgumentCaptor.forClass(Cita.class);
        verify(service).guardar(captor.capture());
        assertEquals("cliente@gmail.com",captor.getValue().getPropietario());
    }

    @Test
    void impedirActualizacionDeCitaPorCliente() throws Exception {
        when(autorizacion.exigirPersonal("Basic cliente")).thenThrow(
            new ResponseStatusException(HttpStatus.FORBIDDEN,"Solo personal")
        );

        mockMvc.perform(put("/api/citas/7")
            .header("Authorization","Basic cliente")
            .contentType(MediaType.APPLICATION_JSON)
            .content(datosValidos()))
            .andExpect(status().isForbidden());

        verify(service,never()).actualizar(any(Long.class),any(Cita.class));
    }

    @Test
    void impedirEliminacionDeCitaPorCliente() throws Exception {
        when(autorizacion.exigirPersonal("Basic cliente")).thenThrow(
            new ResponseStatusException(HttpStatus.FORBIDDEN,"Solo personal")
        );

        mockMvc.perform(delete("/api/citas/7")
            .header("Authorization","Basic cliente"))
            .andExpect(status().isForbidden());

        verify(service,never()).eliminar(anyLong());
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
        cita.setFecha("2026-11-20");
        cita.setHora("10:30");
        cita.setEstado("pendiente");
        cita.setFechaPropuesta("");
        cita.setHoraPropuesta("");
        return cita;
    }

    private String datosValidos() {
        return """
            {
                "propietario": "cliente@gmail.com",
                "propietarioNombre": "Cliente Prueba",
                "servicio": "SV001",
                "profesional": "VET001",
                "mascota": "Firulais",
                "especie": "Perro",
                "motivo": "Control preventivo",
                "fecha": "2026-11-20",
                "hora": "10:30"
            }
            """;
    }
}