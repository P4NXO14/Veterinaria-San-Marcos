package cl.sanmarcos.usuarios.controller;

import cl.sanmarcos.usuarios.dto.LoginRequest;
import cl.sanmarcos.usuarios.dto.RegistroRequest;
import cl.sanmarcos.usuarios.model.Usuario;
import cl.sanmarcos.usuarios.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {
    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping("/registro")
    public ResponseEntity<Usuario> registrar(@RequestBody RegistroRequest datos) {
        Usuario usuario = service.registrar(datos);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    @PostMapping("/login")
    public ResponseEntity<Usuario> iniciarSesion(@RequestBody LoginRequest datos) {
        Usuario usuario = service.iniciarSesion(datos);
        return ResponseEntity.ok(usuario);
    }
}