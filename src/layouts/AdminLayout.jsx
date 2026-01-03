import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import {
  Search,
  Maximize,
  Home,
  User,
  Package,
  ShoppingBag,
} from "lucide-react"; // Agregamos ShoppingBag

export default function AdminLayout() {
  const navigate = useNavigate();

  // --- LÓGICA DEL BUSCADOR GLOBAL ---
  const [searchTerm, setSearchTerm] = useState("");
  // Ahora results incluye 'orders'
  const [results, setResults] = useState({
    products: [],
    users: [],
    orders: [],
  });
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // 1. CARGA DE DATOS (Lazy Init para rendimiento)
  // Ahora leemos también 'shopOrders'
  const [data] = useState(() => {
    try {
      const products = JSON.parse(localStorage.getItem("shopProducts") || "[]");
      const users = JSON.parse(localStorage.getItem("shopUsers") || "[]");
      const orders = JSON.parse(localStorage.getItem("shopOrders") || "[]");
      return { products, users, orders };
    } catch {
      return { products: [], users: [], orders: [] };
    }
  });

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. FUNCIÓN DE BÚSQUEDA MEJORADA
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length > 1) {
      const lowerTerm = term.toLowerCase().replace("#", ""); // Quitamos el # si el usuario lo escribe

      // A. Filtrar Productos
      const foundProducts = data.products
        .filter((p) => p.title.toLowerCase().includes(lowerTerm))
        .slice(0, 3);

      // B. Filtrar Usuarios
      const foundUsers = data.users
        .filter(
          (u) =>
            u.name.toLowerCase().includes(lowerTerm) ||
            u.email.toLowerCase().includes(lowerTerm)
        )
        .slice(0, 3);

      // C. Filtrar Pedidos (Por ID o Cliente)
      const foundOrders = data.orders
        .filter(
          (o) =>
            String(o.id).includes(lowerTerm) || // Busca "1001"
            o.client.toLowerCase().includes(lowerTerm) // Busca "Juan"
        )
        .slice(0, 3);

      setResults({
        products: foundProducts,
        users: foundUsers,
        orders: foundOrders,
      });
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  // Navegar al resultado
  const goToResult = (path) => {
    navigate(path);
    setShowResults(false);
    setSearchTerm("");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative selection:bg-red-500 selection:text-white font-sans text-slate-600">
      {/* FONDO DECORATIVO */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-500/10 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      {/* SIDEBAR */}
      <div className="relative z-20">
        <Sidebar />
      </div>

      {/* ÁREA DE CONTENIDO */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* --- HEADER FLOTANTE --- */}
        <header className="h-20 mx-6 mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 px-8 flex items-center justify-between shrink-0 relative z-50">
          {/* BARRA DE BÚSQUEDA */}
          <div className="relative w-96" ref={searchRef}>
            <input
              type="text"
              placeholder="Buscar pedido #1001, producto..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none text-sm"
              value={searchTerm}
              onChange={handleSearch}
              onFocus={() => searchTerm.length > 1 && setShowResults(true)}
            />
            <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-500 p-1.5 rounded-lg text-white">
              <Search size={18} />
            </div>

            {/* --- DROPDOWN DE RESULTADOS --- */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto custom-scrollbar">
                {/* 1. PEDIDOS (NUEVO) */}
                {results.orders.length > 0 && (
                  <div className="p-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400 px-2 mb-1 flex justify-between">
                      <span>Pedidos</span>
                      <span className="text-blue-500">Ir a pedidos →</span>
                    </p>
                    {results.orders.map((o) => (
                      <div
                        key={o.id}
                        onClick={() => goToResult("/admin/pedidos")} // Lleva a la lista de pedidos
                        className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition border-b border-slate-50 last:border-0"
                      >
                        <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center font-bold text-xs">
                          #{o.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <p className="text-sm font-bold text-slate-700 truncate">
                              {o.client}
                            </p>
                            <span
                              className={`text-[10px] px-1.5 rounded font-bold ${
                                o.status === "Pendiente"
                                  ? "bg-red-100 text-red-600"
                                  : o.status === "Entregado"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {o.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            ${o.total.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. PRODUCTOS */}
                {results.products.length > 0 && (
                  <div className="p-2 border-t border-slate-50">
                    <p className="text-[10px] uppercase font-bold text-slate-400 px-2 mb-1 mt-1">
                      Productos
                    </p>
                    {results.products.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => goToResult("/admin/productos")}
                        className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition"
                      >
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
                          <Package size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-700 truncate">
                            {p.title}
                          </p>
                          <p className="text-xs text-slate-400">
                            ${p.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. USUARIOS */}
                {results.users.length > 0 && (
                  <div className="p-2 border-t border-slate-50">
                    <p className="text-[10px] uppercase font-bold text-slate-400 px-2 mb-1 mt-1">
                      Usuarios
                    </p>
                    {results.users.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => goToResult("/admin/usuarios")}
                        className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition"
                      >
                        <div className="w-8 h-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                          <User size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-700 truncate">
                            {u.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SIN RESULTADOS */}
                {results.products.length === 0 &&
                  results.users.length === 0 &&
                  results.orders.length === 0 && (
                    <div className="p-6 text-center text-slate-400 text-sm">
                      <Search className="mx-auto mb-2 opacity-50" size={24} />
                      No encontramos nada para "{searchTerm}"
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* ACCIONES DE USUARIO */}
          <div className="flex items-center gap-6 text-slate-500 text-sm font-medium">
            <button className="hover:text-slate-800 transition-colors p-1 hover:bg-slate-100 rounded-full">
              <Maximize size={20} />
            </button>
            <button className="bg-slate-700 text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition-colors font-bold shadow-lg shadow-slate-700/20">
              Instalar
            </button>
            <Link
              to="/"
              className="flex items-center gap-2 hover:text-slate-800 transition-colors"
            >
              <Home size={18} />
              <span>Tienda</span>
            </Link>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer hover:text-slate-800 transition-colors">
              <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                <User size={18} />
              </div>
              <span>Mi Perfil</span>
            </div>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-hidden px-6 pb-6 pt-6">
          <div className="h-full w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-y-auto custom-scrollbar p-8 border border-slate-100">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
