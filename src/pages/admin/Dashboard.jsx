import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

// 1. IMPORTAR FIREBASE
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";

// --- DATOS FIJOS PARA GRÁFICOS (Visual) ---
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
  const [viewMode, setViewMode] = useState("anio");
  const [loading, setLoading] = useState(true);

  // ESTADOS DE DATOS REALES
  const [realUsers, setRealUsers] = useState([]);
  const [realRoles, setRealRoles] = useState([]);
  const [counts, setCounts] = useState({
    users: 0,
    products: 0,
    categories: 0,
    banners: 0,
    orders: 0,
    coupons: 0,
    totalSales: 0, // Nuevo dato para el gráfico circular
  });

  // 2. EFECTO: CARGAR DATOS DESDE FIREBASE
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Ejecutamos todas las consultas en paralelo para mayor velocidad
        const [
          usersSnap,
          productsSnap,
          catsSnap,
          ordersSnap,
          bannersSnap,
          couponsSnap, // Asumiendo colección 'coupons' para marketing
          rolesSnap,
        ] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "products")),
          getDocs(collection(db, "categories")),
          getDocs(collection(db, "orders")),
          getDocs(collection(db, "banners")),
          getDocs(collection(db, "coupons")),
          getDocs(collection(db, "roles")),
        ]);

        // A. Calcular Conteos
        const activeOrders = ordersSnap.docs.filter((d) => {
          const s = d.data().status;
          return s !== "Entregado" && s !== "Anulado";
        }).length;

        // B. Calcular Total Ventas (Suma real de pedidos)
        let totalSalesCalc = 0;
        ordersSnap.forEach((doc) => {
          totalSalesCalc += Number(doc.data().total) || 0;
        });

        setCounts({
          users: usersSnap.size,
          products: productsSnap.size,
          categories: catsSnap.size,
          banners: bannersSnap.size,
          orders: activeOrders,
          coupons: couponsSnap.size,
          totalSales: totalSalesCalc,
        });

        // C. Datos para la Tabla de Usuarios
        const usersData = usersSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Invertimos para ver los últimos registrados primero
        setRealUsers(usersData.reverse());

        const rolesData = rolesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRealRoles(rolesData);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Helper de precio
  const formatPriceCompact = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TARJETAS CON ENLACES (LINKED CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              {["semana", "anio", "historico"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-1 rounded-md transition-all capitalize ${
                    viewMode === mode
                      ? "bg-white shadow-sm text-slate-800 font-bold"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {mode}
                </button>
              ))}
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

        {/* Gráfico Derecho (Ventas Totales Reales) */}
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
              {/* Aquí mostramos la venta real calculada de Firebase */}
              <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {formatPriceCompact(counts.totalSales)}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Total Ventas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DE USUARIOS (DATOS REALES) */}
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
