package cl.sanmarcos.farmacia.repository;

import cl.sanmarcos.farmacia.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido,Long> {
    List<Pedido> findByClienteCorreoOrderByIdDesc(String clienteCorreo);
}