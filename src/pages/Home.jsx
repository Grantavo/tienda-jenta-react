import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShoppingBag,
  ShoppingCart,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  // --- 1. CARGA DE DATOS ---
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
          subtitle: "Configura este banner en el admin",
          btnText: "Ver Productos",
          image: null,
        },
      ];
    } catch {
      return [];
    }
  });

  const [categories] = useState(() => {
    try {
      const savedCats = localStorage.getItem("shopCategories");
      return savedCats ? JSON.parse(savedCats) : [];
    } catch {
      return [];
    }
  });

  const [featuredProducts] = useState(() => {
    try {
      const allProds = JSON.parse(localStorage.getItem("shopProducts") || "[]");
      return allProds.slice(0, 4);
    } catch {
      return [];
    }
  });

  // --- HELPER: FORMATEADOR DE PRECIO COLOMBIANO ---
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // --- 2. LÓGICA DEL CARRUSEL ---
  const [currentSlide, setCurrentSlide] = useState(0);

  const prevSlide = () => {
    setCurrentSlide((curr) => (curr === 0 ? banners.length - 1 : curr - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((curr) => (curr + 1) % banners.length);
  };

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners, currentSlide]);

  if (!banners || banners.length === 0) return null;

  const activeBanner = banners[currentSlide] || banners[0];

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
        {/* Fondo con imagen */}
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

        {/* Contenido Texto */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-12 md:px-20 animate-in slide-in-from-bottom-8 duration-500">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter drop-shadow-lg max-w-4xl">
            {activeBanner.title}
          </h1>
          <p className="text-slate-200 text-lg md:text-xl mb-8 max-w-2xl mx-auto drop-shadow-md">
            {activeBanner.subtitle}
          </p>
          <Link to={activeBanner.link || "/productos"}>
            <button className="bg-red-600 text-white px-8 py-4 rounded-full font-bold hover:bg-red-700 transition shadow-lg shadow-red-600/30 transform hover:scale-105 active:scale-95">
              {activeBanner.btnText || "Ver más"}
            </button>
          </Link>
        </div>

        {/* Flechas de Navegación */}
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
          </>
        )}

        {/* Puntos Indicadores */}
        {banners.length > 1 && (
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
        )}
      </div>

      {/* 2. SECCIÓN DE CATEGORÍAS */}
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
            {categories.length === 0 && (
              <div className="col-span-full text-center text-slate-400 py-4">
                No hay categorías configuradas aún.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. PRODUCTOS DESTACADOS */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Tendencias</h2>
          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
            HOT
          </span>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link
                to={`/producto/${product.id}`}
                key={product.id}
                className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="aspect-square bg-slate-50 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center p-4">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-slate-300 font-bold">Sin foto</span>
                  )}

                  {/* --- AQUÍ APLICAMOS LA MEJORA DEL PRECIO --- */}
                  <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm shadow-sm">
                    {formatPrice(product.price)}
                  </div>

                  <div className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                    <ShoppingCart size={16} className="text-slate-800" />
                  </div>
                </div>
                <h3 className="font-bold text-slate-700 truncate mb-1">
                  {product.title}
                </h3>
                <div className="flex items-center gap-1 text-yellow-400 text-xs">
                  <Star size={12} fill="currentColor" /> <span>4.8</span>{" "}
                  <span className="text-slate-300 ml-1">(24)</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400">
              Aún no hay productos destacados. Ve al admin para empezar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
