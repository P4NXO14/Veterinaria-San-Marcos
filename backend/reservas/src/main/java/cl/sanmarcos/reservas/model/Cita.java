package cl.sanmarcos.reservas.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "cita")
public class Cita {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El correo del propietario es obligatorio")
    @Email(message = "El correo del propietario no es valido")
    @Size(max = 150, message = "El correo admite hasta 150 caracteres")
    @Column(nullable = false, length = 150)
    private String propietario;

    @NotBlank(message = "El nombre del propietario es obligatorio")
    @Size(max = 150, message = "El nombre admite hasta 150 caracteres")
    @Column(name = "propietario_nombre", nullable = false, length = 150)
    private String propietarioNombre;

    @NotBlank(message = "El servicio es obligatorio")
    @Size(max = 20, message = "El servicio admite hasta 20 caracteres")
    @Column(nullable = false, length = 20)
    private String servicio;

    @Size(max = 20, message = "El profesional admite hasta 20 caracteres")
    @Column(length = 20)
    private String profesional;

    @NotBlank(message = "El nombre de la mascota es obligatorio")
    @Size(max = 50, message = "El nombre de la mascota admite hasta 50 caracteres")
    @Column(nullable = false, length = 100)
    private String mascota;

    @NotBlank(message = "La especie es obligatoria")
    @Size(max = 50, message = "La especie admite hasta 50 caracteres")
    @Column(nullable = false, length = 50)
    private String especie;

    @NotBlank(message = "El motivo de la consulta es obligatorio")
    @Size(max = 300, message = "El motivo admite hasta 300 caracteres")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String motivo;

    @NotBlank(message = "La fecha es obligatoria")
    @Pattern(regexp = "^[0-9]{4}-[0-9]{2}-[0-9]{2}$", message = "La fecha debe tener el formato AAAA-MM-DD")
    @Column(nullable = false, length = 10)
    private String fecha;

    @NotBlank(message = "La hora es obligatoria")
    @Pattern(regexp = "^([01][0-9]|2[0-3]):[0-5][0-9]$", message = "La hora debe tener el formato HH:mm")
    @Column(nullable = false, length = 5)
    private String hora;

    @Size(max = 30, message = "El estado admite hasta 30 caracteres")
    @Column(nullable = false, length = 30)
    private String estado;

    @Size(max = 10, message = "La fecha propuesta admite hasta 10 caracteres")
    @Column(name = "fecha_propuesta", nullable = false, length = 10)
    private String fechaPropuesta = "";

    @Size(max = 5, message = "La hora propuesta admite hasta 5 caracteres")
    @Column(name = "hora_propuesta", nullable = false, length = 5)
    private String horaPropuesta = "";

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPropietario() {
        return propietario;
    }

    public void setPropietario(String propietario) {
        this.propietario = propietario;
    }

    public String getPropietarioNombre() {
        return propietarioNombre;
    }

    public void setPropietarioNombre(String propietarioNombre) {
        this.propietarioNombre = propietarioNombre;
    }

    public String getServicio() {
        return servicio;
    }

    public void setServicio(String servicio) {
        this.servicio = servicio;
    }

    public String getProfesional() {
        return profesional;
    }

    public void setProfesional(String profesional) {
        this.profesional = profesional;
    }

    public String getMascota() {
        return mascota;
    }

    public void setMascota(String mascota) {
        this.mascota = mascota;
    }

    public String getEspecie() {
        return especie;
    }

    public void setEspecie(String especie) {
        this.especie = especie;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public String getHora() {
        return hora;
    }

    public void setHora(String hora) {
        this.hora = hora;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getFechaPropuesta() {
        return fechaPropuesta;
    }

    public void setFechaPropuesta(String fechaPropuesta) {
        this.fechaPropuesta = fechaPropuesta;
    }

    public String getHoraPropuesta() {
        return horaPropuesta;
    }

    public void setHoraPropuesta(String horaPropuesta) {
        this.horaPropuesta = horaPropuesta;
    }
}