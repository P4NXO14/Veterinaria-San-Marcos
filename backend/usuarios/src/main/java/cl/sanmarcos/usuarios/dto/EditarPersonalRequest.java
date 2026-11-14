package cl.sanmarcos.usuarios.dto;

public record EditarPersonalRequest(
    String nombre,
    String apellidos,
    String direccion
) {
}