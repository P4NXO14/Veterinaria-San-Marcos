package cl.sanmarcos.farmacia.controller;

import cl.sanmarcos.farmacia.model.Producto;
import cl.sanmarcos.farmacia.service.AutorizacionFarmacia;
import cl.sanmarcos.farmacia.service.ProductoService;
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
@RequestMapping("/api/productos")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductoController {
    private final ProductoService service;
    private final AutorizacionFarmacia autorizacion;

    public ProductoController(ProductoService service,AutorizacionFarmacia autorizacion) {
        this.service = service;
        this.autorizacion = autorizacion;
    }

    @GetMapping
    public List<Producto> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Producto buscar(@PathVariable String id) {
        return service.buscar(id);
    }

    @PostMapping
    public ResponseEntity<Producto> crear(
        @RequestHeader(value = HttpHeaders.AUTHORIZATION,required = false) String credenciales,
        @RequestBody Producto datos
    ) {
        autorizacion.exigirPersonal(credenciales);
        Producto producto = service.crear(datos);
        return ResponseEntity.status(HttpStatus.CREATED).body(producto);
    }

    @PutMapping("/{id}")
    public Producto actualizar(
        @PathVariable String id,
        @RequestHeader(value = HttpHeaders.AUTHORIZATION,required = false) String credenciales,
        @RequestBody Producto datos
    ) {
        autorizacion.exigirPersonal(credenciales);
        return service.actualizar(id,datos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
        @PathVariable String id,
        @RequestHeader(value = HttpHeaders.AUTHORIZATION,required = false) String credenciales
    ) {
        autorizacion.exigirPersonal(credenciales);
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}