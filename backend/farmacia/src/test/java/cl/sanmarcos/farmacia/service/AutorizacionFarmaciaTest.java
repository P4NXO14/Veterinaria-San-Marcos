package cl.sanmarcos.farmacia.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AutorizacionFarmaciaTest {
    @Mock
    private RestTemplate cliente;

    private AutorizacionFarmacia autorizacion;

    @BeforeEach
    void configurar() {
        autorizacion = new AutorizacionFarmacia(cliente,"http://localhost:8081");
    }

    @Test
    void permitirAdministradorActivo() {
        configurarUsuario("admin",true);

        assertDoesNotThrow(() -> autorizacion.exigirPersonal(credenciales()));
        verify(cliente).postForEntity(
            eq("http://localhost:8081/api/usuarios/login"),
            any(),
            eq(AutorizacionFarmacia.UsuarioRemoto.class)
        );
    }

    @Test
    void permitirRecepcionistaActiva() {
        configurarUsuario("recepcionista",true);

        assertDoesNotThrow(() -> autorizacion.exigirPersonal(credenciales()));
    }

    @Test
    void rechazarCliente() {
        configurarUsuario("cliente",true);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> autorizacion.exigirPersonal(credenciales())
        );

        assertEquals(HttpStatus.FORBIDDEN,error.getStatusCode());
    }

    @Test
    void rechazarCuentaInactiva() {
        configurarUsuario("recepcionista",false);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> autorizacion.exigirPersonal(credenciales())
        );

        assertEquals(HttpStatus.FORBIDDEN,error.getStatusCode());
    }

    @Test
    void rechazarSolicitudSinCredenciales() {
        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> autorizacion.exigirPersonal(null)
        );

        assertEquals(HttpStatus.UNAUTHORIZED,error.getStatusCode());
        verifyNoInteractions(cliente);
    }

    @Test
    void rechazarCredencialesMalFormadas() {
        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> autorizacion.exigirPersonal("Basic datos-invalidos")
        );

        assertEquals(HttpStatus.UNAUTHORIZED,error.getStatusCode());
        verifyNoInteractions(cliente);
    }

    @Test
    void rechazarPasswordIncorrecta() {
        when(cliente.postForEntity(
            anyString(),any(),eq(AutorizacionFarmacia.UsuarioRemoto.class)
        )).thenThrow(new HttpClientErrorException(HttpStatus.UNAUTHORIZED));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> autorizacion.exigirPersonal(credenciales())
        );

        assertEquals(HttpStatus.UNAUTHORIZED,error.getStatusCode());
    }

    @Test
    void rechazarCuandoUsuariosNoResponde() {
        when(cliente.postForEntity(
            anyString(),any(),eq(AutorizacionFarmacia.UsuarioRemoto.class)
        )).thenThrow(new ResourceAccessException("Conexion rechazada"));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> autorizacion.exigirPersonal(credenciales())
        );

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE,error.getStatusCode());
    }

    private void configurarUsuario(String rol,boolean activo) {
        when(cliente.postForEntity(
            anyString(),any(),eq(AutorizacionFarmacia.UsuarioRemoto.class)
        )).thenReturn(ResponseEntity.ok(
            new AutorizacionFarmacia.UsuarioRemoto(rol,activo)
        ));
    }

    private String credenciales() {
        String datos = "admin@sanmarcos.com:clave-de-prueba";
        return "Basic " + Base64.getEncoder().encodeToString(
            datos.getBytes(StandardCharsets.UTF_8)
        );
    }
}