CREATE TABLE servicio (
    id BIGINT NOT NULL AUTO_INCREMENT,
    codigo VARCHAR(20) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    especie VARCHAR(80) NOT NULL,
    duracion VARCHAR(20) NOT NULL,
    precio INT NOT NULL,
    obs VARCHAR(255) NOT NULL,
    imagen VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_servicio_codigo UNIQUE (codigo),
    CONSTRAINT chk_servicio_precio CHECK (precio >= 0)
);

CREATE TABLE compatibilidad (
    id BIGINT NOT NULL AUTO_INCREMENT,
    servicio_codigo VARCHAR(20) NOT NULL,
    profesional_codigo VARCHAR(20) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_compatibilidad UNIQUE (servicio_codigo, profesional_codigo),
    CONSTRAINT fk_compatibilidad_servicio FOREIGN KEY (servicio_codigo) REFERENCES servicio(codigo)
);