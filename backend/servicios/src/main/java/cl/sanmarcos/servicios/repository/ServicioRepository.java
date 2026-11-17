package cl.sanmarcos.servicios.repository;

import cl.sanmarcos.servicios.model.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ServicioRepository extends JpaRepository<Servicio, Long> {
    Optional<Servicio> findByCodigoIgnoreCase(String codigo);
    List<Servicio> findAllByOrderByIdAsc();
    List<Servicio> findByCategoriaIgnoreCaseOrderByIdAsc(String categoria);
}