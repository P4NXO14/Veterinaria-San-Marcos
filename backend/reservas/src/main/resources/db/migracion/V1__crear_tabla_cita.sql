CREATE TABLE cita (
    id BIGINT NOT NULL AUTO_INCREMENT,
    propietario VARCHAR(150) NOT NULL,
    propietario_nombre VARCHAR(150) NOT NULL,
    servicio VARCHAR(20) NOT NULL,
    profesional VARCHAR(20),
    mascota VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    motivo TEXT NOT NULL,
    fecha VARCHAR(10) NOT NULL,
    hora VARCHAR(5) NOT NULL,
    estado VARCHAR(30) NOT NULL,
    fecha_propuesta VARCHAR(10) NOT NULL DEFAULT '',
    hora_propuesta VARCHAR(5) NOT NULL DEFAULT '',
    PRIMARY KEY (id)
);