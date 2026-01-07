import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ChevronRight, AlertCircle } from "lucide-react";

// USAMOS SOLO LA BASE DE DATOS (FIRESTORE)
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

  // Si ya hay una sesión guardada en el navegador, entrar directo
  useEffect(() => {
    const session = localStorage.getItem("shopUser");
    if (session) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. BUSCAR EL USUARIO EN LA BASE DE DATOS (Colección 'users')
      const q = query(
        collection(db, "users"),
        where("email", "==", formData.email)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("El usuario no existe en la base de datos.");
        setLoading(false);
        return;
      }

      // 2. OBTENER DATOS
      const userDoc = querySnapshot.docs[0];
      const userData = { id: userDoc.id, ...userDoc.data() };

      // 3. COMPARAR CONTRASEÑA (Directamente con lo que guardaste en el Dashboard)
      if (userData.password !== formData.password) {
        setError("Contraseña incorrecta.");
        setLoading(false);
        return;
      }

      // 4. GUARDAR SESIÓN Y ENTRAR
      // Guardamos al usuario en el navegador para que no se salga al recargar
      localStorage.setItem("shopUser", JSON.stringify(userData));

      navigate("/admin", { replace: true });
    } catch (err) {
      console.error("Error:", err);
      setError("Error de conexión. Revisa tu internet.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-8 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Bienvenido
          </h1>
          <p className="text-slate-400 text-sm mt-1">Ingreso administrativo</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Correo
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-medium text-slate-700"
                  placeholder="admin@jenta.com"
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
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-medium text-slate-700"
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
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {loading ? "Verificando..." : "Ingresar"}
              {!loading && <ChevronRight size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
