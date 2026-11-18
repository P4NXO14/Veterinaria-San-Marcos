export interface ProductoServidor {
id: string;
nombre: string;
categoria: string;
precio: number;
precioAnterior: number | null;
stock: number;
imagen: string;
requiereReceta: boolean;
}

export interface CredencialesFarmacia {
correo: string;
password: string;
}

export interface ProductoPedido {
id: string;
cantidad: number;
}

export interface DetallePedidoServidor {
id: number;
productoId: string;
productoNombre: string;
precioUnitario: number;
cantidad: number;
subtotal: number;
}

export interface PedidoServidor {
id: number;
clienteCorreo: string;
fecha: string;
estado: string;
total: number;
detalles: DetallePedidoServidor[];
}

const URL_FARMACIA = "http://localhost:8086/api";

function obtenerAutorizacion(credenciales: CredencialesFarmacia): string {
const texto = `${credenciales.correo}:${credenciales.password}`;
const bytes = new TextEncoder().encode(texto);
const base64 = btoa(Array.from(bytes,(byte) => String.fromCharCode(byte)).join(""));

return `Basic ${base64}`;
}

async function verificarRespuesta(respuesta: Response): Promise<void> {
if (respuesta.ok) {
    return;
}

const mensajes: Record<number,string> = {
    400: "Los datos enviados no son validos",
    401: "El correo o la contraseña son incorrectos",
    403: "No tienes permisos para realizar esta operacion",
    404: "El registro solicitado no existe",
    405: "La operacion solicitada no esta permitida",
    409: "La operacion genera un conflicto con los datos existentes",
    500: "Ocurrio un error interno en el servidor",
    503: "Uno de los microservicios necesarios no esta disponible"
};

throw new Error(
    mensajes[respuesta.status] || `Error HTTP ${respuesta.status}`
);
}

export async function obtenerProductosServidor(): Promise<ProductoServidor[]> {
const respuesta = await fetch(`${URL_FARMACIA}/productos`,{
    cache: "no-store"
});

await verificarRespuesta(respuesta);

return (await respuesta.json()) as ProductoServidor[];
}

export async function obtenerProductoServidor(id: string): Promise<ProductoServidor> {
const respuesta = await fetch(
    `${URL_FARMACIA}/productos/${encodeURIComponent(id)}`
);

await verificarRespuesta(respuesta);

return (await respuesta.json()) as ProductoServidor;
}

export async function crearProductoServidor(
producto: ProductoServidor,
credenciales: CredencialesFarmacia
): Promise<ProductoServidor> {
const respuesta = await fetch(`${URL_FARMACIA}/productos`,{
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    Authorization: obtenerAutorizacion(credenciales)
    },
    body: JSON.stringify(producto)
});

await verificarRespuesta(respuesta);

return (await respuesta.json()) as ProductoServidor;
}

export async function actualizarProductoServidor(
id: string,
producto: ProductoServidor,
credenciales: CredencialesFarmacia
): Promise<ProductoServidor> {
const respuesta = await fetch(
    `${URL_FARMACIA}/productos/${encodeURIComponent(id)}`,{
    method: "PUT",
    headers: {
        "Content-Type": "application/json",
        Authorization: obtenerAutorizacion(credenciales)
    },
    body: JSON.stringify(producto)
    }
);

await verificarRespuesta(respuesta);

return (await respuesta.json()) as ProductoServidor;
}

export async function eliminarProductoServidor(
id: string,
credenciales: CredencialesFarmacia
): Promise<void> {
const respuesta = await fetch(
    `${URL_FARMACIA}/productos/${encodeURIComponent(id)}`,{
    method: "DELETE",
    headers: {
        Authorization: obtenerAutorizacion(credenciales)
    }
    }
);

await verificarRespuesta(respuesta);
}

export async function crearPedidoServidor(
productos: ProductoPedido[],
credenciales: CredencialesFarmacia
): Promise<PedidoServidor> {
const respuesta = await fetch(`${URL_FARMACIA}/pedidos`,{
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    Authorization: obtenerAutorizacion(credenciales)
    },
    body: JSON.stringify({productos})
});

await verificarRespuesta(respuesta);

return (await respuesta.json()) as PedidoServidor;
}

export async function obtenerMisPedidosServidor(
credenciales: CredencialesFarmacia
): Promise<PedidoServidor[]> {
const respuesta = await fetch(`${URL_FARMACIA}/pedidos/mis-pedidos`,{
    headers: {
    Authorization: obtenerAutorizacion(credenciales)
    },
    cache: "no-store"
});

await verificarRespuesta(respuesta);

return (await respuesta.json()) as PedidoServidor[];
}

export async function obtenerTodosPedidosServidor(
credenciales: CredencialesFarmacia
): Promise<PedidoServidor[]> {
const respuesta = await fetch(`${URL_FARMACIA}/pedidos`,{
    headers: {
    Authorization: obtenerAutorizacion(credenciales)
    },
    cache: "no-store"
});

await verificarRespuesta(respuesta);

return (await respuesta.json()) as PedidoServidor[];
}