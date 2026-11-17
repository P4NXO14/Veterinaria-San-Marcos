package cl.sanmarcos.profesionales.service;

import cl.sanmarcos.profesionales.dto.ProfesionalResponse;
import cl.sanmarcos.profesionales.model.Profesional;
import cl.sanmarcos.profesionales.model.Turno;
import cl.sanmarcos.profesionales.repository.ProfesionalRepository;
import cl.sanmarcos.profesionales.repository.TurnoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ProfesionalService {
    private final ProfesionalRepository profesionalRepository;
    private final TurnoRepository turnoRepository;
    private static final DateTimeFormatter FORMATO_HORA = DateTimeFormatter.ofPattern("HH:mm");

    public ProfesionalService(ProfesionalRepository profesionalRepository, TurnoRepository turnoRepository) {
        this.profesionalRepository = profesionalRepository;
        this.turnoRepository = turnoRepository;
    }

    @Transactional(readOnly = true)
    public List<ProfesionalResponse> listar() {
        return profesionalRepository.findAll().stream()
            .sorted(Comparator.comparing(Profesional::getId))
            .map(this::convertir)
            .toList();
    }

    @Transactional(readOnly = true)
    public ProfesionalResponse buscarPorId(Long id) {
        Profesional profesional = profesionalRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profesional no encontrado"));

        return convertir(profesional);
    }

    @Transactional(readOnly = true)
    public ProfesionalResponse buscarPorCodigo(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El codigo es obligatorio");
        }

        String codigoNormalizado = codigo.trim().toUpperCase(Locale.ROOT);

        Profesional profesional = profesionalRepository.findByCodigo(codigoNormalizado)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profesional no encontrado"));

        return convertir(profesional);
    }

    private ProfesionalResponse convertir(Profesional profesional) {
        List<Turno> turnos = turnoRepository.findByProfesionalId(profesional.getId());
        Map<Integer, ProfesionalResponse.TurnoResponse> turnosPorDia = new LinkedHashMap<>();

        for (int dia = 0; dia <= 6; dia++) {
            turnosPorDia.put(dia, null);
        }

        for (Turno turno : turnos) {
            turnosPorDia.put(
                turno.getDiaSemana(),
                new ProfesionalResponse.TurnoResponse(
                    turno.getInicio().format(FORMATO_HORA),
                    turno.getFin().format(FORMATO_HORA)
                )
            );
        }

        return new ProfesionalResponse(
            profesional.getId(),
            profesional.getCodigo(),
            profesional.getNombre(),
            profesional.getTipo(),
            profesional.getEspecialidad(),
            turnosPorDia
        );
    }
}