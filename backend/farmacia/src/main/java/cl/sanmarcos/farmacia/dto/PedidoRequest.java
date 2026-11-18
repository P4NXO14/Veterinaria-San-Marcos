package cl.sanmarcos.farmacia.dto;

import java.util.List;

public record PedidoRequest(List<ProductoSolicitado> productos) {
    public record ProductoSolicitado(String id,Integer cantidad) {
    }
}