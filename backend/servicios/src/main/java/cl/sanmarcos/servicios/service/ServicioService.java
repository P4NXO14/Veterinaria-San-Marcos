package cl.sanmarcos.servicios.service;

import cl.sanmarcos.servicios.dto.ServicioResponse;
import cl.sanmarcos.servicios.model.Compatibilidad;
import cl.sanmarcos.servicios.model.Servicio;
import cl.sanmarcos.servicios.model.ServicioDestacado;
import cl.sanmarcos.servicios.repository.CompatibilidadRepository;
import cl.sanmarcos.servicios.repository.ServicioRepository;
import cl.sanmarcos.servicios.repository.ServicioDestacadoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ServicioService {
    private final ServicioRepository servicioRepository;
    private final CompatibilidadRepository compatibilidadRepository;
    private final ServicioDestacadoRepository destacadoRepository;
    private final AutorizacionServicios autorizacion;

    public ServicioService(ServicioRepository servicioRepository, CompatibilidadRepository compatibilidadRepository, ServicioDestacadoRepository destacadoRepository, AutorizacionServicios autorizacion) {
        this.servicioRepository = servicioRepository;
        this.compatibilidadRepository = compatibilidadRepository;
        this.destacadoRepository = destacadoRepository;
        this.autorizacion = autorizacion;
    }

    @Transactional(readOnly = true)
    public List<ServicioResponse> listar() {
        return servicioRepository.findAllByOrderByIdAsc().stream()
            .map(this::convertir)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ServicioResponse> listarDestacados() {
        Set<String> codigos = destacadoRepository.findAll().stream()
            .map(ServicioDestacado::getCodigo)
            .collect(Collectors.toSet());

        return servicioRepository.findAllByOrderByIdAsc().stream()
            .filter(servicio -> codigos.contains(servicio.getCodigo()))
            .map(this::convertir)
            .toList();
    }

    @Transactional
    public void cambiarDestacado(String codigo,boolean destacar,String credenciales) {
        autorizacion.exigirAdministrador(credenciales);

        Servicio servicio = obtenerPorCodigo(codigo);
        String codigoReal = servicio.getCodigo();

        if (destacar && !destacadoRepository.existsById(codigoReal)) {
            if (destacadoRepository.count() >= 6) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,"Solo puedes destacar hasta 6 servicios");
            }

            destacadoRepository.save(new ServicioDestacado(codigoReal));
        } else if (!destacar && destacadoRepository.existsById(codigoReal)) {
            destacadoRepository.deleteById(codigoReal);
        }
    }

    @Transactional(readOnly = true)
    public ServicioResponse buscarPorId(Long id) {
        Servicio servicio = servicioRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Servicio no encontrado"));

        return convertir(servicio);
    }

    @Transactional(readOnly = true)
    public ServicioResponse buscarPorCodigo(String codigo) {
        return convertir(obtenerPorCodigo(codigo));
    }

    @Transactional(readOnly = true)
    public List<ServicioResponse> listarPorCategoria(String categoria) {
        if (categoria == null || categoria.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La categoria es obligatoria");
        }

        return servicioRepository.findByCategoriaIgnoreCaseOrderByIdAsc(categoria.trim()).stream()
            .map(this::convertir)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<String> profesionalesCompatibles(String codigo) {
        Servicio servicio = obtenerPorCodigo(codigo);

        return compatibilidadRepository.findByServicioCodigoOrderByIdAsc(servicio.getCodigo()).stream()
            .map(Compatibilidad::getProfesionalCodigo)
            .toList();
    }

    private Servicio obtenerPorCodigo(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El codigo es obligatorio");
        }

        String normalizado = codigo.trim().toUpperCase(Locale.ROOT);

        return servicioRepository.findByCodigoIgnoreCase(normalizado)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Servicio no encontrado"));
    }

    private ServicioResponse convertir(Servicio servicio) {
        return new ServicioResponse(
            servicio.getId(),
            servicio.getCodigo(),
            servicio.getCategoria(),
            servicio.getNombre(),
            servicio.getEspecie(),
            servicio.getDuracion(),
            calcularDuracionMinutos(servicio.getDuracion()),
            servicio.getPrecio(),
            servicio.getObs(),
            servicio.getImagen()
        );
    }

    private int calcularDuracionMinutos(String duracion) {
        if (duracion == null || duracion.isBlank()) {
            throw new IllegalStateException("Duracion del servicio no configurada");
        }

        String[] partes = duracion.trim().split("\\s+");

        if (partes.length != 2) {
            throw new IllegalStateException("Formato de duracion no reconocido");
        }

        int cantidad;

        try {
            cantidad = Integer.parseInt(partes[0]);
        } catch (NumberFormatException error) {
            throw new IllegalStateException("Duracion del servicio invalida", error);
        }

        if (cantidad <= 0) {
            throw new IllegalStateException("La duracion debe ser positiva");
        }

        return switch (partes[1]) {
            case "min" -> cantidad;
            case "h" -> Math.multiplyExact(cantidad, 60);
            default -> throw new IllegalStateException("Unidad de duracion no reconocida");
        };
    }
}