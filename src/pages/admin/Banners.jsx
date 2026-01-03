import React, { useState, useEffect } from "react";
import { Plus, Trash2, Image as ImageIcon, Layout, Type } from "lucide-react";

export default function Banners() {
  // --- 1. ESTADO DE BANNERS (CARRUSEL) ---
  // Guardamos esto en 'shopBanners' para que el Dashboard lo pueda contar
  const [banners, setBanners] = useState(() => {
    const saved = localStorage.getItem("shopBanners");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            title: "LA MEJOR TECNOLOGÍA",
            subtitle: "Descubre nuestra nueva colección.",
            btnText: "Ver Ofertas",
            image: null,
            active: true,
          },
        ];
  });

  // --- 2. ESTADO DE TOPBAR (BARRA SUPERIOR) ---
  // Esto lo dejamos aparte en 'shopDesign' porque no afecta al contador del Dashboard
  const [topBar, setTopBar] = useState(() => {
    const saved = localStorage.getItem("shopDesign");
    const parsed = saved ? JSON.parse(saved) : {};
    return (
      parsed.topBar || {
        text: "🎉 ¡Envío GRATIS en compras superiores a $200.000!",
        bgColor: "#0f172a",
        textColor: "#ffffff",
        isActive: true,
      }
    );
  });

  // --- 3. PERSISTENCIA ---
  useEffect(() => {
    localStorage.setItem("shopBanners", JSON.stringify(banners));
    // Disparamos evento para que el Dashboard se actualice al instante
    window.dispatchEvent(new Event("storage"));
  }, [banners]);

  useEffect(() => {
    // Guardamos la configuración visual general (TopBar)
    const currentDesign = JSON.parse(
      localStorage.getItem("shopDesign") || "{}"
    );
    localStorage.setItem(
      "shopDesign",
      JSON.stringify({ ...currentDesign, topBar })
    );
  }, [topBar]);

  // --- 4. FUNCIONES ---

  const handleImageUpload = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBanners((prev) =>
          prev.map((b) => (b.id === id ? { ...b, image: reader.result } : b))
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const addBanner = () => {
    const newId = Date.now();
    setBanners((prev) => [
      ...prev,
      {
        id: newId,
        title: "NUEVA OFERTA",
        subtitle: "Descripción corta...",
        btnText: "Ver más",
        image: null,
        active: true,
      },
    ]);
  };

  const deleteBanner = (id) => {
    if (banners.length === 1)
      return alert("Debes tener al menos un banner activo.");
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  const updateBannerText = (id, field, value) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  // --- RENDER ---
  return (
    <div className="p-6 max-w-5xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Diseño de la Tienda
        </h1>
        <p className="text-sm text-slate-500">
          Personaliza la apariencia de tu página de inicio.
        </p>
      </div>

      {/* --- SECCIÓN 1: BARRA SUPERIOR (TOP BAR) --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <h2 className="font-bold text-lg text-slate-700 mb-4 flex items-center gap-2">
          <Type size={20} className="text-blue-600" /> Barra de Anuncios
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Mensaje del Anuncio
            </label>
            <input
              type="text"
              value={topBar.text}
              onChange={(e) => setTopBar({ ...topBar, text: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Fondo
              </label>
              <div className="flex items-center gap-2 border border-slate-200 p-2 rounded-xl">
                <input
                  type="color"
                  value={topBar.bgColor}
                  onChange={(e) =>
                    setTopBar({ ...topBar, bgColor: e.target.value })
                  }
                  className="w-8 h-8 rounded cursor-pointer border-none"
                />
                <span className="text-xs text-slate-400">{topBar.bgColor}</span>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Texto
              </label>
              <div className="flex items-center gap-2 border border-slate-200 p-2 rounded-xl">
                <input
                  type="color"
                  value={topBar.textColor}
                  onChange={(e) =>
                    setTopBar({ ...topBar, textColor: e.target.value })
                  }
                  className="w-8 h-8 rounded cursor-pointer border-none"
                />
                <span className="text-xs text-slate-400">
                  {topBar.textColor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview en vivo */}
        <div
          className="mt-4 p-2 rounded-lg text-center text-sm font-bold shadow-sm"
          style={{
            backgroundColor: topBar.bgColor,
            color: topBar.textColor,
          }}
        >
          {topBar.text}
        </div>
      </div>

      {/* --- SECCIÓN 2: CARRUSEL PRINCIPAL --- */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="font-bold text-lg text-slate-700 flex items-center gap-2">
            <Layout size={20} className="text-blue-600" /> Carrusel Principal
          </h2>
          <button
            onClick={addBanner}
            className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-3 py-1 rounded-lg transition"
          >
            <Plus size={16} /> Agregar Slide
          </button>
        </div>

        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 animate-in slide-in-from-bottom-2"
          >
            {/* Lado Izquierdo: Imagen */}
            <div className="w-full md:w-1/3 aspect-video bg-slate-100 rounded-xl relative overflow-hidden group border-2 border-dashed border-slate-300 hover:border-blue-400 transition cursor-pointer">
              {banner.image ? (
                <img
                  src={banner.image}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon size={32} className="mb-2" />
                  <span className="text-xs font-bold">
                    Click para subir (PC)
                  </span>
                </div>
              )}
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
                onChange={(e) => handleImageUpload(banner.id, e)}
              />
            </div>

            {/* Lado Derecho: Textos */}
            <div className="flex-1 space-y-4">
              <div className="flex justify-between">
                <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">
                  Slide #{index + 1}
                </span>
                <button
                  onClick={() => deleteBanner(banner.id)}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  placeholder="Título Grande (Ej: TECNOLOGÍA)"
                  className="w-full p-2 border-b border-slate-200 focus:border-blue-500 outline-none font-bold text-lg"
                  value={banner.title}
                  onChange={(e) =>
                    updateBannerText(banner.id, "title", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Subtítulo (Ej: Nueva colección...)"
                  className="w-full p-2 border-b border-slate-200 focus:border-blue-500 outline-none text-slate-600"
                  value={banner.subtitle}
                  onChange={(e) =>
                    updateBannerText(banner.id, "subtitle", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Texto Botón (Ej: Ver Ofertas)"
                  className="w-full p-2 border-b border-slate-200 focus:border-blue-500 outline-none text-blue-600 font-bold text-sm"
                  value={banner.btnText}
                  onChange={(e) =>
                    updateBannerText(banner.id, "btnText", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
