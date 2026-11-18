package cl.sanmarcos.farmacia.service;

import cl.sanmarcos.farmacia.dto.PedidoRequest;
import cl.sanmarcos.farmacia.model.DetallePedido;
import cl.sanmarcos.farmacia.model.Pedido;
import cl.sanmarcos.farmacia.model.Producto;
import cl.sanmarcos.farmacia.repository.PedidoRepository;
import cl.sanmarcos.farmacia.repository.ProductoRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;

@Service
public class PedidoService {
    private final PedidoRepository pedidos;
    private final ProductoRepository productos;

    public PedidoService(PedidoRepository pedidos,ProductoRepository productos) {
        this.pedidos = pedidos;
        this.productos = productos;
    }

    @Transactional
    public Pedido registrar(String correo,PedidoRequest solicitud) {
        if (correo == null || correo.isBlank() || correo.length() > 150) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El correo del cliente no es valido");
        }

        Map<String,Integer> cantidades = validarProductos(solicitud);

        Pedido pedido = new Pedido();
        pedido.setClienteCorreo(correo.trim().toLowerCase(Locale.ROOT));
        pedido.setFecha(LocalDateTime.now(ZoneId.of("America/Santiago")));
        pedido.setEstado("registrado");

        long total = 0;

        for (Map.Entry<String,Integer> item : cantidades.entrySet()) {
            Producto producto = productos.bloquearPorId(item.getKey())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Producto no encontrado: " + item.getKey()));

            if (Boolean.TRUE.equals(producto.getRequiereReceta())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,"El producto requiere receta: " + producto.getId());
            }

            if (producto.getStock() < item.getValue()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,"Stock insuficiente: " + producto.getId());
            }

            int cantidad = item.getValue();
            long subtotal = (long)producto.getPrecio() * cantidad;

            try {
                total = Math.addExact(total,subtotal);
            } catch (ArithmeticException error) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El total del pedido supera el limite permitido");
            }

            DetallePedido detalle = new DetallePedido();
            detalle.setProductoId(producto.getId());
            detalle.setProductoNombre(producto.getNombre());
            detalle.setPrecioUnitario(producto.getPrecio());
            detalle.setCantidad(cantidad);
            detalle.setSubtotal(subtotal);

            pedido.agregarDetalle(detalle);
            producto.setStock(producto.getStock() - cantidad);
        }

        pedido.setTotal(total);

        return pedidos.saveAndFlush(pedido);
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarPorCliente(String correo) {
        return pedidos.findByClienteCorreoOrderByIdDesc(
            correo.trim().toLowerCase(Locale.ROOT)
        );
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarTodos() {
        return pedidos.findAll(Sort.by(Sort.Direction.DESC,"id"));
    }

    private Map<String,Integer> validarProductos(PedidoRequest solicitud) {
        if (solicitud == null || solicitud.productos() == null || solicitud.productos().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El pedido debe contener productos");
        }

        Map<String,Integer> cantidades = new TreeMap<>();

        for (PedidoRequest.ProductoSolicitado item : solicitud.productos()) {
            if (item == null || item.id() == null || item.id().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El codigo del producto es obligatorio");
            }

            String codigo = item.id().trim().toUpperCase(Locale.ROOT);

            if (codigo.length() > 20 || !codigo.matches("[A-Z0-9-]+")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El codigo del producto no es valido");
            }

            if (item.cantidad() == null || item.cantidad() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"La cantidad debe ser mayor que cero");
            }

            if (cantidades.putIfAbsent(codigo,item.cantidad()) != null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"No debes repetir productos en el mismo pedido");
            }
        }

        return cantidades;
    }
}