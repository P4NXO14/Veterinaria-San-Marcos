package cl.sanmarcos.usuarios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegistroRequest(
    @NotBlank(message = "El RUT es obligatorio")
    String rut,

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 50, message = "El nombre admite hasta 50 caracteres")
    String nombre,

    @NotBlank(message = "Los apellidos son obligatorios")
    @Size(max = 100, message = "Los apellidos admiten hasta 100 caracteres")
    String apellidos,

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no es valido")
    @Size(max = 100, message = "El correo admite hasta 100 caracteres")
    String correo,

    @NotBlank(message = "La direccion es obligatoria")
    @Size(max = 255, message = "La direccion admite hasta 255 caracteres")
    String direccion,

    @NotBlank(message = "La contraseña es obligatoria")
    String password
) {
}