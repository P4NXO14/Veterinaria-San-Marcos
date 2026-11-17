package cl.sanmarcos.reservas.repository;

import cl.sanmarcos.reservas.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByPropietario(String propietario);

    @Query("SELECT c FROM Cita c WHERE c.profesional = :profesional AND (c.fecha = :fecha OR c.fechaPropuesta = :fecha)")
    List<Cita> buscarPosiblesConflictos(@Param("profesional") String profesional, @Param("fecha") String fecha);
}