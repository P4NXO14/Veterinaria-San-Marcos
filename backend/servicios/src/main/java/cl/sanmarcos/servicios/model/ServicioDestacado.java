package cl.sanmarcos.servicios.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "servicio_destacado")
public class ServicioDestacado {
    @Id
    @Column(length = 20)
    private String codigo;

    public ServicioDestacado() {
    }

    public ServicioDestacado(String codigo) {
        this.codigo = codigo;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }
}