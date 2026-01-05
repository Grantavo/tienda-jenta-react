import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ChevronRight, AlertCircle } from "lucide-react";

// IMPORTAR FIREBASE
import { db } from "../../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // --- NUEVO: SI YA ESTOY LOGUEADO, NO ME DEJES VER EL LOGIN ---
  useEffect(() => {
    const activeSession = localStorage.getItem("shopUser");
    if (activeSession) {
      // Si ya hay usuario, redirigir inmediatamente al admin
      // replace: true evita que el usuario pueda volver atrás con el botón del navegador
      navigate("/admin", { replace: true });
    }
  }, [navigate]);
  // ------------------------------------------------------------

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. BUSCAR USUARIO
      const q = query(
        collection(db, "users"),
        where("email", "==", formData.email)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("El usuario no existe.");
        setLoading(false);
        return;
      }

      // 2. VERIFICAR CONTRASEÑA
      const userDoc = querySnapshot.docs[0];
      const userData = { id: userDoc.id, ...userDoc.data() };

      if (userData.password !== formData.password) {
        setError("La contraseña es incorrecta.");
        setLoading(false);
        return;
      }

      // 3. GUARDAR SESIÓN
      localStorage.setItem("shopUser", JSON.stringify(userData));

      // 4. REDIRIGIR
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Error de conexión con la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        {/* HEADER */}
        <div className="bg-slate-900 p-8 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Bienvenido
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Acceso exclusivo para personal autorizado
          </p>
        </div>

        {/* FORMULARIO */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2 border border-red-100 animate-in slide-in-from-top-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Correo Corporativo
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700"
                  placeholder="ejemplo@empresa.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Validando..." : "Ingresar al Sistema"}
              {!loading && <ChevronRight size={20} />}
            </button>
          </form>
        </div>

        <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t border-slate-100">
          Plataforma de Gestión v2.0
        </div>
      </div>
    </div>
  );
}
