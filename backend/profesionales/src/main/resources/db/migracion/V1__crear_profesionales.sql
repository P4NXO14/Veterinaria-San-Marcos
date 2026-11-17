CREATE TABLE profesional (
    id BIGINT NOT NULL AUTO_INCREMENT,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    especialidad VARCHAR(150) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_profesional_codigo UNIQUE (codigo),
    CONSTRAINT chk_profesional_tipo CHECK (tipo IN ('veterinario', 'tecnico'))
);

CREATE TABLE turno (
    id BIGINT NOT NULL AUTO_INCREMENT,
    profesional_id BIGINT NOT NULL,
    dia_semana INT NOT NULL,
    inicio TIME NOT NULL,
    fin TIME NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_turno_profesional_dia UNIQUE (profesional_id, dia_semana),
    CONSTRAINT fk_turno_profesional FOREIGN KEY (profesional_id) REFERENCES profesional(id),
    CONSTRAINT chk_turno_dia CHECK (dia_semana BETWEEN 0 AND 6),
    CONSTRAINT chk_turno_hora CHECK (inicio < fin)
);