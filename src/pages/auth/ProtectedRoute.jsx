import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ module }) {
  // 1. Recuperar sesión y roles
  const userStr = sessionStorage.getItem("shopUser");
  const rolesStr = localStorage.getItem("shopRoles");

  // 2. Si no hay sesión, al login
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    const allRoles = JSON.parse(rolesStr || "[]");

    // 3. Validación de integridad
    if (!user.id || !user.roleId) {
      throw new Error("Sesión incompleta");
    }

    // 4. LÓGICA DE PERMISOS
    // Buscamos el rol del usuario en la lista de roles
    const userRole = allRoles.find((r) => r.id === user.roleId);

    // Si el rol es "isSystem" (Super Admin), siempre tiene permiso (pasa directo)
    if (userRole?.isSystem) {
      return <Outlet />;
    }

    // 5. VALIDACIÓN POR MÓDULO (Si se requiere un módulo específico)
    if (module) {
      const hasPermission = userRole?.permissions?.includes(module);

      if (!hasPermission) {
        console.warn(`Acceso denegado al módulo: ${module}`);
        // Si no tiene permiso, lo mandamos al Dashboard de admin (que es la ruta base)
        return <Navigate to="/admin" replace />;
      }
    }

    // Todo OK
    return <Outlet />;
  } catch (error) {
    console.error("Error en validación de seguridad:", error);
    sessionStorage.removeItem("shopUser");
    return <Navigate to="/login" replace />;
  }
}
