CREATE TABLE servicio_destacado (
    codigo VARCHAR(20) NOT NULL,
    PRIMARY KEY (codigo),
    CONSTRAINT fk_destacado_servicio FOREIGN KEY (codigo) REFERENCES servicio(codigo)
);

INSERT INTO servicio_destacado (codigo)
SELECT codigo FROM servicio ORDER BY id ASC LIMIT 6;