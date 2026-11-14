package cl.sanmarcos.usuarios.dto;

public record PersonalRequest(
    String rut,
    String nombre,
    String apellidos,
    String correo,
    String direccion,
    String password
) {
}