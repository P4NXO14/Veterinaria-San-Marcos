package cl.sanmarcos.usuarios.dto;

public record RegistroRequest(
    String rut,
    String nombre,
    String apellidos,
    String correo,
    String direccion,
    String password
) {
}