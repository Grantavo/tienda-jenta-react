import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config"; // Asegúrate de que esta ruta sea correcta

export default function RequireAuth({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchar el estado de autenticación en tiempo real
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Mientras Firebase verifica, mostramos un spinner de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  // Si no hay usuario, mandamos al Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario, mostramos el contenido protegido (El Admin)
  return children;
}
