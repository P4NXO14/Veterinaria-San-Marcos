package cl.sanmarcos.reservas.service;

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
public class AutorizacionReservas {
    private final RestTemplate cliente;
    private final String usuariosUrl;

    public AutorizacionReservas(@Value("${usuarios.url:http://localhost:8081}") String usuariosUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2000);
        factory.setReadTimeout(2000);
        this.cliente = new RestTemplate(factory);
        this.usuariosUrl = usuariosUrl;
    }

    public Identidad exigirUsuario(String autorizacion) {
        Credenciales credenciales = obtenerCredenciales(autorizacion);
        UsuarioRemoto usuario = consultarUsuario(credenciales);

        if (!Boolean.TRUE.equals(usuario.activo())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Cuenta desactivada");
        }

        if (!credenciales.correo().equals(normalizar(usuario.correo()))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Credenciales invalidas");
        }

        return new Identidad(
            normalizar(usuario.correo()),
            normalizar(usuario.rol()),
            (texto(usuario.nombre()) + " " + texto(usuario.apellidos())).trim()
        );
    }

    public Identidad exigirCliente(String autorizacion) {
        Identidad identidad = exigirUsuario(autorizacion);

        if (!identidad.rol().equals("cliente")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Solo los clientes pueden realizar esta operacion");
        }

        return identidad;
    }

    public Identidad exigirPersonal(String autorizacion) {
        Identidad identidad = exigirUsuario(autorizacion);

        if (!identidad.rol().equals("admin") && !identidad.rol().equals("recepcionista")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Solo el personal puede administrar citas");
        }

        return identidad;
    }

    private Credenciales obtenerCredenciales(String autorizacion) {
        if (autorizacion == null || !autorizacion.startsWith("Basic ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Debes autenticarte para realizar esta operacion");
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

        String correo = normalizar(datos.substring(0,separador));
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

            if (respuesta.getBody() == null) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Usuarios no devolvio una respuesta valida");
            }

            return respuesta.getBody();
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
    }

    private String normalizar(String valor) {
        return valor == null ? "" : valor.trim().toLowerCase(Locale.ROOT);
    }

    private String texto(String valor) {
        return valor == null ? "" : valor.trim();
    }

    public record Identidad(String correo,String rol,String nombreCompleto) {
    }

    private record Credenciales(String correo,String password) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record UsuarioRemoto(String correo,String nombre,String apellidos,String rol,Boolean activo) {
    }
}