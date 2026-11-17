package cl.sanmarcos.servicios.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "compatibilidad")
public class Compatibilidad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "servicio_codigo", nullable = false, length = 20)
    private String servicioCodigo;

    @Column(name = "profesional_codigo", nullable = false, length = 20)
    private String profesionalCodigo;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getServicioCodigo() {
        return servicioCodigo;
    }

    public void setServicioCodigo(String servicioCodigo) {
        this.servicioCodigo = servicioCodigo;
    }

    public String getProfesionalCodigo() {
        return profesionalCodigo;
    }

    public void setProfesionalCodigo(String profesionalCodigo) {
        this.profesionalCodigo = profesionalCodigo;
    }
}