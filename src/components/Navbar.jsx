import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Menu,
  Search,
  User,
  X,
  ChevronRight,
} from "lucide-react";

export default function Navbar({ cartCount, onOpenCart }) {
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLiveResults, setShowLiveResults] = useState(false);

  // 1. CARGAR DATOS (Identidad y Productos para el Live Search)
  const [data] = useState(() => {
    try {
      const settings = JSON.parse(localStorage.getItem("shopSettings") || "{}");
      const logo = localStorage.getItem("shopLogo");
      const products = JSON.parse(localStorage.getItem("shopProducts") || "[]");

      return {
        nombre: settings.nombre || "JENTA",
        logo: logo,
        products: products,
      };
    } catch {
      return { nombre: "JENTA", logo: null, products: [] };
    }
  });

  // 2. FILTRADO EN TIEMPO REAL (Live Search)
  const liveResults = useMemo(() => {
    if (searchTerm.length < 2) return []; // Solo busca si hay más de 2 letras
    return data.products
      .filter((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 5); // Limitamos a 5 resultados para no llenar la pantalla
  }, [searchTerm, data.products]);

  // --- MANEJADORES ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/productos?buscar=${searchTerm}`);
      setIsSearchOpen(false);
      setShowLiveResults(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setShowLiveResults(val.length > 1);
  };

  // Formateador de precio para la vista previa
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm h-20">
      <div className="container mx-auto px-4 md:px-8 h-full flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 relative z-20">
          {data.logo ? (
            <img
              src={data.logo}
              alt="Logo"
              className="h-12 w-auto object-contain max-w-[150px]"
            />
          ) : (
            <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
              {data.nombre}
            </span>
          )}
        </Link>

        {/* MENÚ CENTRAL */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-sky-500 transition-colors">
            Inicio
          </Link>
          <Link
            to="/productos"
            className="hover:text-sky-500 transition-colors"
          >
            Productos
          </Link>
          <Link
            to="/productos?oferta=true"
            className="hover:text-sky-500 transition-colors"
          >
            Ofertas
          </Link>
        </div>

        {/* ICONOS DERECHA */}
        <div className="flex items-center gap-4 relative">
          {/* --- LUPA LIVE SEARCH --- */}
          {isSearchOpen ? (
            <div className="relative z-50">
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center animate-in fade-in slide-in-from-right-4 duration-300"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar producto..."
                  className="bg-slate-50 border border-slate-200 rounded-full py-2 pl-4 pr-10 text-sm outline-none focus:border-sky-500 w-60 md:w-80 transition-all text-slate-700 shadow-sm"
                  value={searchTerm}
                  onChange={handleInputChange}
                  // Retrasamos el cierre para permitir clic en el resultado
                  onBlur={() =>
                    setTimeout(() => {
                      if (!searchTerm) setIsSearchOpen(false);
                      setShowLiveResults(false);
                    }, 200)
                  }
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchTerm("");
                    setShowLiveResults(false);
                  }}
                  className="absolute right-3 text-slate-400 hover:text-sky-500"
                >
                  <X size={16} />
                </button>
              </form>

              {/* --- RESULTADOS FLOTANTES (DROPDOWN) --- */}
              {showLiveResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {liveResults.length > 0 ? (
                    <>
                      <div className="py-2">
                        <p className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Productos sugeridos
                        </p>
                        {liveResults.map((product) => (
                          <Link
                            key={product.id}
                            to={`/producto/${product.id}`}
                            onClick={() => {
                              setIsSearchOpen(false); // Cierra todo al hacer clic
                              setSearchTerm("");
                            }}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors group"
                          >
                            {/* Miniatura Imagen */}
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                              {product.images && product.images[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Search size={14} className="text-slate-300" />
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-700 truncate group-hover:text-sky-600 transition-colors">
                                {product.title}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatPrice(product.price)}
                              </p>
                            </div>
                            <ChevronRight
                              size={14}
                              className="text-slate-300"
                            />
                          </Link>
                        ))}
                      </div>
                      {/* Ver todos los resultados */}
                      <div className="bg-slate-50 border-t border-slate-100 p-2">
                        <button
                          onMouseDown={handleSearchSubmit} // onMouseDown ocurre antes que onBlur
                          className="w-full text-center text-xs font-bold text-sky-600 hover:underline py-1"
                        >
                          Ver todos los resultados para "{searchTerm}"
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-slate-500">
                        No encontramos coincidencias
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:bg-slate-50 rounded-full text-slate-600 transition-colors"
            >
              <Search size={20} />
            </button>
          )}

          <Link
            to="/admin"
            className="p-2 hover:bg-slate-50 rounded-full text-slate-600 transition-colors"
          >
            <User size={20} />
          </Link>

          <button
            onClick={onOpenCart}
            className="p-2 bg-slate-900 text-white rounded-full hover:bg-sky-500 transition-colors relative group"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold group-hover:bg-white group-hover:text-sky-500 transition-colors">
                {cartCount}
              </span>
            )}
          </button>

          <button className="md:hidden p-2 text-slate-600">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
}
