package cl.sanmarcos.contacto.service;

import cl.sanmarcos.contacto.model.Contacto;
import cl.sanmarcos.contacto.repository.ContactoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContactoService {
    private final ContactoRepository repository;

    public ContactoService(ContactoRepository repository) {
        this.repository = repository;
    }

    public Contacto guardar(Contacto contacto) {
        if (contacto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Debes ingresar los datos del mensaje");
        }

        String nombre = validarTexto(contacto.getNombreCompleto(),"nombre",100);
        String correo = validarTexto(contacto.getCorreo(),"correo",100);
        String mensaje = validarTexto(contacto.getMensaje(),"mensaje",500);

        if (!correo.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Debes ingresar un correo valido");
        }

        if (contacto.getCorreoCuenta() == null || contacto.getCorreoCuenta().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"La cuenta de origen es obligatoria");
        }

        contacto.setId(null);
        contacto.setNombreCompleto(nombre);
        contacto.setCorreo(correo);
        contacto.setMensaje(mensaje);
        contacto.setCorreoCuenta(contacto.getCorreoCuenta().trim().toLowerCase());
        contacto.setEstado("PENDIENTE");
        contacto.setRespuesta(null);
        contacto.setRespondidoPor(null);
        contacto.setFechaRespuesta(null);
        contacto.setFechaCreacion(null);

        return repository.save(contacto);
    }

    public List<Contacto> listar() {
        return repository.findAll();
    }

    public List<Contacto> listarPorCuenta(String correo) {
        return repository.findByCorreoCuentaIgnoreCaseOrderByFechaCreacionDesc(correo);
    }

    public Contacto atender(Long id) {
        Contacto contacto = buscar(id);
        contacto.setEstado("ATENDIDO");
        return repository.save(contacto);
    }

    @Transactional
    public Contacto responder(Long id,String respuesta,String correoPersonal) {
        if (respuesta == null || respuesta.isBlank() || respuesta.trim().length() > 2000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"La respuesta debe contener entre 1 y 2000 caracteres");
        }

        Contacto contacto = buscar(id);
        contacto.setRespuesta(respuesta.trim());
        contacto.setRespondidoPor(correoPersonal);
        contacto.setFechaRespuesta(LocalDateTime.now());
        contacto.setEstado("ATENDIDO");

        return repository.save(contacto);
    }

    public void eliminar(Long id) {
        Contacto contacto = buscar(id);
        repository.delete(contacto);
    }

    private Contacto buscar(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Contacto no encontrado"));
    }

    private String validarTexto(String valor,String campo,int maximo) {
        if (valor == null || valor.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El campo " + campo + " es obligatorio");
        }

        String texto = valor.trim();

        if (texto.length() > maximo) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El campo " + campo + " admite hasta " + maximo + " caracteres");
        }

        return texto;
    }
}