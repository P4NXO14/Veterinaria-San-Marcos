package cl.sanmarcos.contacto.controller;

import cl.sanmarcos.contacto.model.Contacto;
import cl.sanmarcos.contacto.service.ContactoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/contactos")
@CrossOrigin(origins = "http://localhost:5173")
public class ContactoController {
    private final ContactoService service;

    public ContactoController(ContactoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Contacto> guardar(@RequestBody Contacto contacto) {
        Contacto guardado = service.guardar(contacto);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    @GetMapping
    public List<Contacto> listar() {
        return service.listar();
    }

    @PutMapping("/{id}")
    public Contacto atender(@PathVariable Long id) {
        return service.atender(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}