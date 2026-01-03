import React from "react";

export default function ProductCard({ producto }) {
  return (
    // CAMBIO 1: 'group' para controlar el hover.
    // Usamos 'aspect-[4/5]' (o aspect-square) para que TODAS las cards tengan el mismo tamaño exacto.
    <div className="group relative w-full aspect-[5/6] overflow-hidden rounded-2xl bg-gray-100 shadow-md hover:shadow-xl transition-all duration-300">
      {/* CAMBIO 2: CONTENEDOR DE IMÁGENES
         Las imágenes ahora son "absolute inset-0". Llenan todo el espacio disponible del padre.
         Esto elimina el error de la "punta" blanca abajo.
      */}

      {/* Imagen Principal (Visible por defecto) */}
      <img
        src={producto.imagen1}
        alt={producto.nombre}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out group-hover:opacity-0"
      />

      {/* Imagen Secundaria (Visible al Hover) */}
      {producto.imagen2 && (
        <img
          src={producto.imagen2}
          alt={producto.nombre}
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100"
        />
      )}

      {/* CAMBIO 3: BADGE DE OFERTA (Opcional, se ve profesional)
         Si tiene precio anterior, mostramos una etiqueta de "Oferta"
      */}
      {producto.precioAnterior && (
        <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
          OFERTA
        </div>
      )}

      {/* CAMBIO 4: INFORMACIÓN MEJORADA
         Ahora el fondo es blanco solido para mejor lectura, y sube ligeramente.
      */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 transition-transform duration-300 translate-y-0">
        <h3 className="text-md font-bold text-gray-900 truncate">
          {producto.nombre}
        </h3>

        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
              {producto.marca || "Genta"}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-bold text-lg">
                ${producto.precio}
              </span>
              {producto.precioAnterior && (
                <span className="text-gray-400 text-xs line-through">
                  ${producto.precioAnterior}
                </span>
              )}
            </div>
          </div>

          {/* Botón "+" decorativo que se ilumina al pasar el mouse por la card */}
          <button className="bg-gray-100 p-2 rounded-full text-gray-600 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
