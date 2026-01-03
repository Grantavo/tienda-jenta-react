import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Filter } from "lucide-react";

export default function CategoryPage() {
  const { id } = useParams(); // ID de la categoría actual (desde la URL)

  // 1. CARGAR DATOS CRUDOS (Solo una vez)
  const [data] = useState(() => {
    try {
      const allProducts = JSON.parse(
        localStorage.getItem("shopProducts") || "[]"
      );
      const allCats = JSON.parse(
        localStorage.getItem("shopCategories") || "[]"
      );
      return { allProducts, allCats };
    } catch (e) {
      // SOLUCIÓN: Usamos 'e' imprimiéndolo en consola para que ESLint no se queje
      console.error("Error al cargar datos del almacenamiento:", e);
      return { allProducts: [], allCats: [] };
    }
  });

  // 2. LÓGICA DERIVADA (Calculada al vuelo)

  // A. Buscar nombre de la categoría
  const currentCat = data.allCats.find((c) => c.id == id);
  const categoryName = currentCat ? currentCat.name : "Categoría Desconocida";

  // B. Filtrar productos
  const products = data.allProducts.filter((p) => p.categoryId == id);

  // --- RENDERIZADO ---
  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header de Categoría */}
        <div className="flex items-center gap-3 mb-8 animate-in slide-in-from-left duration-500">
          <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/30">
            <Filter size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {categoryName}
            </h1>
            <p className="text-slate-500">
              Mostrando {products.length} productos disponibles
            </p>
          </div>
        </div>

        {/* Grid de Productos */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
            <p className="text-slate-400 text-lg">
              No hay productos en esta categoría aún.
            </p>
            <Link
              to="/"
              className="text-blue-600 font-bold hover:underline mt-2 inline-block"
            >
              Volver al inicio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <Link
                to={`/producto/${p.id}`}
                key={p.id}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group duration-300"
              >
                {/* Imagen */}
                <div className="aspect-square bg-slate-100 rounded-xl mb-4 overflow-hidden relative">
                  {p.images[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">
                      Sin Foto
                    </div>
                  )}

                  {/* Etiqueta Agotado */}
                  {parseInt(p.stock) <= 0 && (
                    <span className="absolute inset-0 bg-white/80 flex items-center justify-center font-bold text-slate-500 backdrop-blur-sm">
                      AGOTADO
                    </span>
                  )}

                  {/* Etiqueta Oferta */}
                  {p.oldPrice > p.price && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                      Oferta
                    </span>
                  )}
                </div>

                {/* Info */}
                <div>
                  <p className="text-xs text-slate-400 mb-1">
                    {p.brand || "Genérica"}
                  </p>
                  <h3 className="font-bold text-slate-800 mb-2 truncate text-lg group-hover:text-blue-600 transition-colors">
                    {p.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-blue-600 font-black text-xl">
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        maximumFractionDigits: 0,
                      }).format(p.price)}
                    </p>
                    {p.oldPrice > p.price && (
                      <p className="text-sm text-slate-400 line-through">
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          maximumFractionDigits: 0,
                        }).format(p.oldPrice)}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
