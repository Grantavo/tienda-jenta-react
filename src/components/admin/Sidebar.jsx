import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  UserCog,
  Settings,
  LogOut,
  Tag,
  CreditCard,
  Truck,
  MessageSquare,
  Palette,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  // --- 1. LÓGICA OPTIMIZADA (Lazy Init) ---
  // Función auxiliar para leer localStorage
  const getSettingsFromStorage = () => {
    try {
      const saved = localStorage.getItem("shopSettings");
      return saved ? JSON.parse(saved) : { nombre: "GENTA", logo: null };
    } catch {
      return { nombre: "GENTA", logo: null };
    }
  };

  // Inicializamos el estado DIRECTAMENTE con el valor de memoria.
  // Esto evita el "doble render" y elimina el error.
  const [shopSettings, setShopSettings] = useState(getSettingsFromStorage);

  useEffect(() => {
    // Esta función solo se usa cuando ocurre el evento 'storage'
    const handleStorageUpdate = () => {
      setShopSettings(getSettingsFromStorage());
    };

    window.addEventListener("storage", handleStorageUpdate);
    return () => window.removeEventListener("storage", handleStorageUpdate);
  }, []);
  // --------------------------------------------------

  const menuGroups = [
    {
      title: "PRINCIPAL",
      items: [
        {
          path: "/admin",
          label: "Dashboard",
          icon: <LayoutDashboard size={20} />,
        },
      ],
    },
    {
      title: "GESTIÓN",
      items: [
        {
          path: "/admin/pedidos",
          label: "Pedidos",
          icon: <ShoppingBag size={20} />,
        },
        {
          path: "/admin/productos",
          label: "Productos",
          icon: <Package size={20} />,
        },
        {
          path: "/admin/categorias",
          label: "Categorías",
          icon: <Tag size={20} />,
        },
        {
          path: "/admin/clientes",
          label: "Clientes",
          icon: <Users size={20} />,
        },
        {
          path: "/admin/usuarios",
          label: "Usuarios",
          icon: <UserCog size={20} />,
        },
      ],
    },
    {
      title: "TIENDA",
      items: [
        {
          path: "/admin/banners",
          label: "Diseño",
          icon: <Palette size={20} />,
        },
        {
          path: "/admin/marketing",
          label: "Marketing",
          icon: <MessageSquare size={20} />,
        },
      ],
    },
    {
      title: "CONFIGURACIÓN",
      items: [
        {
          path: "/admin/pagos",
          label: "Pagos",
          icon: <CreditCard size={20} />,
        },
        { path: "/admin/envios", label: "Envíos", icon: <Truck size={20} /> },
        {
          path: "/admin/ajustes",
          label: "Ajustes",
          icon: <Settings size={20} />,
        },
      ],
    },
  ];

  return (
    <aside className="w-72 h-screen flex flex-col transition-all duration-300 relative border-r border-slate-200 bg-slate-100/80 backdrop-blur-xl">
      {/* LOGO DINÁMICO */}
      <div className="h-24 flex items-center px-8">
        {shopSettings.logo ? (
          // Si hay logo subido en ajustes, se muestra aquí
          <img
            src={shopSettings.logo}
            alt="Logo Tienda"
            className="max-h-12 w-auto object-contain transition-all duration-300"
          />
        ) : (
          // Si no hay logo, muestra el texto por defecto
          <span className="text-2xl font-black tracking-tighter text-slate-800 uppercase truncate">
            {shopSettings.nombre || "GENTA"}
            <span className="text-red-600">.ADMIN</span>
          </span>
        )}
      </div>

      {/* MENÚ */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-8 no-scrollbar">
        {menuGroups.map((group, index) => (
          <div key={index}>
            <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`group flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-white text-red-600 shadow-sm ring-1 ring-slate-200"
                          : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                      }`}
                    >
                      <span
                        className={`transition-colors duration-200 ${
                          isActive
                            ? "text-red-600"
                            : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {item.label}

                      {/* EL PUNTICO ENCENDIDO */}
                      {isActive && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-red-600 shadow-sm animate-pulse"></div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* FOOTER USER */}
      <div className="p-6 border-t border-slate-200/50">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-800 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-slate-900 hover:scale-[1.02] transition-all duration-300"
        >
          <LogOut size={18} />
          <span>Ir a la Tienda</span>
        </Link>
      </div>
    </aside>
  );
}
