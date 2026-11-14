package cl.sanmarcos.contacto.service;

import cl.sanmarcos.contacto.model.Contacto;
import cl.sanmarcos.contacto.repository.ContactoRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.List;

@Service
public class ContactoService {
    private final ContactoRepository repository;

    public ContactoService(ContactoRepository repository) {
        this.repository = repository;
    }

    public Contacto guardar(Contacto contacto) {
        contacto.setId(null);
        contacto.setEstado("PENDIENTE");
        return repository.save(contacto);
    }

    public List<Contacto> listar() {
        return repository.findAll();
    }

    public Contacto atender(Long id) {
        Contacto contacto = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contacto no encontrado"));

        contacto.setEstado("ATENDIDO");
        return repository.save(contacto);
    }

    public void eliminar(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Contacto no encontrado");
        }

        repository.deleteById(id);
    }
}