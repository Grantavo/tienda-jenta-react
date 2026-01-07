import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import ShopLayout from "./layouts/ShopLayout";
import AdminLayout from "./layouts/AdminLayout";

// Componente de Seguridad
import RequireAuth from "./components/RequireAuth";

// Páginas de Autenticación (RUTA CORREGIDA)
import Login from "./pages/auth/Login"; // <--- Ahora apunta a src/pages/auth/Login

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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* TIENDA (Pública) */}
        <Route path="/" element={<ShopLayout />}>
          <Route index element={<Home />} />
          <Route path="categoria/:id" element={<CategoryPage />} />
          <Route path="producto/:id" element={<ProductDetail />} />
          <Route path="productos" element={<ShopProducts />} />
        </Route>

        {/* ADMIN (Protegida con Firebase Auth) */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
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
      </Routes>
    </BrowserRouter>
  );
}
