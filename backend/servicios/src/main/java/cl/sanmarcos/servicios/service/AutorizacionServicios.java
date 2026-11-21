package cl.sanmarcos.servicios.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
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
public class AutorizacionServicios {
    private final RestTemplate cliente;
    private final String usuariosUrl;

    public AutorizacionServicios(@Value("${usuarios.url:http://localhost:8081}") String usuariosUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2000);
        factory.setReadTimeout(2000);
        this.cliente = new RestTemplate(factory);
        this.usuariosUrl = usuariosUrl;
    }

    public void exigirAdministrador(String autorizacion) {
        if (autorizacion == null || !autorizacion.startsWith("Basic ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Debes autenticarte como administrador");
        }

        String datos;

        try {
            datos = new String(Base64.getDecoder().decode(autorizacion.substring(6).trim()),StandardCharsets.UTF_8);
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

        UsuarioRemoto usuario;

        try {
            ResponseEntity<UsuarioRemoto> respuesta = cliente.postForEntity(
                usuariosUrl + "/api/usuarios/login",
                Map.of("correo",correo,"password",password),
                UsuarioRemoto.class
            );

            usuario = respuesta.getBody();
        } catch (HttpClientErrorException error) {
            if (error.getStatusCode().value() == 401) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Correo o contraseña incorrectos");
            }

            if (error.getStatusCode().value() == 403) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Cuenta desactivada");
            }

            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"No se pudo verificar la cuenta");
        } catch (RestClientException error) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"El microservicio Usuarios no esta disponible");
        }

        if (usuario == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Usuarios no devolvio una respuesta valida");
        }

        if (!Boolean.TRUE.equals(usuario.activo())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Cuenta desactivada");
        }

        if (!"admin".equals(usuario.rol())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Solo el administrador puede modificar servicios destacados");
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record UsuarioRemoto(String rol,Boolean activo) {
    }
}