import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  // 1. Recuperar sesión de sessionStorage (Sesión temporal)
  const userStr = sessionStorage.getItem("shopUser");

  // 2. Si no hay nada guardado, expulsar al login
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);

    // 3. Validación de integridad: ¿El objeto tiene lo mínimo necesario?
    if (!user.id || !user.email) {
      throw new Error("Sesión corrupta");
    }

    // 4. Todo OK: Renderizar el contenido protegido (AdminLayout y sus hijos)
    return <Outlet />;
  } catch (error) {
    console.error("Sesión inválida detectada:", error);

    // Si la data está corrupta, limpiamos y expulsamos
    sessionStorage.removeItem("shopUser");
    return <Navigate to="/login" replace />;
  }
}
