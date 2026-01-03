import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import ShopLayout from "./layouts/ShopLayout";
import AdminLayout from "./layouts/AdminLayout";

// Páginas de Autenticación
import Login from "./pages/auth/Login";

// Páginas Tienda (Públicas)
import Home from "./pages/Home";
import CategoryPage from "./pages/shop/CategoryPage";
import ProductDetail from "./pages/shop/ProductDetail";
import ShopProducts from "./pages/shop/Products"; // <--- 1. NUEVA IMPORTACIÓN (Vista Cliente)

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

// --- GUARDIA DE SEGURIDAD ---
const ProtectedRoute = ({ children }) => {
  const session = localStorage.getItem("activeSession");
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  // --- SEMILLA DE DATOS (Solo si está vacío) ---
  useEffect(() => {
    // 1. Categorías
    const existingCats = localStorage.getItem("shopCategories");
    if (!existingCats || JSON.parse(existingCats).length === 0) {
      const defaultCats = [
        { id: 1, name: "Tecnología", image: null, subcategories: [] },
        { id: 2, name: "Hogar", image: null, subcategories: [] },
        { id: 3, name: "Herramientas", image: null, subcategories: [] },
        { id: 4, name: "Deportes", image: null, subcategories: [] },
      ];
      localStorage.setItem("shopCategories", JSON.stringify(defaultCats));
    }

    // 2. Productos
    const existingProds = localStorage.getItem("shopProducts");
    if (!existingProds || JSON.parse(existingProds).length === 0) {
      const defaultProds = [
        {
          id: 101,
          title: "Minipulidora de 1100 watios",
          price: 250000,
          oldPrice: 300000,
          categoryId: 3,
          stock: 5,
          bestSeller: "si",
          description: "Potente minipulidora...",
          reference: "REF-PULI-01",
          brand: "Einhell",
          items: [],
          images: [
            "https://http2.mlstatic.com/D_NQ_NP_960907-MCO45473797632_042021-O.webp",
            null,
            null,
            null,
          ],
        },
        {
          id: 102,
          title: "Reloj Digital Deportivo",
          price: 85000,
          oldPrice: 120000,
          categoryId: 1,
          stock: 12,
          bestSeller: "no",
          description: "Reloj resistente...",
          reference: "REF-WATCH-02",
          brand: "Genérica",
          items: [],
          images: [
            "https://http2.mlstatic.com/D_NQ_NP_606557-MCO73562473872_122023-O.webp",
            null,
            null,
            null,
          ],
        },
      ];
      localStorage.setItem("shopProducts", JSON.stringify(defaultProds));
    }
  }, []);

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
          {/* 2. AQUÍ CONECTAMOS LA PÁGINA DE PRODUCTOS */}
          <Route path="productos" element={<ShopProducts />} />
        </Route>

        {/* ADMIN (Privada) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
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
          {/* Placeholders */}
          <Route
            path="envios"
            element={<h1 className="p-8">Envíos (Próximamente)</h1>}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
