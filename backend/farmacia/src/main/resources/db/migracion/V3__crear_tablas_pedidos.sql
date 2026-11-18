CREATE TABLE pedido (
    id BIGINT NOT NULL AUTO_INCREMENT,
    cliente_correo VARCHAR(150) NOT NULL,
    fecha DATETIME(6) NOT NULL,
    estado VARCHAR(30) NOT NULL,
    total BIGINT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE detalle_pedido (
    id BIGINT NOT NULL AUTO_INCREMENT,
    pedido_id BIGINT NOT NULL,
    producto_id VARCHAR(20) NOT NULL,
    producto_nombre VARCHAR(120) NOT NULL,
    precio_unitario INT NOT NULL,
    cantidad INT NOT NULL,
    subtotal BIGINT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_detalle_pedido
        FOREIGN KEY (pedido_id)
        REFERENCES pedido(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_pedido_cliente
ON pedido(cliente_correo);

CREATE INDEX idx_detalle_pedido
ON detalle_pedido(pedido_id);