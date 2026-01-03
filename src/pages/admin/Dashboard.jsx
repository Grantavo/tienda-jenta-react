import React, { useState } from "react";
import { Link } from "react-router-dom"; // Importamos Link para la navegación
import StatCard from "../../components/admin/StatCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  Package,
  Image as ImageIcon,
  List,
  Tag,
  ShoppingBag,
} from "lucide-react";

// --- DATOS FIJOS (Gráficos) ---
const dataSemana = [
  { name: "Lun", ventas: 4000 },
  { name: "Mar", ventas: 3000 },
  { name: "Mie", ventas: 2000 },
  { name: "Jue", ventas: 2780 },
  { name: "Vie", ventas: 1890 },
  { name: "Sab", ventas: 2390 },
  { name: "Dom", ventas: 3490 },
];
const dataAnio = [
  { name: "Ene", ventas: 45000 },
  { name: "Feb", ventas: 32000 },
  { name: "Mar", ventas: 58000 },
  { name: "Abr", ventas: 42000 },
  { name: "May", ventas: 50000 },
  { name: "Jun", ventas: 65000 },
  { name: "Jul", ventas: 38000 },
  { name: "Ago", ventas: 48000 },
  { name: "Sep", ventas: 52000 },
  { name: "Oct", ventas: 61000 },
  { name: "Nov", ventas: 75000 },
  { name: "Dic", ventas: 90000 },
];
const dataHistorico = [
  { name: "2022", ventas: 450000 },
  { name: "2023", ventas: 680000 },
  { name: "2024", ventas: 920000 },
  { name: "2025", ventas: 120000 },
];
const dataProductosTop = [
  { name: "Smartphone X", value: 400 },
  { name: "Laptop Pro", value: 300 },
  { name: "Auriculares", value: 300 },
  { name: "Smartwatch", value: 200 },
];
const COLORS = ["#4285F4", "#DB4437", "#F4B400", "#0F9D58"];

export default function Dashboard() {
  // 1. ESTADO DEL FILTRO
  const [viewMode, setViewMode] = useState("anio");

  // 2. LÓGICA DE GRÁFICOS
  const getChartData = () => {
    switch (viewMode) {
      case "semana":
        return dataSemana;
      case "anio":
        return dataAnio;
      case "historico":
        return dataHistorico;
      default:
        return dataAnio;
    }
  };

  // 3. CARGA DE DATOS (Lazy Init)
  const [realUsers] = useState(() => {
    const saved = localStorage.getItem("shopUsers");
    return saved ? JSON.parse(saved).slice().reverse() : [];
  });

  const [realRoles] = useState(() => {
    const saved = localStorage.getItem("shopRoles");
    return saved ? JSON.parse(saved) : [];
  });

  const [counts] = useState(() => {
    const users = JSON.parse(localStorage.getItem("shopUsers") || "[]");
    const products = JSON.parse(localStorage.getItem("shopProducts") || "[]");
    const categories = JSON.parse(
      localStorage.getItem("shopCategories") || "[]"
    );
    const coupons = JSON.parse(localStorage.getItem("shopCoupons") || "[]");
    const banners = JSON.parse(localStorage.getItem("shopBanners") || "[]");

    // Contamos pedidos activos (No entregados ni anulados)
    const allOrders = JSON.parse(localStorage.getItem("shopOrders") || "[]");
    const activeOrdersCount = allOrders.filter(
      (order) => order.status !== "Entregado" && order.status !== "Anulado"
    ).length;

    return {
      users: users.length,
      products: products.length,
      categories: categories.length,
      banners: banners.length,
      orders: activeOrdersCount,
      coupons: coupons.length,
    };
  });

  return (
    <div className="space-y-6">
      {/* TARJETAS CON ENLACES (LINKED CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Usuarios -> /admin/usuarios */}
        <Link
          to="/admin/usuarios"
          className="block transform transition hover:scale-105 active:scale-95"
        >
          <StatCard
            title="Usuarios"
            count={counts.users}
            icon={<Users size={24} />}
          />
        </Link>

        {/* 2. Productos -> /admin/productos */}
        <Link
          to="/admin/productos"
          className="block transform transition hover:scale-105 active:scale-95"
        >
          <StatCard
            title="Productos"
            count={counts.products}
            icon={<Package size={24} />}
          />
        </Link>

        {/* 3. Banners -> /admin/banners */}
        <Link
          to="/admin/banners"
          className="block transform transition hover:scale-105 active:scale-95"
        >
          <StatCard
            title="Banners"
            count={counts.banners}
            icon={<ImageIcon size={24} />}
          />
        </Link>

        {/* 4. Categorías -> /admin/categorias */}
        <Link
          to="/admin/categorias"
          className="block transform transition hover:scale-105 active:scale-95"
        >
          <StatCard
            title="Categorías"
            count={counts.categories}
            icon={<List size={24} />}
          />
        </Link>

        {/* 5. Promociones -> /admin/marketing */}
        <Link
          to="/admin/marketing"
          className="block transform transition hover:scale-105 active:scale-95"
        >
          <StatCard
            title="Promociones"
            count={counts.coupons}
            icon={<Tag size={24} />}
          />
        </Link>

        {/* 6. Pedidos -> /admin/pedidos */}
        <Link
          to="/admin/pedidos"
          className="block transform transition hover:scale-105 active:scale-95"
        >
          <StatCard
            title="Pedidos en Curso"
            count={counts.orders}
            icon={<ShoppingBag size={24} />}
          />
        </Link>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        {/* Gráfico Izquierdo */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="font-bold text-slate-700 text-lg">
              {viewMode === "semana"
                ? "Rendimiento Semanal"
                : viewMode === "anio"
                ? "Rendimiento Anual"
                : "Crecimiento Histórico"}
            </h3>

            <div className="flex bg-slate-100 p-1 rounded-lg text-sm">
              <button
                onClick={() => setViewMode("semana")}
                className={`px-4 py-1 rounded-md transition-all ${
                  viewMode === "semana"
                    ? "bg-white shadow-sm text-slate-800 font-bold"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode("anio")}
                className={`px-4 py-1 rounded-md transition-all ${
                  viewMode === "anio"
                    ? "bg-white shadow-sm text-slate-800 font-bold"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Año
              </button>
              <button
                onClick={() => setViewMode("historico")}
                className={`px-4 py-1 rounded-md transition-all ${
                  viewMode === "historico"
                    ? "bg-white shadow-sm text-slate-800 font-bold"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Histórico
              </button>
            </div>
          </div>

          <div className="flex-1 w-full animate-in fade-in zoom-in duration-300">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={getChartData()}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorVentas)"
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Derecho */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col relative">
          <h3 className="font-bold text-slate-700 text-lg mb-4">
            Productos Top
          </h3>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataProductosTop}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={105}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataProductosTop.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 pb-8">
              <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
                1,200
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Total Ventas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-700 text-lg">
            Usuarios del sistema registrados
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">ID</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 rounded-r-lg">Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {realUsers.length > 0 ? (
                realUsers.map((user) => {
                  const userRole = realRoles.find((r) => r.id === user.roleId);
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-400 font-mono">
                        #{String(user.id).slice(-4)}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-700">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{user.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded border text-xs font-bold ${
                            userRole?.isSystem
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {userRole ? userRole.name : "Rol Desconocido"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-slate-400 italic"
                  >
                    No hay usuarios registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
