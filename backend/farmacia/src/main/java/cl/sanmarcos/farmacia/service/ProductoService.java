package cl.sanmarcos.farmacia.service;

import cl.sanmarcos.farmacia.model.Producto;
import cl.sanmarcos.farmacia.repository.ProductoRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Locale;

@Service
public class ProductoService {
    private final ProductoRepository repository;

    public ProductoService(ProductoRepository repository) {
        this.repository = repository;
    }

    public List<Producto> listar() {
        return repository.findAll(Sort.by(Sort.Direction.ASC,"id"));
    }

    public Producto buscar(String id) {
        String codigo = normalizarCodigo(id);

        return repository.findById(codigo)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Producto no encontrado"));
    }

    @Transactional
    public Producto crear(Producto datos) {
        if (datos == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Los datos del producto son obligatorios");
        }

        String codigo = normalizarCodigo(datos.getId());

        if (repository.existsById(codigo)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Ya existe un producto con ese codigo");
        }

        Producto producto = new Producto();
        producto.setId(codigo);
        asignarDatos(producto,datos);

        try {
            return repository.saveAndFlush(producto);
        } catch (DataIntegrityViolationException error) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,"No se pudo registrar el producto porque su codigo ya existe");
        }
    }

    @Transactional
    public Producto actualizar(String id,Producto datos) {
        if (datos == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Los datos del producto son obligatorios");
        }

        String codigo = normalizarCodigo(id);

        if (datos.getId() != null && !normalizarCodigo(datos.getId()).equals(codigo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"No puedes modificar el codigo del producto");
        }

        Producto producto = buscar(codigo);
        asignarDatos(producto,datos);

        return repository.save(producto);
    }

    @Transactional
    public void eliminar(String id) {
        Producto producto = buscar(id);
        repository.delete(producto);
    }

    private void asignarDatos(Producto producto,Producto datos) {
        String nombre = validarTexto(datos.getNombre(),"El nombre es obligatorio",120);
        String categoria = validarTexto(datos.getCategoria(),"La categoria es obligatoria",50);
        String imagen = validarTexto(datos.getImagen(),"La imagen es obligatoria",500);

        if (datos.getPrecio() == null || datos.getPrecio() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El precio no puede ser negativo ni estar vacio");
        }

        if (datos.getPrecioAnterior() != null && datos.getPrecioAnterior() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El precio anterior no puede ser negativo");
        }

        if (datos.getStock() == null || datos.getStock() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El stock no puede ser negativo ni estar vacio");
        }

        if (datos.getRequiereReceta() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Debes indicar si el producto requiere receta");
        }

        producto.setNombre(nombre);
        producto.setCategoria(categoria);
        producto.setPrecio(datos.getPrecio());
        producto.setPrecioAnterior(datos.getPrecioAnterior());
        producto.setStock(datos.getStock());
        producto.setImagen(imagen);
        producto.setRequiereReceta(datos.getRequiereReceta());
    }

    private String normalizarCodigo(String id) {
        if (id == null || id.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El codigo del producto es obligatorio");
        }

        String codigo = id.trim().toUpperCase(Locale.ROOT);

        if (codigo.length() > 20 || !codigo.matches("[A-Z0-9-]+")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El codigo del producto no es valido");
        }

        return codigo;
    }

    private String validarTexto(String texto,String mensaje,int maximo) {
        if (texto == null || texto.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,mensaje);
        }

        String valor = texto.trim();

        if (valor.length() > maximo) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El texto supera la longitud permitida");
        }

        return valor;
    }
}