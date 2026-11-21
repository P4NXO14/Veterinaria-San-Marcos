package cl.sanmarcos.servicios.controller;

import cl.sanmarcos.servicios.dto.ServicioResponse;
import cl.sanmarcos.servicios.service.ServicioService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/servicios")
@CrossOrigin(origins = "http://localhost:5173")
public class ServicioController {
    private final ServicioService service;

    public ServicioController(ServicioService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ServicioResponse>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/destacados")
    public ResponseEntity<List<ServicioResponse>> listarDestacados() {
        return ResponseEntity.ok(service.listarDestacados());
    }

    @PatchMapping("/codigo/{codigo}/destacado")
    public ResponseEntity<Void> cambiarDestacado(
        @PathVariable String codigo,
        @RequestBody EstadoDestacadoRequest datos,
        @RequestHeader(value = HttpHeaders.AUTHORIZATION,required = false) String autorizacion
    ) {
        if (datos == null || datos.destacado() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Debes indicar si el servicio es destacado");
        }

        service.cambiarDestacado(codigo,datos.destacado(),autorizacion);
        return ResponseEntity.noContent().build();
    }

    public record EstadoDestacadoRequest(Boolean destacado) {
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServicioResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<ServicioResponse> buscarPorCodigo(@PathVariable String codigo) {
        return ResponseEntity.ok(service.buscarPorCodigo(codigo));
    }

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<ServicioResponse>> listarPorCategoria(@PathVariable String categoria) {
        return ResponseEntity.ok(service.listarPorCategoria(categoria));
    }

    @GetMapping("/codigo/{codigo}/profesionales")
    public ResponseEntity<List<String>> profesionalesCompatibles(@PathVariable String codigo) {
        return ResponseEntity.ok(service.profesionalesCompatibles(codigo));
    }
}