import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Tag, X, Search } from "lucide-react";

// 1. IMPORTAR FIREBASE
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";

// 2. IMPORTAR TU TARJETA MAESTRA (Esto es lo que replica el diseño)
import ProductCard from "../../components/ProductCard";

export default function ShopProducts() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get("buscar") || "";
  const isOfferMode = queryParams.get("oferta") === "true";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const allProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        let result = allProducts;

        if (searchTerm) {
          result = result.filter((p) =>
            p.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        if (isOfferMode) {
          result = result.filter((p) => {
            const price = Number(p.price) || 0;
            const oldPrice = Number(p.oldPrice) || 0;
            return oldPrice > price;
          });
        }

        setProducts(result);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, isOfferMode]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      {/* HEADER */}
      <div className="bg-white shadow-sm border-b border-slate-100 py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-2 flex items-center gap-2">
            {isOfferMode ? (
              <>
                <Tag className="text-red-600" />{" "}
                <span className="text-red-600">Ofertas</span>
              </>
            ) : searchTerm ? (
              <span>Buscando: "{searchTerm}"</span>
            ) : (
              "Todos los Productos"
            )}
          </h1>
          <p className="text-slate-500 text-sm">
            {loading
              ? "Cargando..."
              : `${products.length} productos disponibles`}
          </p>
          {(isOfferMode || searchTerm) && (
            <Link
              to="/productos"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 mt-2 hover:text-red-500"
            >
              <X size={12} /> Limpiar filtros
            </Link>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* GRILLA DE PRODUCTOS */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">
            Cargando catálogo...
          </div>
        ) : products.length > 0 ? (
          // --- AQUÍ ESTÁ LA MAGIA ---
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              // Usamos el componente maestro en lugar de escribir todo el HTML
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          // --------------------------

          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <Search className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-600">
              No hay productos
            </h3>
            <Link
              to="/productos"
              className="mt-4 inline-block text-blue-600 font-bold text-sm hover:underline"
            >
              Ver todo
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
