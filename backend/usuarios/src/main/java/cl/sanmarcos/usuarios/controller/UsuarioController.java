package cl.sanmarcos.usuarios.controller;

import cl.sanmarcos.usuarios.dto.EditarPersonalRequest;
import cl.sanmarcos.usuarios.dto.EstadoPersonalRequest;
import cl.sanmarcos.usuarios.dto.LoginRequest;
import cl.sanmarcos.usuarios.dto.PersonalRequest;
import cl.sanmarcos.usuarios.dto.RegistroRequest;
import cl.sanmarcos.usuarios.model.Usuario;
import cl.sanmarcos.usuarios.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {
    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping("/registro")
    public ResponseEntity<Usuario> registrar(@Valid @RequestBody RegistroRequest datos) {
        Usuario usuario = service.registrar(datos);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    @PostMapping("/login")
    public ResponseEntity<Usuario> iniciarSesion(@Valid @RequestBody LoginRequest datos) {
        Usuario usuario = service.iniciarSesion(datos);
        return ResponseEntity.ok(usuario);
    }

    @GetMapping("/admin/usuarios")
    public ResponseEntity<List<Usuario>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @PostMapping("/admin/personal")
    public ResponseEntity<Usuario> crearPersonal(@Valid @RequestBody PersonalRequest datos) {
        Usuario usuario = service.crearPersonal(datos);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    @PutMapping("/admin/personal/{id}")
    public ResponseEntity<Usuario> editarPersonal(
        @PathVariable Long id,
        @Valid @RequestBody EditarPersonalRequest datos
    ) {
        return ResponseEntity.ok(service.editarPersonal(id, datos));
    }

    @PatchMapping("/admin/personal/{id}/estado")
    public ResponseEntity<Usuario> cambiarEstado(
        @PathVariable Long id,
        @RequestBody EstadoPersonalRequest datos
    ) {
        if (datos.activo() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El estado activo es obligatorio");
        }

        return ResponseEntity.ok(service.cambiarEstado(id, datos.activo()));
    }

    @DeleteMapping("/admin/personal/{id}")
    public ResponseEntity<Void> eliminarPersonal(@PathVariable Long id) {
        service.eliminarPersonal(id);
        return ResponseEntity.noContent().build();
    }
}