package cl.sanmarcos.farmacia.controller;

import cl.sanmarcos.farmacia.dto.PedidoRequest;
import cl.sanmarcos.farmacia.model.Pedido;
import cl.sanmarcos.farmacia.service.AutorizacionFarmacia;
import cl.sanmarcos.farmacia.service.PedidoService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "http://localhost:5173")
public class PedidoController {
    private final PedidoService service;
    private final AutorizacionFarmacia autorizacion;

    public PedidoController(PedidoService service,AutorizacionFarmacia autorizacion) {
        this.service = service;
        this.autorizacion = autorizacion;
    }

    @PostMapping
    public ResponseEntity<Pedido> registrar(
        @RequestHeader(value = HttpHeaders.AUTHORIZATION,required = false) String credenciales,
        @RequestBody PedidoRequest solicitud
    ) {
        String correo = autorizacion.exigirCliente(credenciales);
        Pedido pedido = service.registrar(correo,solicitud);
        return ResponseEntity.status(HttpStatus.CREATED).body(pedido);
    }

    @GetMapping("/mis-pedidos")
    public List<Pedido> listarPorCliente(
        @RequestHeader(value = HttpHeaders.AUTHORIZATION,required = false) String credenciales
    ) {
        String correo = autorizacion.exigirCliente(credenciales);
        return service.listarPorCliente(correo);
    }

    @GetMapping
    public List<Pedido> listarTodos(
        @RequestHeader(value = HttpHeaders.AUTHORIZATION,required = false) String credenciales
    ) {
        autorizacion.exigirPersonal(credenciales);
        return service.listarTodos();
    }
}