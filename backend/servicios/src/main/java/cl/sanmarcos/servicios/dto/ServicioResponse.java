package cl.sanmarcos.servicios.dto;

public record ServicioResponse(
    Long id,
    String codigo,
    String categoria,
    String nombre,
    String especie,
    String duracion,
    int duracionMinutos,
    Integer precio,
    String obs,
    String imagen
) {
}