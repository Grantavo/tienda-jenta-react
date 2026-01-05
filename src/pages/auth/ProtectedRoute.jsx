import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  // 1. Buscamos al usuario en la memoria
  // NOTA: Usamos "shopUser" que es la clave que definimos en el Login
  const user = JSON.parse(localStorage.getItem("shopUser") || "null");

  // 2. Si NO hay usuario, patada al Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si SÍ hay usuario, renderiza las rutas hijas (Admin)
  return <Outlet />;
}
