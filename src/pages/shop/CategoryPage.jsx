import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom"; // 1. IMPORTAMOS useSearchParams
import { Filter, Layers, FolderOpen } from "lucide-react";

// IMPORTAR FIREBASE
import { db } from "../../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

// IMPORTAR TARJETA MAESTRA
import ProductCard from "../../components/ProductCard";

export default function CategoryPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams(); // 2. HOOK PARA LEER LA URL

  // Estados de datos
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState({
    name: "Cargando...",
    subcategories: [],
  });
  const [loading, setLoading] = useState(true);

  // Estado del filtro activo (inicia viendo 'todo')
  const [activeSubcat, setActiveSubcat] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // A. OBTENER DATOS DE LA CATEGORÍA
        const catRef = doc(db, "categories", id);
        const catSnap = await getDoc(catRef);

        let currentCategoryData = {
          name: "Categoría no encontrada",
          subcategories: [],
        };

        if (catSnap.exists()) {
          currentCategoryData = catSnap.data();
          setCategory(currentCategoryData);
        } else {
          setCategory(currentCategoryData);
        }

        // B. OBTENER PRODUCTOS
        const q = query(
          collection(db, "products"),
          where("categoryId", "==", id.toString())
        );
        const querySnapshot = await getDocs(q);

        const prodsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(prodsData);

        // --- C. MAGIA DEL BANNER: ACTIVAR FILTRO DESDE URL ---
        // Leemos si la URL tiene ?sub=Nombre
        const subNameFromUrl = searchParams.get("sub");

        if (subNameFromUrl && currentCategoryData.subcategories) {
          // Buscamos el ID que corresponde a ese Nombre
          const foundSub = currentCategoryData.subcategories.find(
            (s) => s.name === subNameFromUrl
          );

          if (foundSub) {
            setActiveSubcat(foundSub.id); // Si existe, activamos ese filtro
          } else {
            setActiveSubcat("all"); // Si no, mostramos todo
          }
        } else {
          setActiveSubcat("all");
        }
      } catch (error) {
        console.error("Error cargando categoría:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, searchParams]); // Agregamos searchParams a las dependencias

  // --- D. FILTRADO LOCAL ---
  const filteredProducts =
    activeSubcat === "all"
      ? products
      : products.filter((p) => p.subcategoryId == activeSubcat);

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-in slide-in-from-left duration-500">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/30">
              <Filter size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                {category.name}
              </h1>
              <p className="text-slate-500 text-sm">
                {loading
                  ? "Cargando..."
                  : `Mostrando ${filteredProducts.length} productos`}
              </p>
            </div>
          </div>
        </div>

        {/* --- BARRA DE SUBCATEGORÍAS --- */}
        {!loading &&
          category.subcategories &&
          category.subcategories.length > 0 && (
            <div className="mb-8 overflow-x-auto pb-2 custom-scrollbar">
              <div className="flex gap-2">
                {/* Botón Ver Todo */}
                <button
                  onClick={() => setActiveSubcat("all")}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                    activeSubcat === "all"
                      ? "bg-slate-800 text-white border-slate-800 shadow-md"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Ver Todo
                </button>

                {/* Botones Dinámicos */}
                {category.subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubcat(sub.id)}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
                      activeSubcat === sub.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {activeSubcat === sub.id && <Layers size={14} />}
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          )}

        {/* --- GRID DE PRODUCTOS --- */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-400">Buscando productos en la nube...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          // Estado Vacío
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
            <FolderOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-600 mb-2">
              No hay productos aquí
            </h3>
            <p className="text-slate-400 mb-4">
              {activeSubcat !== "all"
                ? "Intenta seleccionar otra subcategoría o ver todo."
                : "Esta categoría aún no tiene productos registrados."}
            </p>
            {activeSubcat !== "all" && (
              <button
                onClick={() => setActiveSubcat("all")}
                className="text-blue-600 font-bold hover:underline"
              >
                Ver todos los productos de {category.name}
              </button>
            )}
          </div>
        ) : (
          // Grid de Tarjetas
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}
