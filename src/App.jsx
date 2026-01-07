import { BrowserRouter, Routes, Route } from "react-router-dom";
// 1. IMPORTAR EL COMPONENTE DE NOTIFICACIONES
import { Toaster } from "sonner";

// Layouts
import ShopLayout from "./layouts/ShopLayout";
import AdminLayout from "./layouts/AdminLayout";

// Guardián de Seguridad (Protección de Rutas)
import ProtectedRoute from "./pages/auth/ProtectedRoute";

// Páginas de Autenticación
import Login from "./pages/auth/Login";

// Páginas Tienda (Públicas)
import Home from "./pages/Home";
import CategoryPage from "./pages/shop/CategoryPage";
import ProductDetail from "./pages/shop/ProductDetail";
import ShopProducts from "./pages/shop/Products";

// Páginas Admin (Privadas)
import Dashboard from "./pages/admin/Dashboard";
import ShopSettings from "./pages/admin/ShopSettings";
import Categories from "./pages/admin/Categories";
import Products from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import Banners from "./pages/admin/Banners";
import Clients from "./pages/admin/Clients";
import Users from "./pages/admin/Users";
import Marketing from "./pages/admin/Marketing";
import Payments from "./pages/admin/Payments";
import Migration from "./pages/admin/Migration";

// Contexto Global
import { CartProvider } from "./context/CartContext";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* RUTA LOGIN (Pública) */}
          <Route path="/login" element={<Login />} />

          {/* TIENDA (Pública) */}
          <Route path="/" element={<ShopLayout />}>
            <Route index element={<Home />} />
            <Route path="categoria/:id" element={<CategoryPage />} />
            <Route path="producto/:id" element={<ProductDetail />} />
            <Route path="productos" element={<ShopProducts />} />
          </Route>

          {/* --- ZONA BLINDADA (ADMIN) --- */}
          {/* ProtectedRoute verifica la sesión antes de renderizar AdminLayout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />

              {/* Módulos de Gestión */}
              <Route path="pedidos" element={<Orders />} />
              <Route path="productos" element={<Products />} />
              <Route path="categorias" element={<Categories />} />
              <Route path="clientes" element={<Clients />} />
              <Route path="usuarios" element={<Users />} />

              {/* Módulos de Tienda y Marketing */}
              <Route path="banners" element={<Banners />} />
              <Route path="marketing" element={<Marketing />} />
              <Route path="pagos" element={<Payments />} />
              <Route path="ajustes" element={<ShopSettings />} />

              {/* Herramientas */}
              <Route path="migrar" element={<Migration />} />

              <Route
                path="envios"
                element={<h1 className="p-8">Envíos (Próximamente)</h1>}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>

      {/* 2. COMPONENTE GLOBAL DE NOTIFICACIONES (FUERA DEL ROUTER) */}
      <Toaster position="top-center" richColors />
    </CartProvider>
  );
}
