package cl.sanmarcos.contacto.controller;

import cl.sanmarcos.contacto.model.Contacto;
import cl.sanmarcos.contacto.service.AutorizacionContacto;
import cl.sanmarcos.contacto.service.ContactoService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/contactos")
@CrossOrigin(origins = "http://localhost:5173")
public class ContactoController {
    private final ContactoService service;
    private final AutorizacionContacto autorizacion;

    public ContactoController(ContactoService service,AutorizacionContacto autorizacion) {
        this.service = service;
        this.autorizacion = autorizacion;
    }

    @PostMapping
    public ResponseEntity<Contacto> guardar(
        @RequestBody Contacto contacto,
        @RequestHeader(value = HttpHeaders.AUTHORIZATION,required = false) String credenciales
    ) {
        String correoCliente = autorizacion.exigirCliente(credenciales);
        contacto.setCorreoCuenta(correoCliente);

        Contacto guardado = service.guardar(contacto);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    @GetMapping
    public List<Contacto> listar(
        @RequestHeader(value = HttpHeaders.AUTHORIZATION,required = false) String credenciales
    ) {
        autorizacion.exigirPersonal(credenciales);
        return service.listar();
    }

    @GetMapping("/mis-mensajes")
    public List<Contacto> listarMisMensajes(
        @RequestHeader(value = HttpHeaders.AUTHORIZATION,required = false) String credenciales
    ) {
        String correoCliente = autorizacion.exigirCliente(credenciales);
        return service.listarPorCuenta(correoCliente);
    }

    @PutMapping("/{id}")
    public Contacto atender(
        @PathVariable Long id,
        @RequestHeader(value = HttpHeaders.AUTHORIZATION,required = false) String credenciales
    ) {
        autorizacion.exigirPersonal(credenciales);
        return service.atender(id);
    }

    @PutMapping("/{id}/respuesta")
    public Contacto responder(
        @PathVariable Long id,
        @RequestHeader(value = HttpHeaders.AUTHORIZATION,required = false) String credenciales,
        @RequestBody RespuestaContactoRequest datos
    ) {
        String correoPersonal = autorizacion.exigirPersonal(credenciales);
        return service.responder(id,datos.respuesta(),correoPersonal);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
        @PathVariable Long id,
        @RequestHeader(value = HttpHeaders.AUTHORIZATION,required = false) String credenciales
    ) {
        autorizacion.exigirPersonal(credenciales);
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    public record RespuestaContactoRequest(String respuesta) {
    }
}