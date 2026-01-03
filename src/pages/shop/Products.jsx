import React, { useState, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { Filter, ShoppingCart, Search, Tag, X } from "lucide-react";

export default function ShopProducts() {
  const location = useLocation();

  // 1. OBTENER PARÁMETROS URL
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get("buscar") || "";
  const isOfferMode = queryParams.get("oferta") === "true";

  // 2. CARGA DE DATOS (Lazy Init - Carga Instantánea)
  // Leemos localStorage UNA sola vez al iniciar.
  const [allProducts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("shopProducts") || "[]");
    } catch {
      return [];
    }
  });

  // 3. FILTRADO INTELIGENTE (useMemo)
  // React recordará este resultado y solo recalculará si cambia la búsqueda o el modo oferta.
  // Esto elimina el error de "setState" y hace la búsqueda instantánea.
  const filteredProducts = useMemo(() => {
    let result = allProducts;

    // A. Filtro por Búsqueda
    if (searchTerm) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // B. Filtro por Ofertas (Precio Tachado > Precio Real)
    if (isOfferMode) {
      result = result.filter(
        (p) => parseInt(p.oldPrice || 0) > parseInt(p.price || 0)
      );
    }

    return result;
  }, [allProducts, searchTerm, isOfferMode]);

  // Formateador de precios
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      {/* 1. HEADER DE LA PÁGINA PÚBLICA */}
      <div className="bg-white shadow-sm border-b border-slate-100 py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-2">
            {isOfferMode ? (
              <span className="text-sky-500 flex items-center gap-2">
                <Tag /> Ofertas Especiales
              </span>
            ) : searchTerm ? (
              <span>Buscando: "{searchTerm}"</span>
            ) : (
              "Todos los Productos"
            )}
          </h1>
          <p className="text-slate-500 text-sm">
            {filteredProducts.length} productos encontrados
          </p>

          {/* Botón para limpiar filtros */}
          {(isOfferMode || searchTerm) && (
            <Link
              to="/productos"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 mt-2 hover:text-sky-500 transition-colors"
            >
              <X size={12} /> Ver todo el catálogo
            </Link>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 2. GRILLA DE PRODUCTOS */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              // Cálculo de descuento
              const price = parseInt(product.price || 0);
              const oldPrice = parseInt(product.oldPrice || 0);
              const hasDiscount = oldPrice > price;
              const discountPercent = hasDiscount
                ? Math.round(((oldPrice - price) / oldPrice) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-xl transition-all duration-300 group overflow-hidden relative"
                >
                  {/* Badge de Oferta */}
                  {hasDiscount && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md z-10 shadow-sm">
                      -{discountPercent}% OFF
                    </span>
                  )}

                  {/* Badge de Agotado */}
                  {parseInt(product.stock) <= 0 && (
                    <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center backdrop-blur-[1px]">
                      <span className="bg-slate-800 text-white font-bold px-4 py-2 rounded-full text-xs">
                        AGOTADO
                      </span>
                    </div>
                  )}

                  {/* Imagen */}
                  <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center p-4">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-slate-300 font-bold flex flex-col items-center">
                        <Search size={32} />
                        <span className="text-xs mt-2">Sin foto</span>
                      </div>
                    )}
                  </div>

                  {/* Info del Producto */}
                  <div className="p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      {product.brand || "Genérica"}
                    </p>
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-2 h-10 leading-tight group-hover:text-sky-600 transition-colors">
                      {product.title}
                    </h3>

                    <div className="flex flex-col items-start">
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatPrice(oldPrice)}
                        </span>
                      )}
                      <span
                        className={`font-black text-lg ${
                          hasDiscount ? "text-red-500" : "text-slate-800"
                        }`}
                      >
                        {formatPrice(price)}
                      </span>
                    </div>

                    {/* Botón Ver Detalle */}
                    <Link to={`/producto/${product.id}`}>
                      <button className="w-full mt-4 bg-slate-50 text-slate-600 font-bold py-2 rounded-lg text-xs group-hover:bg-slate-800 group-hover:text-white transition-colors flex items-center justify-center gap-2">
                        <ShoppingCart size={14} />
                        Ver Detalle
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // ESTADO VACÍO
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <Search className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-600 mb-2">
              {isOfferMode
                ? "No hay ofertas activas"
                : "No encontramos productos"}
            </h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              {isOfferMode
                ? "Estamos preparando nuevos descuentos. Revisa nuestros productos generales."
                : "Intenta con otro término de búsqueda o navega por el catálogo."}
            </p>
            <Link
              to="/productos"
              className="mt-6 inline-block bg-sky-50 text-sky-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-sky-100 transition-colors"
            >
              Ver todos los productos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
