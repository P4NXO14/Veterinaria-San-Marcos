package cl.sanmarcos.farmacia.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Locale;
import java.util.Map;

@Service
public class AutorizacionFarmacia {
    private final RestTemplate cliente;
    private final String usuariosUrl;

    public AutorizacionFarmacia(RestTemplate cliente,@Value("${usuarios.url}") String usuariosUrl) {
        this.cliente = cliente;
        this.usuariosUrl = usuariosUrl;
    }

    public void exigirPersonal(String autorizacion) {
        Credenciales credenciales = obtenerCredenciales(autorizacion);
        UsuarioRemoto usuario = consultarUsuario(credenciales);

        validarCuentaActiva(usuario);

        String rol = normalizarRol(usuario.rol());

        if (!rol.equals("admin") && !rol.equals("recepcionista")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"No tienes permisos para administrar productos");
        }
    }

    public String exigirCliente(String autorizacion) {
        Credenciales credenciales = obtenerCredenciales(autorizacion);
        UsuarioRemoto usuario = consultarUsuario(credenciales);

        validarCuentaActiva(usuario);

        if (!normalizarRol(usuario.rol()).equals("cliente")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Solo los clientes pueden realizar pedidos");
        }

        return credenciales.correo();
    }

    private Credenciales obtenerCredenciales(String autorizacion) {
        if (autorizacion == null || !autorizacion.startsWith("Basic ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Debes autenticarte para realizar esta operacion");
        }

        String datos;

        try {
            byte[] contenido = Base64.getDecoder().decode(autorizacion.substring(6).trim());
            datos = new String(contenido,StandardCharsets.UTF_8);
        } catch (IllegalArgumentException error) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Credenciales invalidas");
        }

        int separador = datos.indexOf(":");

        if (separador <= 0 || separador == datos.length() - 1) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Credenciales invalidas");
        }

        String correo = datos.substring(0,separador).trim().toLowerCase(Locale.ROOT);
        String password = datos.substring(separador + 1);

        if (correo.isBlank() || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Credenciales invalidas");
        }

        return new Credenciales(correo,password);
    }

    private UsuarioRemoto consultarUsuario(Credenciales credenciales) {
        try {
            ResponseEntity<UsuarioRemoto> respuesta = cliente.postForEntity(
                usuariosUrl + "/api/usuarios/login",
                Map.of("correo",credenciales.correo(),"password",credenciales.password()),
                UsuarioRemoto.class
            );

            UsuarioRemoto usuario = respuesta.getBody();

            if (usuario == null) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Usuarios no devolvio una respuesta valida");
            }

            return usuario;
        } catch (HttpClientErrorException error) {
            if (error.getStatusCode().value() == 401) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Correo o contraseña incorrectos");
            }

            if (error.getStatusCode().value() == 403) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Cuenta sin acceso");
            }

            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"No se pudo verificar la cuenta");
        } catch (RestClientException error) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"El microservicio Usuarios no esta disponible");
        }
    }

    private void validarCuentaActiva(UsuarioRemoto usuario) {
        if (!Boolean.TRUE.equals(usuario.activo())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Cuenta inactiva");
        }
    }

    private String normalizarRol(String rol) {
        return rol == null ? "" : rol.trim().toLowerCase(Locale.ROOT);
    }

    private record Credenciales(String correo,String password) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record UsuarioRemoto(String rol,Boolean activo) {
    }
}