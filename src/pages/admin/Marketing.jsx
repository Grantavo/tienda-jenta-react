import React, { useState, useEffect } from "react";
import {
  Tag,
  MessageCircle,
  Copy,
  Plus,
  Trash2,
  Percent,
  Send,
  Smartphone,
  CheckCircle,
} from "lucide-react";

// --- ZONA SEGURA (Funciones externas) ---
const generateId = () => Date.now();

export default function Marketing() {
  // --- 1. ESTADOS ---
  const [activeTab, setActiveTab] = useState("coupons"); // 'coupons' o 'whatsapp'

  // Estado Cupones
  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem("shopCoupons");
    return saved
      ? JSON.parse(saved)
      : [
          { id: 1, code: "BIENVENIDA", discount: 10, active: true, uses: 15 },
          { id: 2, code: "VERANO2025", discount: 20, active: false, uses: 42 },
        ];
  });

  const [newCoupon, setNewCoupon] = useState({ code: "", discount: "" });

  // Estado WhatsApp
  const [waMessage, setWaMessage] = useState(
    "¡Hola! 🌟 Vi que tienen ofertas en Tecnología. ¿Me podrían dar más información?"
  );
  const [waPhone, setWaPhone] = useState("");

  const phonePart = waPhone ? `/${waPhone}` : "";
  const generatedLink = `https://wa.me${phonePart}?text=${encodeURIComponent(
    waMessage
  )}`;

  // --- 2. PERSISTENCIA ---
  useEffect(() => {
    localStorage.setItem("shopCoupons", JSON.stringify(coupons));
  }, [coupons]);

  // --- 3. LÓGICA CUPONES ---
  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount) return;

    setCoupons([
      ...coupons,
      {
        id: generateId(),
        code: newCoupon.code, // Ya viene en mayúscula desde el input
        discount: parseInt(newCoupon.discount),
        active: true,
        uses: 0,
      },
    ]);
    setNewCoupon({ code: "", discount: "" });
  };

  const deleteCoupon = (id) => {
    if (window.confirm("¿Borrar cupón?")) {
      setCoupons(coupons.filter((c) => c.id !== id));
    }
  };

  const toggleCoupon = (id) => {
    setCoupons(
      coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  // --- 4. UTILIDADES ---
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("¡Enlace copiado al portapapeles!");
  };

  // --- RENDER ---
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Marketing y Promociones
          </h1>
          <p className="text-sm text-slate-500">
            Herramientas para impulsar tus ventas.
          </p>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab("coupons")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition ${
              activeTab === "coupons"
                ? "bg-blue-100 text-blue-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Tag size={18} /> Cupones
          </button>
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition ${
              activeTab === "whatsapp"
                ? "bg-green-100 text-green-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <MessageCircle size={18} /> WhatsApp Link
          </button>
        </div>
      </div>

      {/* --- SECCIÓN 1: CUPONES --- */}
      {activeTab === "coupons" && (
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4">
          {/* Formulario Crear */}
          <div className="w-full lg:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus
                className="bg-blue-100 text-blue-600 rounded p-1"
                size={24}
              />{" "}
              Crear Nuevo Cupón
            </h3>
            <form onSubmit={handleAddCoupon} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Código del Cupón
                </label>
                <input
                  type="text"
                  placeholder="Ej: GENTA2025"
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 uppercase font-bold tracking-wider"
                  value={newCoupon.code}
                  onChange={(e) =>
                    // --- AQUÍ ESTÁ LA MEJORA ---
                    // Convertimos a mayúsculas y quitamos espacios automáticamente
                    setNewCoupon({
                      ...newCoupon,
                      code: e.target.value.toUpperCase().replace(/\s/g, ""),
                    })
                  }
                  maxLength={15}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Porcentaje de Descuento
                </label>
                <div className="relative">
                  <Percent
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="number"
                    placeholder="Ej: 10"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                    value={newCoupon.discount}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, discount: e.target.value })
                    }
                    min="1"
                    max="100"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
              >
                Guardar Cupón
              </button>
            </form>
          </div>

          {/* Lista de Cupones */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`relative flex bg-white rounded-xl overflow-hidden border transition hover:shadow-md ${
                  coupon.active
                    ? "border-slate-200"
                    : "border-slate-100 opacity-60"
                }`}
              >
                {/* Parte Izquierda */}
                <div
                  className={`w-3 ${
                    coupon.active ? "bg-blue-600" : "bg-slate-300"
                  }`}
                ></div>

                {/* Contenido */}
                <div className="flex-1 p-4 flex justify-between items-center">
                  <div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                        coupon.active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {coupon.active ? "Activo" : "Inactivo"}
                    </span>
                    <h4 className="text-xl font-black text-slate-800 mt-1 tracking-wider">
                      {coupon.code}
                    </h4>
                    <p className="text-sm text-slate-500 font-medium">
                      {coupon.discount}% de Descuento
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 mb-2">
                      {coupon.uses} usos
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleCoupon(coupon.id)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600"
                        title="Pausar/Activar"
                      >
                        {coupon.active ? (
                          <CheckCircle size={18} className="text-green-600" />
                        ) : (
                          <CheckCircle size={18} />
                        )}
                      </button>
                      <button
                        onClick={() => deleteCoupon(coupon.id)}
                        className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-500"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Decoración Ticket */}
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-100 rounded-full"></div>
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-100 rounded-full"></div>
              </div>
            ))}
            {coupons.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                No has creado cupones todavía.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SECCIÓN 2: WHATSAPP BUILDER --- */}
      {activeTab === "whatsapp" && (
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4">
          {/* Constructor */}
          <div className="w-full lg:w-1/2 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <MessageCircle className="text-green-600" /> Configura tu Mensaje
            </h3>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">
                  Mensaje Promocional
                </label>
                <textarea
                  className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:border-green-500 bg-slate-50 text-slate-700 min-h-[120px]"
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  placeholder="Escribe aquí el mensaje que quieres que tus clientes envíen..."
                ></textarea>
                <p className="text-xs text-slate-400 mt-2 text-right">
                  {waMessage.length} caracteres
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">
                  Teléfono destino (Opcional)
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-green-500"
                  placeholder="Ej: 57300..."
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Si lo dejas vacío, el cliente podrá elegir a quién enviarlo.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <p className="text-xs font-bold text-green-800 uppercase mb-2">
                  Tu Enlace Generado:
                </p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={generatedLink}
                    className="flex-1 text-xs bg-white p-2 rounded border border-green-200 text-slate-600 truncate"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedLink)}
                    className="bg-green-600 text-white px-3 rounded font-bold hover:bg-green-700 flex items-center gap-1"
                  >
                    <Copy size={14} /> Copiar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Vista Previa Celular */}
          <div className="w-full lg:w-1/2 flex justify-center items-center bg-slate-50 rounded-2xl border border-slate-200 p-8">
            <div className="w-[300px] h-[550px] bg-white border-8 border-slate-800 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-10"></div>

              {/* Header WhatsApp */}
              <div className="bg-[#075E54] h-20 pt-8 px-4 flex items-center gap-3 text-white">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  Logo
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight">Tu Tienda</p>
                  <p className="text-[10px] opacity-80">En línea</p>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 bg-[#ECE5DD] p-4 flex flex-col justify-end">
                <div className="bg-[#DCF8C6] p-3 rounded-lg rounded-tr-none shadow-sm max-w-[90%] self-end mb-4">
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {waMessage || "..."}
                  </p>
                  <div className="flex justify-end items-center gap-1 mt-1">
                    <span className="text-[9px] text-slate-500">10:45 AM</span>
                    <CheckCircle size={10} className="text-blue-500" />
                  </div>
                </div>
              </div>

              {/* Input Area (Simulado) */}
              <div className="h-14 bg-white px-2 flex items-center gap-2 border-t border-slate-100">
                <div className="flex-1 h-9 bg-white border border-slate-200 rounded-full px-3 text-xs flex items-center text-slate-400">
                  Mensaje...
                </div>
                <div className="w-9 h-9 bg-[#128C7E] rounded-full flex items-center justify-center text-white">
                  <Send size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
