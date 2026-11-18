CREATE TABLE producto (
    id VARCHAR(20) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    precio INT NOT NULL,
    precio_anterior INT,
    stock INT NOT NULL,
    imagen VARCHAR(500) NOT NULL,
    requiere_receta BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id)
);