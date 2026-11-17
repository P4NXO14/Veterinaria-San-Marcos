package cl.sanmarcos.profesionales.repository;

import cl.sanmarcos.profesionales.model.Profesional;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProfesionalRepository extends JpaRepository<Profesional, Long> {
    Optional<Profesional> findByCodigo(String codigo);
}