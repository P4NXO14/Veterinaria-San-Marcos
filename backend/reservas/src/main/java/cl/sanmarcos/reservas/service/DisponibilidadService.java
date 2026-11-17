package cl.sanmarcos.reservas.service;

import cl.sanmarcos.reservas.model.Cita;
import cl.sanmarcos.reservas.repository.CitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class DisponibilidadService {
    private final CitaRepository repository;
    private final RestTemplate cliente;
    private final String urlServicios;
    private final String urlProfesionales;

    private static final ZoneId ZONA = ZoneId.of("America/Santiago");

    @Autowired
    public DisponibilidadService(
        CitaRepository repository,
        @Value("${sanmarcos.servicios.url:http://localhost:8085}") String urlServicios,
        @Value("${sanmarcos.profesionales.url:http://localhost:8083}") String urlProfesionales
    ) {
        this(repository, crearCliente(), urlServicios, urlProfesionales);
    }

    DisponibilidadService(
        CitaRepository repository,
        RestTemplate cliente,
        String urlServicios,
        String urlProfesionales
    ) {
        this.repository = repository;
        this.cliente = cliente;
        this.urlServicios = urlServicios;
        this.urlProfesionales = urlProfesionales;
    }

    private static RestTemplate crearCliente() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2000);
        factory.setReadTimeout(2000);
        return new RestTemplate(factory);
    }

    public void validar(Cita cita, Long excluirId) {
        if (cita.getServicio() == null || cita.getServicio().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El servicio es obligatorio");
        }

        if (cita.getProfesional() == null || cita.getProfesional().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El profesional es obligatorio");
        }

        String servicioCodigo = cita.getServicio().trim().toUpperCase(Locale.ROOT);
        String profesionalCodigo = cita.getProfesional().trim().toUpperCase(Locale.ROOT);

        LocalDate fecha = convertirFecha(cita.getFecha());
        LocalTime hora = convertirHora(cita.getHora());

        validarFechaFutura(fecha, hora);

        if (hora.getMinute() % 30 != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Las horas deben comenzar en intervalos de 30 minutos");
        }

        ServicioRemoto servicio = consultar(
            urlServicios + "/api/servicios/codigo/{codigo}",
            ServicioRemoto.class,
            servicioCodigo,
            "Servicio no encontrado"
        );

        if (servicio.duracionMinutos() == null || servicio.duracionMinutos() <= 0) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Duracion del servicio no disponible");
        }

        String[] compatibles = consultar(
            urlServicios + "/api/servicios/codigo/{codigo}/profesionales",
            String[].class,
            servicioCodigo,
            "Servicio no encontrado"
        );

        if (!Arrays.asList(compatibles).contains(profesionalCodigo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El profesional no puede realizar este servicio");
        }

        ProfesionalRemoto profesional = consultar(
            urlProfesionales + "/api/profesionales/codigo/{codigo}",
            ProfesionalRemoto.class,
            profesionalCodigo,
            "Profesional no encontrado"
        );

        Map<String, Integer> duraciones = new HashMap<>();
        duraciones.put(servicioCodigo, servicio.duracionMinutos());

        validarHorario(
            profesional,
            profesionalCodigo,
            fecha,
            hora,
            servicio.duracionMinutos(),
            excluirId,
            duraciones
        );

        if ("Horario propuesto".equals(cita.getEstado())) {
            if (cita.getFechaPropuesta() == null || cita.getFechaPropuesta().isBlank()
                || cita.getHoraPropuesta() == null || cita.getHoraPropuesta().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La propuesta necesita fecha y hora");
            }

            LocalDate fechaPropuesta = convertirFecha(cita.getFechaPropuesta());
            LocalTime horaPropuesta = convertirHora(cita.getHoraPropuesta());

            validarFechaFutura(fechaPropuesta, horaPropuesta);

            if (horaPropuesta.getMinute() % 30 != 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Las horas deben comenzar en intervalos de 30 minutos");
            }

            if (fecha.equals(fechaPropuesta) && hora.equals(horaPropuesta)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El horario propuesto debe ser diferente del original");
            }

            validarHorario(
                profesional,
                profesionalCodigo,
                fechaPropuesta,
                horaPropuesta,
                servicio.duracionMinutos(),
                excluirId,
                duraciones
            );
        }
    }

    private void validarHorario(
        ProfesionalRemoto profesional,
        String profesionalCodigo,
        LocalDate fecha,
        LocalTime hora,
        int duracion,
        Long excluirId,
        Map<String, Integer> duraciones
    ) {
        int dia = fecha.getDayOfWeek().getValue() % 7;
        boolean finDeSemana = dia == 0 || dia == 6;

        LocalTime apertura = finDeSemana ? LocalTime.of(10, 0) : LocalTime.of(8, 30);
        LocalTime cierre = finDeSemana ? LocalTime.of(20, 0) : LocalTime.of(22, 0);

        if (profesional.turnos() == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Los turnos del profesional no estan disponibles");
        }

        TurnoRemoto turno = profesional.turnos().get(String.valueOf(dia));

        if (turno == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El profesional no trabaja ese dia");
        }

        LocalTime inicioTurno;
        LocalTime finTurno;

        try {
            inicioTurno = LocalTime.parse(turno.inicio());
            finTurno = LocalTime.parse(turno.fin());
        } catch (DateTimeException | NullPointerException error) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Turno del profesional invalido");
        }

        LocalTime inicioPermitido = inicioTurno.isAfter(apertura) ? inicioTurno : apertura;
        LocalTime finPermitido = finTurno.isBefore(cierre) ? finTurno : cierre;

        LocalDateTime inicioAtencion = LocalDateTime.of(fecha, hora);
        LocalDateTime finAtencion = inicioAtencion.plusMinutes(duracion);

        if (hora.isBefore(inicioPermitido)
            || finAtencion.toLocalDate().isAfter(fecha)
            || finAtencion.toLocalTime().isAfter(finPermitido)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El horario esta fuera del turno disponible");
        }

        List<Cita> ocupadas = repository.buscarPosiblesConflictos(profesionalCodigo, fecha.toString());

        for (Cita ocupada : ocupadas) {
            if (excluirId != null && excluirId.equals(ocupada.getId())) {
                continue;
            }

            if ("Cancelada".equalsIgnoreCase(ocupada.getEstado())
                || "Rechazada".equalsIgnoreCase(ocupada.getEstado())) {
                continue;
            }

            String codigoOcupado = ocupada.getServicio().trim().toUpperCase(Locale.ROOT);

            int duracionOcupada = duraciones.computeIfAbsent(
                codigoOcupado,
                this::consultarDuracion
            );

            if (fecha.toString().equals(ocupada.getFecha())
                && hayCruce(hora, duracion, ocupada.getHora(), duracionOcupada)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "El profesional ya tiene una cita en ese horario");
            }

            if (fecha.toString().equals(ocupada.getFechaPropuesta())
                && ocupada.getHoraPropuesta() != null
                && !ocupada.getHoraPropuesta().isBlank()
                && hayCruce(hora, duracion, ocupada.getHoraPropuesta(), duracionOcupada)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Existe una cita con horario propuesto en ese intervalo");
            }
        }
    }

    private boolean hayCruce(LocalTime horaNueva, int duracionNueva, String horaExistente, int duracionExistente) {
        LocalTime inicioExistente;

        try {
            inicioExistente = convertirHora(horaExistente);
        } catch (ResponseStatusException error) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Existe una cita con horario invalido");
        }

        LocalTime finNueva = horaNueva.plusMinutes(duracionNueva);
        LocalTime finExistente = inicioExistente.plusMinutes(duracionExistente);

        return horaNueva.isBefore(finExistente) && finNueva.isAfter(inicioExistente);
    }

    private int consultarDuracion(String codigo) {
        ServicioRemoto servicio = consultar(
            urlServicios + "/api/servicios/codigo/{codigo}",
            ServicioRemoto.class,
            codigo,
            "Servicio no encontrado"
        );

        if (servicio.duracionMinutos() == null || servicio.duracionMinutos() <= 0) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Duracion de una cita existente no disponible");
        }

        return servicio.duracionMinutos();
    }

    private LocalDate convertirFecha(String valor) {
        try {
            if (valor == null) {
                throw new IllegalArgumentException();
            }

            return LocalDate.parse(valor);
        } catch (DateTimeException | IllegalArgumentException error) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fecha debe tener el formato AAAA-MM-DD y ser valida");
        }
    }

    private LocalTime convertirHora(String valor) {
        if (valor == null || !valor.matches("^([01][0-9]|2[0-3]):[0-5][0-9]$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La hora debe tener el formato HH:mm");
        }

        return LocalTime.parse(valor);
    }

    private void validarFechaFutura(LocalDate fecha, LocalTime hora) {
        if (!LocalDateTime.of(fecha, hora).isAfter(LocalDateTime.now(ZONA))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se permiten citas en fechas u horas pasadas");
        }
    }

    private <T> T consultar(String url, Class<T> tipo, String codigo, String mensajeNoEncontrado) {
        try {
            T respuesta = cliente.getForObject(url, tipo, codigo);

            if (respuesta == null) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Respuesta vacia del microservicio");
            }

            return respuesta;
        } catch (HttpClientErrorException.NotFound error) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, mensajeNoEncontrado);
        } catch (RestClientException error) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo consultar el microservicio requerido");
        }
    }

    public record ServicioRemoto(
        Long id,
        String codigo,
        String categoria,
        String nombre,
        String especie,
        String duracion,
        Integer duracionMinutos,
        Integer precio,
        String obs,
        String imagen
    ) {
    }

    public record ProfesionalRemoto(
        Long id,
        String codigo,
        String nombre,
        String tipo,
        String especialidad,
        Map<String, TurnoRemoto> turnos
    ) {
    }

    public record TurnoRemoto(
        String inicio,
        String fin
    ) {
    }
}