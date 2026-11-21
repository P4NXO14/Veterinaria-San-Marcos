package cl.sanmarcos.reservas.service;

import cl.sanmarcos.reservas.model.Cita;
import cl.sanmarcos.reservas.repository.CitaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;

@Service
public class CitaService {
    private final CitaRepository repository;
    private final DisponibilidadService disponibilidad;
    private final DataSource dataSource;
    private final TransactionTemplate transaccionGuardado;

    public CitaService(
        CitaRepository repository,
        DisponibilidadService disponibilidad,
        DataSource dataSource,
        PlatformTransactionManager transactionManager
    ) {
        this.repository = repository;
        this.disponibilidad = disponibilidad;
        this.dataSource = dataSource;
        this.transaccionGuardado = new TransactionTemplate(transactionManager);
        this.transaccionGuardado.setIsolationLevel(TransactionDefinition.ISOLATION_SERIALIZABLE);
    }

    public List<Cita> listar() {
        return repository.findAll();
    }

    public List<Cita> listarPorPropietario(String propietario) {
        return repository.findByPropietario(propietario);
    }

    public Cita buscar(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cita no encontrada"));
    }

    public Cita guardar(Cita cita) {
        String nombreBloqueo = obtenerNombreBloqueo(cita);

        try (Connection conexion = dataSource.getConnection()) {
            if (!adquirirBloqueo(conexion, nombreBloqueo)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "El horario esta siendo reservado por otra solicitud");
            }

            try {
                return transaccionGuardado.execute(estado -> {
                    cita.setId(null);
                    cita.setEstado("pendiente");
                    cita.setFechaPropuesta("");
                    cita.setHoraPropuesta("");

                    normalizarCodigos(cita);
                    disponibilidad.validar(cita, null);

                    return repository.save(cita);
                });
            } finally {
                liberarBloqueo(conexion, nombreBloqueo);
            }
        } catch (SQLException error) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No se pudo comprobar el bloqueo del horario", error);
        }
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Cita actualizar(Long id, Cita datos) {
        Cita actual = buscar(id);

        String estadoAnterior = normalizarEstado(actual.getEstado());
        String estadoNuevo = datos.getEstado() == null
            ? estadoAnterior
            : normalizarEstado(datos.getEstado());

        validarTransicion(estadoAnterior, estadoNuevo);

        if ("Atendida".equals(estadoNuevo)) {
            try {
                LocalDateTime fechaCita = LocalDateTime.parse(actual.getFecha() + "T" + actual.getHora());

                if (fechaCita.isAfter(LocalDateTime.now(ZoneId.of("America/Santiago")))) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes registrar asistencia antes de la fecha y hora de la cita");
                }
            } catch (DateTimeParseException error) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fecha u hora de la cita no es valida");
            }

            actual.setEstado("Atendida");
            actual.setFechaPropuesta("");
            actual.setHoraPropuesta("");
            return repository.save(actual);
        }

        if ("Cancelada".equals(estadoNuevo)) {
            actual.setEstado(estadoNuevo);
            actual.setFechaPropuesta("");
            actual.setHoraPropuesta("");
            return repository.save(actual);
        }

        Cita cambios = new Cita();
        cambios.setId(actual.getId());
        cambios.setPropietario(actual.getPropietario());
        cambios.setPropietarioNombre(actual.getPropietarioNombre());
        cambios.setServicio(datos.getServicio());
        cambios.setProfesional(datos.getProfesional());
        cambios.setMascota(datos.getMascota());
        cambios.setEspecie(datos.getEspecie());
        cambios.setMotivo(datos.getMotivo());
        cambios.setFecha(datos.getFecha());
        cambios.setHora(datos.getHora());
        cambios.setEstado(estadoNuevo);
        cambios.setFechaPropuesta("");
        cambios.setHoraPropuesta("");

        if ("Horario propuesto".equals(estadoNuevo)) {
            cambios.setFecha(actual.getFecha());
            cambios.setHora(actual.getHora());
            cambios.setFechaPropuesta(datos.getFechaPropuesta());
            cambios.setHoraPropuesta(datos.getHoraPropuesta());
        }

        if ("Horario propuesto".equals(estadoAnterior) && "Confirmada".equals(estadoNuevo)) {
            if (actual.getFechaPropuesta() == null || actual.getFechaPropuesta().isBlank()
                || actual.getHoraPropuesta() == null || actual.getHoraPropuesta().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La cita no tiene un horario propuesto");
            }

            cambios.setFecha(actual.getFechaPropuesta());
            cambios.setHora(actual.getHoraPropuesta());
        }

        normalizarCodigos(cambios);
        disponibilidad.validar(cambios, id);

        actual.setServicio(cambios.getServicio());
        actual.setProfesional(cambios.getProfesional());
        actual.setMascota(cambios.getMascota());
        actual.setEspecie(cambios.getEspecie());
        actual.setMotivo(cambios.getMotivo());
        actual.setFecha(cambios.getFecha());
        actual.setHora(cambios.getHora());
        actual.setEstado(cambios.getEstado());
        actual.setFechaPropuesta(cambios.getFechaPropuesta());
        actual.setHoraPropuesta(cambios.getHoraPropuesta());

        return repository.save(actual);
    }

    public void eliminar(Long id) {
        Cita cita = buscar(id);

        if ("Atendida".equals(cita.getEstado())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No puedes eliminar una cita con asistencia registrada");
        }

        repository.delete(cita);
    }

    private String obtenerNombreBloqueo(Cita cita) {
        if (cita == null
            || cita.getProfesional() == null
            || cita.getProfesional().isBlank()
            || cita.getFecha() == null
            || cita.getFecha().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El profesional y la fecha son obligatorios");
        }

        String profesional = cita.getProfesional().trim().toUpperCase(Locale.ROOT);
        String fecha = cita.getFecha().trim();
        String nombre = "sanmarcos:reservas:" + profesional + ":" + fecha;

        if (nombre.length() > 64) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Los datos del horario son demasiado extensos");
        }

        return nombre;
    }

    private boolean adquirirBloqueo(Connection conexion, String nombre) throws SQLException {
        try (PreparedStatement sentencia = conexion.prepareStatement("SELECT GET_LOCK(?, 5)")) {
            sentencia.setString(1, nombre);

            try (ResultSet resultado = sentencia.executeQuery()) {
                if (!resultado.next()) {
                    throw new SQLException("MySQL no devolvio el resultado del bloqueo");
                }

                int obtenido = resultado.getInt(1);

                if (resultado.wasNull()) {
                    throw new SQLException("MySQL no pudo obtener el bloqueo");
                }

                return obtenido == 1;
            }
        }
    }

    private void liberarBloqueo(Connection conexion, String nombre) throws SQLException {
        try (PreparedStatement sentencia = conexion.prepareStatement("SELECT RELEASE_LOCK(?)")) {
            sentencia.setString(1, nombre);

            try (ResultSet resultado = sentencia.executeQuery()) {
                if (!resultado.next() || resultado.getInt(1) != 1 || resultado.wasNull()) {
                    throw new SQLException("No se pudo liberar el bloqueo del horario");
                }
            }
        }
    }

    private void normalizarCodigos(Cita cita) {
        if (cita.getServicio() != null) {
            cita.setServicio(cita.getServicio().trim().toUpperCase(Locale.ROOT));
        }

        if (cita.getProfesional() != null) {
            cita.setProfesional(cita.getProfesional().trim().toUpperCase(Locale.ROOT));
        }
    }

    private String normalizarEstado(String estado) {
        if (estado == null || estado.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El estado de la cita es obligatorio");
        }

        return switch (estado.trim().toLowerCase(Locale.ROOT)) {
            case "pendiente" -> "pendiente";
            case "confirmada" -> "Confirmada";
            case "horario propuesto" -> "Horario propuesto";
            case "cancelada" -> "Cancelada";
            case "atendida" -> "Atendida";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado de cita no reconocido");
        };
    }

    private void validarTransicion(String anterior, String nuevo) {
        boolean permitida = switch (anterior) {
            case "pendiente" -> List.of(
                "pendiente", "Confirmada", "Horario propuesto", "Cancelada"
            ).contains(nuevo);
            case "Confirmada" -> List.of(
                "Confirmada", "Horario propuesto", "Cancelada", "Atendida"
            ).contains(nuevo);
            case "Horario propuesto" -> List.of(
                "Horario propuesto", "Confirmada", "Cancelada"
            ).contains(nuevo);
            case "Cancelada", "Atendida" -> false;
            default -> false;
        };

        if (!permitida) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La transicion de estado no esta permitida");
        }
    }
}