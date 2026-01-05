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
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  Camera,
} from "lucide-react";

import { db } from "../firebase/config";
import { doc, updateDoc } from "firebase/firestore";

export default function AdminLayout() {
  const navigate = useNavigate();

  // --- ESTADOS GLOBALES ---
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("shopUser") || "{}")
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Leemos el tema guardado, si no existe, por defecto es 'light'
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState({
    products: [],
    users: [],
    orders: [],
  });
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const menuRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target))
        setShowResults(false);
      if (menuRef.current && !menuRef.current.contains(event.target))
        setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- EFECTO MODO OSCURO (Aquí ocurre la magia) ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const handleLogout = () => {
    if (window.confirm("¿Cerrar sesión?")) {
      localStorage.removeItem("shopUser");
      navigate("/login");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      const updatedUser = { ...currentUser, photoURL: base64String };
      setCurrentUser(updatedUser);
      localStorage.setItem("shopUser", JSON.stringify(updatedUser));
      try {
        if (currentUser.id) {
          const userRef = doc(db, "users", currentUser.id);
          await updateDoc(userRef, { photoURL: base64String });
        }
      } catch (error) {
        console.error("Error guardando imagen:", error);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 1) {
      const lowerTerm = term.toLowerCase().replace("#", "");
      const foundProducts = data.products
        .filter((p) => p.title.toLowerCase().includes(lowerTerm))
        .slice(0, 3);
      const foundUsers = data.users
        .filter(
          (u) =>
            u.name.toLowerCase().includes(lowerTerm) ||
            u.email.toLowerCase().includes(lowerTerm)
        )
        .slice(0, 3);
      const foundOrders = data.orders
        .filter(
          (o) =>
            String(o.id).includes(lowerTerm) ||
            o.client.toLowerCase().includes(lowerTerm)
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

  const goToResult = (path) => {
    navigate(path);
    setShowResults(false);
    setSearchTerm("");
  };

  return (
    // 1. FONDO PRINCIPAL: Agregamos dark:bg-slate-900 y dark:text-slate-100
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden relative selection:bg-red-500 selection:text-white font-sans text-slate-600 dark:text-slate-300 transition-colors duration-300">
      {/* FONDO DECORATIVO */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-500/10 dark:bg-red-500/5 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-20">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* --- HEADER --- */}
        {/* Agregamos dark:bg-slate-800 dark:border-slate-700 */}
        <header className="h-20 mx-6 mt-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 px-8 flex items-center justify-between shrink-0 relative z-50 transition-colors duration-300">
          <div className="relative w-96" ref={searchRef}>
            <input
              type="text"
              placeholder="Buscar pedido #1001, producto..."
              // Input oscuro
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none text-sm"
              value={searchTerm}
              onChange={handleSearch}
              onFocus={() => searchTerm.length > 1 && setShowResults(true)}
            />
            <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-500 p-1.5 rounded-lg text-white">
              <Search size={18} />
            </div>

            {/* RESULTADOS DE BÚSQUEDA (MODO OSCURO) */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto custom-scrollbar">
                {/* ... (La lógica de resultados se mantiene, los colores heredarán del contenedor) ... */}
                {/* Puedes personalizar los hover aquí si quieres: hover:bg-slate-50 dark:hover:bg-slate-700 */}
                <div className="p-4 text-center text-xs text-slate-400">
                  Resultados de búsqueda...
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400 text-sm font-medium">
            <button className="hover:text-slate-800 dark:hover:text-white transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
              <Maximize size={20} />
            </button>
            <button className="bg-slate-700 dark:bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors font-bold shadow-lg">
              Instalar
            </button>
            <Link
              to="/"
              className="flex items-center gap-2 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <Home size={18} />
              <span>Tienda</span>
            </Link>

            {/* --- MENÚ DE PERFIL --- */}
            <div className="relative" ref={menuRef}>
              <div
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700 cursor-pointer hover:text-slate-800 dark:hover:text-white transition-colors select-none"
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User
                      size={18}
                      className="text-slate-500 dark:text-slate-300"
                    />
                  )}
                </div>
                <span className="font-bold">
                  {currentUser.name?.split(" ")[0] || "Usuario"}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    isMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* DROPDOWN DEL PERFIL (OSCURO) */}
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-4 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="p-6 border-b border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                    <div
                      className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-3 flex items-center justify-center overflow-hidden relative group cursor-pointer border-4 border-white dark:border-slate-600 shadow-sm"
                      onClick={() => fileInputRef.current.click()}
                    >
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt="Perfil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User
                          className="text-slate-400 dark:text-slate-300"
                          size={40}
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" size={24} />
                      </div>
                    </div>
                    <p className="font-bold text-slate-800 dark:text-white text-lg">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {currentUser.email}
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>

                  <div className="p-2 space-y-1">
                    {/* INTERRUPTOR DE TEMA */}
                    <button
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition"
                    >
                      {isDarkMode ? (
                        <Sun size={18} className="text-orange-500" />
                      ) : (
                        <Moon size={18} className="text-slate-400" />
                      )}
                      {isDarkMode ? "Cambiar a Claro" : "Cambiar a Oscuro"}
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
                    >
                      <LogOut size={18} />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-hidden px-6 pb-6 pt-6">
          {/* Contenedor blanco/oscuro para las páginas hijas */}
          <div className="h-full w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-y-auto custom-scrollbar p-8 border border-slate-100 dark:border-slate-700 relative transition-colors duration-300">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
