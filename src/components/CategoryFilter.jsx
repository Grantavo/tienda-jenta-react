import React from "react";

// Recibimos:
// - categorias: La lista de opciones disponibles
// - filtroActivo: Cuál es la categoría seleccionada actualmente (para pintarla de rojo)
// - setFiltroActivo: La función "mágica" para cambiar el estado
export default function CategoryFilter({
  categorias,
  filtroActivo,
  setFiltroActivo,
}) {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      {categorias.map((categoria) => (
        <button
          key={categoria.id}
          onClick={() => setFiltroActivo(categoria.id)} // Al hacer clic, actualizamos el estado
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 ${
            filtroActivo === categoria.id
              ? "bg-red-600 text-white shadow-lg shadow-red-500/30" // Estilo Activo
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200" // Estilo Inactivo
          }`}
        >
          {categoria.nombre}
        </button>
      ))}
    </div>
  );
}
