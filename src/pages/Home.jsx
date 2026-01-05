import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";

// 1. IMPORTAMOS LAS HERRAMIENTAS DE FIREBASE
import { db } from "../firebase/config";
import { collection, getDocs, query, where, limit } from "firebase/firestore";

// 2. IMPORTAMOS EL COMPONENTE MAESTRO (NUEVO)
import ProductCard from "../components/ProductCard";

export default function Home() {
  // --- ESTADOS DE DATOS ---
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 2. EFECTO: CARGAR DATOS DESDE FIREBASE ---
  useEffect(() => {
    const fetchFirebaseData = async () => {
      try {
        setLoading(true);

        // A. Cargar Categorías
        const catRef = collection(db, "categories");
        const catSnap = await getDocs(catRef);
        const catsData = catSnap.docs.map((doc) => doc.data());
        setCategories(catsData);

        // B. Cargar Productos Destacados (Tendencias)
        const prodRef = collection(db, "products");
        const q = query(prodRef, where("bestSeller", "==", "si"), limit(4));
        const prodSnap = await getDocs(q);
        const prodsData = prodSnap.docs.map((doc) => ({
          id: doc.id, // Aseguramos pasar el ID
          ...doc.data(),
        }));
        setFeaturedProducts(prodsData);
      } catch (error) {
        console.error("Error cargando desde Firebase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFirebaseData();
  }, []);

  // --- DATOS VISUALES (LocalStorage) ---
  const [topBar] = useState(() => {
    try {
      const saved = localStorage.getItem("shopDesign");
      return saved
        ? JSON.parse(saved).topBar
        : {
            text: "Bienvenido a nuestra tienda",
            bgColor: "#1e293b",
            textColor: "#fff",
          };
    } catch {
      return {};
    }
  });

  const [banners] = useState(() => {
    try {
      const savedBanners = JSON.parse(
        localStorage.getItem("shopBanners") || "[]"
      );
      const activeBanners = savedBanners.filter((b) => b.active);
      if (activeBanners.length > 0) return activeBanners;
      return [
        {
          id: 999,
          title: "BIENVENIDO",
          subtitle: "Explora nuestro catálogo completo",
          btnText: "Ver Productos",
          link: "/productos",
          image: null,
        },
      ];
    } catch {
      return [];
    }
  });

  // Lógica del Carrusel
  const [currentSlide, setCurrentSlide] = useState(0);
  const prevSlide = () =>
    setCurrentSlide((curr) => (curr === 0 ? banners.length - 1 : curr - 1));
  const nextSlide = () =>
    setCurrentSlide((curr) => (curr + 1) % banners.length);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(
      () => setCurrentSlide((prev) => (prev + 1) % banners.length),
      5000
    );
    return () => clearInterval(interval);
  }, [banners]);

  const activeBanner = banners[currentSlide] || banners[0];

  // --- RENDERIZADO ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      {/* 0. BARRA SUPERIOR */}
      {topBar && topBar.isActive !== false && (
        <div
          className="w-full py-2 px-4 text-center text-xs md:text-sm font-bold tracking-wide"
          style={{
            backgroundColor: topBar.bgColor || "#1e293b",
            color: topBar.textColor || "#fff",
          }}
        >
          {topBar.text}
        </div>
      )}

      {/* 1. HERO BANNER */}
      <div className="bg-slate-900 text-white relative overflow-hidden h-[400px] md:h-[500px] group">
        <div className="absolute inset-0 transition-all duration-700 ease-in-out">
          {activeBanner.image ? (
            <img
              key={activeBanner.id}
              src={activeBanner.image}
              alt="Banner"
              className="w-full h-full object-cover opacity-60 animate-in fade-in zoom-in duration-1000"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-black opacity-90"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-12 md:px-20 animate-in slide-in-from-bottom-8 duration-500">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter drop-shadow-lg max-w-4xl">
            {activeBanner.title}
          </h1>
          <p className="text-slate-200 text-lg md:text-xl mb-8 max-w-2xl mx-auto drop-shadow-md">
            {activeBanner.subtitle}
          </p>
          <Link to={activeBanner.link || "/productos"}>
            <button className="bg-red-600 text-white px-8 py-4 rounded-full font-bold hover:bg-red-700 transition shadow-lg shadow-red-600/30 transform hover:scale-105 active:scale-95">
              {activeBanner.btnText || "Ver Productos"}
            </button>
          </Link>
        </div>

        {banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg"
            >
              <ChevronRight size={28} />
            </button>
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${
                    currentSlide === idx
                      ? "w-8 bg-red-600"
                      : "w-2 bg-white/50 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 2. SECCIÓN DE CATEGORÍAS (DESDE FIREBASE) */}
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                Categorías Populares
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Explora por departamento
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {categories.map((cat) => (
              <Link
                to={`/categoria/${cat.id}`}
                key={cat.id}
                className="group cursor-pointer flex flex-col items-center gap-3"
              >
                <div className="relative w-full aspect-square rounded-full overflow-hidden bg-white border border-slate-100 shadow-sm transition-all duration-500 ease-out group-hover:shadow-2xl group-hover:shadow-red-500/20 group-hover:border-red-100 group-hover:-translate-y-2">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50 group-hover:bg-red-50 transition-colors duration-500">
                      <ShoppingBag
                        size={32}
                        className="text-slate-300 group-hover:text-red-500 transition-colors duration-300"
                      />
                    </div>
                  )}
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-bold text-slate-700 text-sm md:text-base transition-colors duration-300 group-hover:text-red-600">
                    {cat.name}
                  </h3>
                  <div className="h-0.5 w-0 bg-red-600 mx-auto transition-all duration-300 group-hover:w-1/2 rounded-full opacity-50"></div>
                </div>
              </Link>
            ))}
            {categories.length === 0 && !loading && (
              <div className="col-span-full text-center text-slate-400 py-4">
                No hay categorías disponibles.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. PRODUCTOS DESTACADOS (DESDE FIREBASE) */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Tendencias</h2>
          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
            HOT
          </span>
        </div>

        {featuredProducts.length > 0 ? (
          // AQUÍ IMPLEMENTAMOS TU NUEVO DISEÑO DE TARJETAS
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400">
              No se encontraron productos destacados en la nube.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
