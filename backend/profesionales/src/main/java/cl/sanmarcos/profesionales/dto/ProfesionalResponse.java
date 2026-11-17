package cl.sanmarcos.profesionales.dto;

import java.util.Map;

public record ProfesionalResponse(
    Long id,
    String codigo,
    String nombre,
    String tipo,
    String especialidad,
    Map<Integer, TurnoResponse> turnos
) {
    public record TurnoResponse(
        String inicio,
        String fin
    ) {
    }
}