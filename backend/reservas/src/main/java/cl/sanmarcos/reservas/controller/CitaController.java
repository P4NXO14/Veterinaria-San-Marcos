package cl.sanmarcos.reservas.controller;

import cl.sanmarcos.reservas.model.Cita;
import cl.sanmarcos.reservas.service.CitaService;
import jakarta.persistence.PersistenceException;
import jakarta.validation.Valid;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.TransactionException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "http://localhost:5173")
public class CitaController {
    private final CitaService service;

    public CitaController(CitaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Cita> listar(@RequestParam(required = false) String propietario) {
        if (propietario != null && !propietario.isBlank()) {
            return service.listarPorPropietario(propietario);
        }

        return service.listar();
    }

    @GetMapping("/{id}")
    public Cita buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PostMapping
    public ResponseEntity<Cita> guardar(@Valid @RequestBody Cita cita) {
        Cita guardada = service.guardar(cita);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
    }

    @PutMapping("/{id}")
    public Cita actualizar(@PathVariable Long id, @Valid @RequestBody Cita cita) {
        return service.actualizar(id, cita);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(PessimisticLockingFailureException.class)
    public ResponseEntity<Map<String, String>> manejarConflictoDeBloqueo(PessimisticLockingFailureException error) {
        return respuestaConflicto();
    }

    @ExceptionHandler({
        DataAccessException.class,
        TransactionException.class,
        PersistenceException.class
    })
    public ResponseEntity<Map<String, String>> manejarErrorPersistencia(RuntimeException error) {
        if (esConflictoDeConcurrencia(error)) {
            return respuestaConflicto();
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
            Map.of(
                "error", "Error interno",
                "mensaje", "No se pudo completar la operacion"
            )
        );
    }

    private ResponseEntity<Map<String, String>> respuestaConflicto() {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
            Map.of(
                "error", "Conflicto de concurrencia",
                "mensaje", "No se pudo completar la operacion debido a otra solicitud simultanea"
            )
        );
    }

    private boolean esConflictoDeConcurrencia(Throwable error) {
        Throwable causa = error;

        while (causa != null) {
            if (causa instanceof PessimisticLockingFailureException) {
                return true;
            }

            if (causa instanceof SQLException sql) {
                SQLException actual = sql;

                while (actual != null) {
                    if (actual.getErrorCode() == 1213
                        || actual.getErrorCode() == 1205
                        || "40001".equals(actual.getSQLState())) {
                        return true;
                    }

                    actual = actual.getNextException();
                }
            }

            causa = causa.getCause();
        }

        return false;
    }
}