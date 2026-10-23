export interface ProductoFarmacia {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  precioAnterior?: number;
  stock: number;
  imagen: string;
  requiereReceta: boolean;
}

const CLAVE_INVENTARIO = "inventarioFarmaciaSanMarcos";

export const productosIniciales: ProductoFarmacia[] = [
  {
    id: "FM001",
    nombre: "Cognidine Perro Gato 60 comp",
    categoria: "Suplementos",
    precio: 30000,
    precioAnterior: 43740,
    stock: 12,
    imagen: "/img/farmacia/cognidine.png",
    requiereReceta: false
  },
  {
    id: "FM002",
    nombre: "Inveade Solucion Oral 15 ml",
    categoria: "Medicamentos",
    precio: 6200,
    precioAnterior: 8270,
    stock: 6,
    imagen: "/img/farmacia/inveade.png",
    requiereReceta: false
  },
  {
    id: "FM003",
    nombre: "Silimadrag Perro 60 comp",
    categoria: "Suplementos",
    precio: 15990,
    precioAnterior: 16990,
    stock: 8,
    imagen: "/img/farmacia/silimadrag.png",
    requiereReceta: false
  },
  {
    id: "FM004",
    nombre: "Cerenia 60 mg 4 comp",
    categoria: "Medicamentos",
    precio: 28990,
    stock: 4,
    imagen: "/img/farmacia/cerenia.png",
    requiereReceta: true
  },
  {
    id: "FM005",
    nombre: "Meloxivet Gato 0.5 mg Oral 20 ml",
    categoria: "Medicamentos",
    precio: 13990,
    precioAnterior: 18110,
    stock: 5,
    imagen: "/img/farmacia/meloxivet.png",
    requiereReceta: true
  },
  {
    id: "FM006",
    nombre: "Digest Plasmoral Raza Grande 1 unidad",
    categoria: "Suplementos",
    precio: 1190,
    stock: 16,
    imagen: "/img/farmacia/digest-plasmoral.png",
    requiereReceta: false
  },
  {
    id: "FM007",
    nombre: "Maxiguard Gel Dental Perro Gato 118 ml",
    categoria: "Higiene",
    precio: 21990,
    precioAnterior: 23740,
    stock: 10,
    imagen: "/img/farmacia/maxiguard.png",
    requiereReceta: false
  },
  {
    id: "FM008",
    nombre: "Vet Gastril Gel Oral 20 ml",
    categoria: "Suplementos",
    precio: 19990,
    precioAnterior: 24990,
    stock: 7,
    imagen: "/img/farmacia/vet-gastril.png",
    requiereReceta: false
  }
];

export function obtenerProductosFarmacia(): ProductoFarmacia[] {
  const guardados = localStorage.getItem(CLAVE_INVENTARIO);

  if (!guardados) {
    return productosIniciales.map((producto) => ({
      ...producto
    }));
  }

  try {
    const resultado: unknown = JSON.parse(guardados);

    if (Array.isArray(resultado)) {
      return resultado as ProductoFarmacia[];
    }
  } catch {
    
  }

  return productosIniciales.map((producto) => ({
    ...producto
  }));
}

export function guardarProductosFarmacia(
  productos: ProductoFarmacia[]
): void {
  localStorage.setItem(
    CLAVE_INVENTARIO,
    JSON.stringify(productos)
  );
}

export function agregarProductoFarmacia(
  nuevoProducto: ProductoFarmacia
): boolean {
  const productos = obtenerProductosFarmacia();

  const existe = productos.some(
    (producto) => producto.id === nuevoProducto.id
  );

  if (
    existe ||
    !nuevoProducto.nombre.trim() ||
    nuevoProducto.precio < 0 ||
    !Number.isInteger(nuevoProducto.stock) ||
    nuevoProducto.stock < 0
  ) {
    return false;
  }

  productos.push(nuevoProducto);
  guardarProductosFarmacia(productos);

  return true;
}

export function editarProductoFarmacia(
  id: string,
  cambios: Partial<Omit<ProductoFarmacia, "id">>
): boolean {
  const productos = obtenerProductosFarmacia();

  const indice = productos.findIndex(
    (producto) => producto.id === id
  );

  if (indice === -1) {
    return false;
  }

  const actualizado = {
    ...productos[indice],
    ...cambios
  };

  if (
    !actualizado.nombre.trim() ||
    actualizado.precio < 0 ||
    !Number.isInteger(actualizado.stock) ||
    actualizado.stock < 0
  ) {
    return false;
  }

  productos[indice] = actualizado;
  guardarProductosFarmacia(productos);

  return true;
}

export function eliminarProductoFarmacia(
  id: string
): boolean {
  const productos = obtenerProductosFarmacia();

  const existe = productos.some(
    (producto) => producto.id === id
  );

  if (!existe) {
    return false;
  }

  const actualizados = productos.filter(
    (producto) => producto.id !== id
  );

  guardarProductosFarmacia(actualizados);

  return true;
}