package cl.sanmarcos.contacto.repository;

import cl.sanmarcos.contacto.model.Contacto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactoRepository extends JpaRepository<Contacto, Long> {

}