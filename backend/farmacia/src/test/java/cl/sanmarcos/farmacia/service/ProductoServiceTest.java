package cl.sanmarcos.farmacia.service;

import cl.sanmarcos.farmacia.model.Producto;
import cl.sanmarcos.farmacia.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {
    @Mock
    private ProductoRepository repository;

    private ProductoService service;

    @BeforeEach
    void configurar() {
        service = new ProductoService(repository);
    }

    @Test
    void listarProductosOrdenados() {
        Producto primero = crearProducto("FM001","Cognidine",30000);
        Producto segundo = crearProducto("FM002","Inveade",6200);

        when(repository.findAll(Sort.by(Sort.Direction.ASC,"id")))
            .thenReturn(List.of(primero,segundo));

        List<Producto> resultado = service.listar();

        assertEquals(2,resultado.size());
        assertEquals("FM001",resultado.get(0).getId());
        assertEquals("FM002",resultado.get(1).getId());
    }

    @Test
    void listarSinProductos() {
        when(repository.findAll(Sort.by(Sort.Direction.ASC,"id")))
            .thenReturn(List.of());

        assertTrue(service.listar().isEmpty());
    }

    @Test
    void buscarProductoExistente() {
        Producto producto = crearProducto("FM001","Cognidine",30000);

        when(repository.findById("FM001"))
            .thenReturn(Optional.of(producto));

        Producto resultado = service.buscar("FM001");

        assertEquals("FM001",resultado.getId());
        assertEquals("Cognidine",resultado.getNombre());
        assertEquals(30000,resultado.getPrecio());
        assertEquals(12,resultado.getStock());
    }

    @Test
    void rechazarProductoInexistente() {
        when(repository.findById("FM999"))
            .thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.buscar("FM999")
        );

        assertEquals(HttpStatus.NOT_FOUND,error.getStatusCode());
    }

    @Test
    void crearProductoNuevo() {
        Producto producto = crearProducto("FM009","Producto de prueba",5000);

        when(repository.existsById("FM009")).thenReturn(false);
        when(repository.saveAndFlush(any(Producto.class)))
            .thenAnswer(invocacion -> invocacion.getArgument(0));

        Producto resultado = service.crear(producto);

        assertEquals("FM009",resultado.getId());
        assertEquals("Producto de prueba",resultado.getNombre());
        assertEquals(5000,resultado.getPrecio());
        assertEquals(12,resultado.getStock());

        verify(repository).saveAndFlush(any(Producto.class));
    }

    @Test
    void normalizarCodigoAlCrear() {
        Producto producto = crearProducto(" fm009 ","Producto de prueba",5000);

        when(repository.existsById("FM009")).thenReturn(false);
        when(repository.saveAndFlush(any(Producto.class)))
            .thenAnswer(invocacion -> invocacion.getArgument(0));

        Producto resultado = service.crear(producto);

        assertEquals("FM009",resultado.getId());
    }

    @Test
    void rechazarCodigoDuplicado() {
        Producto producto = crearProducto("FM001","Producto repetido",5000);

        when(repository.existsById("FM001")).thenReturn(true);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crear(producto)
        );

        assertEquals(HttpStatus.CONFLICT,error.getStatusCode());
        verify(repository,never()).saveAndFlush(any(Producto.class));
    }

    @Test
    void rechazarDuplicadoDetectadoPorMySQL() {
        Producto producto = crearProducto("FM009","Producto de prueba",5000);

        when(repository.saveAndFlush(any(Producto.class)))
            .thenThrow(new DataIntegrityViolationException("Codigo duplicado"));

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crear(producto)
        );

        assertEquals(HttpStatus.CONFLICT,error.getStatusCode());
    }

    @Test
    void rechazarPrecioNegativo() {
        Producto producto = crearProducto("FM009","Producto de prueba",-100);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crear(producto)
        );

        assertEquals(HttpStatus.BAD_REQUEST,error.getStatusCode());
        verify(repository,never()).saveAndFlush(any(Producto.class));
    }

    @Test
    void rechazarPrecioAnteriorNegativo() {
        Producto producto = crearProducto("FM009","Producto de prueba",5000);
        producto.setPrecioAnterior(-200);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crear(producto)
        );

        assertEquals(HttpStatus.BAD_REQUEST,error.getStatusCode());
    }

    @Test
    void rechazarStockNegativo() {
        Producto producto = crearProducto("FM009","Producto de prueba",5000);
        producto.setStock(-1);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crear(producto)
        );

        assertEquals(HttpStatus.BAD_REQUEST,error.getStatusCode());
    }

    @Test
    void rechazarStockVacio() {
        Producto producto = crearProducto("FM009","Producto de prueba",5000);
        producto.setStock(null);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crear(producto)
        );

        assertEquals(HttpStatus.BAD_REQUEST,error.getStatusCode());
    }

    @Test
    void rechazarNombreVacio() {
        Producto producto = crearProducto("FM009","   ",5000);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crear(producto)
        );

        assertEquals(HttpStatus.BAD_REQUEST,error.getStatusCode());
    }

    @Test
    void rechazarIndicadorRecetaVacio() {
        Producto producto = crearProducto("FM009","Producto de prueba",5000);
        producto.setRequiereReceta(null);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crear(producto)
        );

        assertEquals(HttpStatus.BAD_REQUEST,error.getStatusCode());
    }

    @Test
    void rechazarCodigoInvalido() {
        Producto producto = crearProducto("FM 009","Producto de prueba",5000);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.crear(producto)
        );

        assertEquals(HttpStatus.BAD_REQUEST,error.getStatusCode());
    }

    @Test
    void actualizarPrecioYStock() {
        Producto actual = crearProducto("FM001","Cognidine",30000);
        Producto cambios = crearProducto("FM001","Cognidine actualizado",25000);
        cambios.setStock(20);

        when(repository.findById("FM001")).thenReturn(Optional.of(actual));
        when(repository.save(actual)).thenReturn(actual);

        Producto resultado = service.actualizar("FM001",cambios);

        assertEquals("FM001",resultado.getId());
        assertEquals("Cognidine actualizado",resultado.getNombre());
        assertEquals(25000,resultado.getPrecio());
        assertEquals(20,resultado.getStock());

        verify(repository).save(actual);
    }

    @Test
    void impedirModificarCodigo() {
        Producto cambios = crearProducto("FM002","Producto de prueba",5000);

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.actualizar("FM001",cambios)
        );

        assertEquals(HttpStatus.BAD_REQUEST,error.getStatusCode());
        verify(repository,never()).save(any(Producto.class));
    }

    @Test
    void rechazarActualizacionInexistente() {
        Producto cambios = crearProducto("FM999","Producto de prueba",5000);

        when(repository.findById("FM999")).thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.actualizar("FM999",cambios)
        );

        assertEquals(HttpStatus.NOT_FOUND,error.getStatusCode());
        verify(repository,never()).save(any(Producto.class));
    }

    @Test
    void eliminarProductoExistente() {
        Producto producto = crearProducto("FM009","Producto de prueba",5000);

        when(repository.findById("FM009")).thenReturn(Optional.of(producto));

        service.eliminar("FM009");

        verify(repository).delete(producto);
    }

    @Test
    void rechazarEliminacionInexistente() {
        when(repository.findById("FM999")).thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
            ResponseStatusException.class,
            () -> service.eliminar("FM999")
        );

        assertEquals(HttpStatus.NOT_FOUND,error.getStatusCode());
        verify(repository,never()).delete(any(Producto.class));
    }

    private Producto crearProducto(String id,String nombre,Integer precio) {
        Producto producto = new Producto();
        producto.setId(id);
        producto.setNombre(nombre);
        producto.setCategoria("Suplementos");
        producto.setPrecio(precio);
        producto.setPrecioAnterior(null);
        producto.setStock(12);
        producto.setImagen("/img/farmacia/producto.png");
        producto.setRequiereReceta(false);
        return producto;
    }
}