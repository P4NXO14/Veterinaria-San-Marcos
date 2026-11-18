package cl.sanmarcos.farmacia.service;

import cl.sanmarcos.farmacia.dto.PedidoRequest;
import cl.sanmarcos.farmacia.model.Pedido;
import cl.sanmarcos.farmacia.model.Producto;
import cl.sanmarcos.farmacia.repository.PedidoRepository;
import cl.sanmarcos.farmacia.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {
    @Mock
    private PedidoRepository pedidos;

    @Mock
    private ProductoRepository productos;

    private PedidoService service;

    @BeforeEach
    void configurar() {
        service = new PedidoService(pedidos,productos);
    }

    @Test
    void registrarPedidoYDescontarStock() {
        Producto producto = crearProducto("FM001",10000,10,false);

        when(productos.bloquearPorId("FM001")).thenReturn(Optional.of(producto));
        when(pedidos.saveAndFlush(any(Pedido.class)))
            .thenAnswer(invocacion -> invocacion.getArgument(0));

        Pedido resultado = service.registrar("CLIENTE@GMAIL.COM",solicitud("FM001",3));

        assertEquals("cliente@gmail.com",resultado.getClienteCorreo());
        assertEquals("registrado",resultado.getEstado());
        assertNotNull(resultado.getFecha());
        assertEquals(30000L,resultado.getTotal());
        assertEquals(7,producto.getStock());
        assertEquals(1,resultado.getDetalles().size());
        assertEquals("FM001",resultado.getDetalles().get(0).getProductoId());
        assertEquals(3,resultado.getDetalles().get(0).getCantidad());
        assertEquals(10000,resultado.getDetalles().get(0).getPrecioUnitario());
        assertEquals(30000L,resultado.getDetalles().get(0).getSubtotal());

        verify(pedidos).saveAndFlush(any(Pedido.class));
    }

    @Test
    void registrarPedidoConVariosProductos() {
        Producto primero = crearProducto("FM001",10000,10,false);
        Producto segundo = crearProducto("FM002",5000,8,false);

        when(productos.bloquearPorId("FM001")).thenReturn(Optional.of(primero));
        when(productos.bloquearPorId("FM002")).thenReturn(Optional.of(segundo));
        when(pedidos.saveAndFlush(any(Pedido.class)))
            .thenAnswer(invocacion -> invocacion.getArgument(0));

        PedidoRequest solicitud = new PedidoRequest(List.of(
            new PedidoRequest.ProductoSolicitado("FM002",2),
            new PedidoRequest.ProductoSolicitado("FM001",1)
        ));

        Pedido resultado = service.registrar("cliente@gmail.com",solicitud);

        assertEquals(20000L,resultado.getTotal());
        assertEquals(2,resultado.getDetalles().size());
        assertEquals(9,primero.getStock());
        assertEquals(6,segundo.getStock());

        verify(productos).bloquearPorId("FM001");
        verify(productos).bloquearPorId("FM002");
    }

    @Test
    void rechazarPedidoSinProductos() {
        PedidoRequest solicitud = new PedidoRequest(List.of());

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.registrar("cliente@gmail.com",solicitud)
        );

        assertEquals(HttpStatus.BAD_REQUEST,error.getStatusCode());
        verifyNoInteractions(productos);
        verifyNoInteractions(pedidos);
    }

    @Test
    void rechazarCantidadCero() {
        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.registrar("cliente@gmail.com",solicitud("FM001",0))
        );

        assertEquals(HttpStatus.BAD_REQUEST,error.getStatusCode());
        verifyNoInteractions(productos);
    }

    @Test
    void rechazarCantidadNegativa() {
        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.registrar("cliente@gmail.com",solicitud("FM001",-2))
        );

        assertEquals(HttpStatus.BAD_REQUEST,error.getStatusCode());
        verifyNoInteractions(productos);
    }

    @Test
    void rechazarProductoRepetido() {
        PedidoRequest solicitud = new PedidoRequest(List.of(
            new PedidoRequest.ProductoSolicitado("FM001",1),
            new PedidoRequest.ProductoSolicitado("fm001",2)
        ));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.registrar("cliente@gmail.com",solicitud)
        );

        assertEquals(HttpStatus.BAD_REQUEST,error.getStatusCode());
        verifyNoInteractions(productos);
    }

    @Test
    void rechazarCodigoInvalido() {
        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.registrar("cliente@gmail.com",solicitud("FM 001",1))
        );

        assertEquals(HttpStatus.BAD_REQUEST,error.getStatusCode());
    }

    @Test
    void rechazarProductoInexistente() {
        when(productos.bloquearPorId("FM999")).thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.registrar("cliente@gmail.com",solicitud("FM999",1))
        );

        assertEquals(HttpStatus.NOT_FOUND,error.getStatusCode());
        verify(pedidos,never()).saveAndFlush(any(Pedido.class));
    }

    @Test
    void rechazarStockInsuficiente() {
        Producto producto = crearProducto("FM001",10000,2,false);

        when(productos.bloquearPorId("FM001")).thenReturn(Optional.of(producto));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.registrar("cliente@gmail.com",solicitud("FM001",3))
        );

        assertEquals(HttpStatus.CONFLICT,error.getStatusCode());
        assertEquals(2,producto.getStock());
        verify(pedidos,never()).saveAndFlush(any(Pedido.class));
    }

    @Test
    void rechazarProductoQueRequiereReceta() {
        Producto producto = crearProducto("FM004",28990,4,true);

        when(productos.bloquearPorId("FM004")).thenReturn(Optional.of(producto));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.registrar("cliente@gmail.com",solicitud("FM004",1))
        );

        assertEquals(HttpStatus.CONFLICT,error.getStatusCode());
        assertEquals(4,producto.getStock());
        verify(pedidos,never()).saveAndFlush(any(Pedido.class));
    }

    @Test
    void rechazarCorreoVacio() {
        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.registrar("",solicitud("FM001",1))
        );

        assertEquals(HttpStatus.BAD_REQUEST,error.getStatusCode());
        verifyNoInteractions(productos);
    }

    @Test
    void listarPedidosDelCliente() {
        Pedido pedido = new Pedido();
        pedido.setClienteCorreo("cliente@gmail.com");

        when(pedidos.findByClienteCorreoOrderByIdDesc("cliente@gmail.com"))
            .thenReturn(List.of(pedido));

        List<Pedido> resultado = service.listarPorCliente("CLIENTE@GMAIL.COM");

        assertEquals(1,resultado.size());
        assertEquals("cliente@gmail.com",resultado.get(0).getClienteCorreo());
    }

    @Test
    void listarTodosLosPedidos() {
        Pedido pedido = new Pedido();

        when(pedidos.findAll(Sort.by(Sort.Direction.DESC,"id")))
            .thenReturn(List.of(pedido));

        List<Pedido> resultado = service.listarTodos();

        assertEquals(1,resultado.size());
        verify(pedidos).findAll(Sort.by(Sort.Direction.DESC,"id"));
    }

    private PedidoRequest solicitud(String id,int cantidad) {
        return new PedidoRequest(List.of(
            new PedidoRequest.ProductoSolicitado(id,cantidad)
        ));
    }

    private Producto crearProducto(String id,int precio,int stock,boolean requiereReceta) {
        Producto producto = new Producto();
        producto.setId(id);
        producto.setNombre("Producto " + id);
        producto.setCategoria("Suplementos");
        producto.setPrecio(precio);
        producto.setStock(stock);
        producto.setImagen("/img/farmacia/producto.png");
        producto.setRequiereReceta(requiereReceta);
        return producto;
    }
}