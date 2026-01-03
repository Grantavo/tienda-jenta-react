import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // 1. LEER USUARIOS GUARDADOS
    const users = JSON.parse(localStorage.getItem("shopUsers") || "[]");

    // 2. BUSCAR COINCIDENCIA
    const validUser = users.find(
      (u) => u.email === form.email && u.password === form.password
    );

    if (validUser) {
      // 3. SI EXISTE, GUARDAR "SESIÓN ACTIVA"
      // Guardamos todo el objeto usuario para saber su rol después
      localStorage.setItem("activeSession", JSON.stringify(validUser));

      // Redirigir al Admin
      navigate("/admin");
    } else {
      // 4. SI NO, ERROR
      setError("Credenciales incorrectas. Intenta con admin@genta.com / 123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">
            GENTA<span className="text-blue-600">.ADMIN</span>
          </h1>
          <p className="text-slate-500">Ingresa a tu panel de control</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2 font-bold animate-in slide-in-from-top-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition"
                placeholder="ejemplo@genta.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition"
                placeholder="••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition flex items-center justify-center gap-2 shadow-xl group"
          >
            Ingresar al Sistema{" "}
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          <p>© 2025 Tienda Genta. Acceso restringido.</p>
        </div>
      </div>
    </div>
  );
}
