package cl.sanmarcos.servicios.repository;

import cl.sanmarcos.servicios.model.Compatibilidad;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CompatibilidadRepository extends JpaRepository<Compatibilidad, Long> {
    List<Compatibilidad> findByServicioCodigoOrderByIdAsc(String servicioCodigo);
}