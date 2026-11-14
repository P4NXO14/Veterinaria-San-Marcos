package cl.sanmarcos.usuarios.dto;

public record LoginRequest(
    String correo,
    String password
) {
}