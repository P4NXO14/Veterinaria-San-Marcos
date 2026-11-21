export type RolNavegacion = "visitante" | "cliente" | "recepcionista" | "admin";

export interface EnlaceMenu {
texto: string;
destino: string;
roles: RolNavegacion[];
}

export const enlacesNavegacion: EnlaceMenu[] = [
{
    texto: "Inicio",
    destino: "/",
    roles: ["visitante","cliente","recepcionista","admin"]
},
{
    texto: "Nosotros",
    destino: "/nosotros",
    roles: ["visitante","cliente","recepcionista","admin"]
},
{
    texto: "Servicios",
    destino: "/servicios",
    roles: ["visitante","cliente"]
},
{
    texto: "Farmacia",
    destino: "/farmacia",
    roles: ["visitante","cliente"]
},
{
    texto: "Contacto",
    destino: "/contacto",
    roles: ["visitante","cliente"]
},
{
    texto: "Mis Citas",
    destino: "/reserva",
    roles: ["visitante","cliente"]
},
{
    texto: "Recepcion",
    destino: "/recepcion",
    roles: ["recepcionista","admin"]
},
{
    texto: "Inventario",
    destino: "/inventario-farmacia",
    roles: ["recepcionista","admin"]
},
{
    texto: "Administracion",
    destino: "/admin",
    roles: ["admin"]
},
{
    texto: "Registro",
    destino: "/registro",
    roles: ["visitante"]
},
{
    texto: "Iniciar Sesion",
    destino: "/login",
    roles: ["visitante"]
}
];