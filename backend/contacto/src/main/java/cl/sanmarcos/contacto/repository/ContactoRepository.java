package cl.sanmarcos.contacto.repository;

import cl.sanmarcos.contacto.model.Contacto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContactoRepository extends JpaRepository<Contacto,Long> {
    List<Contacto> findByCorreoCuentaIgnoreCaseOrderByFechaCreacionDesc(String correoCuenta);
}