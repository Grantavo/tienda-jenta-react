import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom"; // <--- 1. IMPORTAMOS EL CONTEXTO
import {
  ShoppingCart,
  MessageCircle,
  ChevronLeft,
  CheckCircle,
  Minus,
  Plus,
} from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // <--- 2. RECUPERAMOS LA FUNCIÓN DEL LAYOUT PADRE
  const { addToCart } = useOutletContext();

  // 1. CARGA DE DATOS (Tu lógica original optimizada)

  // A. Producto
  const [product] = useState(() => {
    try {
      const allProducts = JSON.parse(
        localStorage.getItem("shopProducts") || "[]"
      );
      // Usamos '==' para que coincida string con number si es necesario
      return allProducts.find((p) => p.id == id) || null;
    } catch (error) {
      console.error("Error cargando producto:", error);
      return null;
    }
  });

  // B. Teléfono
  const [shopPhone] = useState(() => {
    try {
      const settings = JSON.parse(localStorage.getItem("shopSettings") || "{}");
      return settings.phone
        ? settings.phone.replace(/\D/g, "")
        : "573000000000";
    } catch (error) {
      console.error("Error leyendo teléfono:", error);
      return "573000000000";
    }
  });

  // Estados visuales
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // 2. EFECTOS VISUALES

  // Scroll arriba al entrar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Carrusel Automático
  useEffect(() => {
    if (!product) return;

    // Solo rotar si hay más de 1 imagen válida
    const validImages = product.images.filter((img) => img);
    if (validImages.length <= 1) return;

    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % validImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [product]);

  // --- RENDERIZADO ---

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Producto no encontrado
        </h2>
        <button
          onClick={() => navigate("/")}
          className="text-blue-600 hover:underline"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  // Lógica WhatsApp
  const handleWhatsApp = () => {
    const message = `Hola, me interesa el producto: *${
      product.title
    }* que vi en la web por $${new Intl.NumberFormat("es-CO").format(
      product.price
    )}. ¿Está disponible?`;
    window.open(
      `https://wa.me/${shopPhone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const validImages = product.images.filter((img) => img);

  return (
    <div className="bg-white min-h-screen pb-20 pt-6">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Botón Volver */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-500 hover:text-blue-600 mb-6 transition group"
        >
          <ChevronLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />{" "}
          Volver al catálogo
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* --- IZQUIERDA: GALERÍA --- */}
          <div className="space-y-4">
            {/* Imagen Principal */}
            <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 shadow-sm relative group">
              {validImages[activeImage] ? (
                <img
                  src={validImages[activeImage]}
                  alt={product.title}
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-xl">
                  Sin imagen
                </div>
              )}

              {/* Badge Descuento */}
              {product.oldPrice > product.price && (
                <span className="absolute top-4 right-4 bg-red-600 text-white font-bold px-3 py-1 rounded-full shadow-lg z-10">
                  -
                  {Math.round(
                    ((product.oldPrice - product.price) / product.oldPrice) *
                      100
                  )}
                  %
                </span>
              )}
            </div>

            {/* Miniaturas */}
            {validImages.length > 1 && (
              <div className="flex gap-4 justify-center overflow-x-auto pb-2">
                {validImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 flex-shrink-0 rounded-xl border-2 overflow-hidden transition-all ${
                      activeImage === idx
                        ? "border-blue-600 scale-105 shadow-md"
                        : "border-transparent hover:border-slate-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover"
                      alt={`Vista ${idx}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --- DERECHA: INFO --- */}
          <div className="flex flex-col justify-center">
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">
              {product.brand || "Genérica"}
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">
              {product.title}
            </h1>

            {/* Precios */}
            <div className="flex items-end gap-4 mb-6 bg-slate-50 p-4 rounded-xl w-fit">
              <span className="text-4xl font-black text-blue-600">
                {new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  maximumFractionDigits: 0,
                }).format(product.price)}
              </span>
              {product.oldPrice > product.price && (
                <span className="text-xl text-slate-400 line-through mb-1 font-medium">
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    maximumFractionDigits: 0,
                  }).format(product.oldPrice)}
                </span>
              )}
            </div>

            <div className="h-px bg-slate-100 w-full mb-6"></div>

            {/* Detalles Técnicos */}
            <div className="space-y-3 mb-8 text-sm text-slate-600">
              <div className="flex justify-between max-w-xs border-b border-slate-50 pb-2">
                <span className="font-bold text-slate-800">Referencia:</span>
                <span>{product.reference || "N/A"}</span>
              </div>
              <div className="flex justify-between max-w-xs border-b border-slate-50 pb-2">
                <span className="font-bold text-slate-800">
                  Disponibilidad:
                </span>
                <span className="text-green-600 font-bold flex items-center gap-1">
                  <CheckCircle size={14} /> {product.stock} unidades
                </span>
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-slate-50 p-4 rounded-xl mb-8 border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-2 text-sm uppercase">
                Sobre este producto:
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {product.description ||
                  "Producto de alta calidad garantizada. Ideal para uso profesional o doméstico. Envíos seguros a todo el país."}
              </p>
            </div>

            {/* Selector Cantidad */}
            <div className="flex items-center gap-4 mb-8">
              <span className="font-bold text-slate-800">Cantidad:</span>
              <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 hover:bg-slate-100 text-slate-600 transition"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 font-bold text-slate-800 w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  className="p-3 hover:bg-slate-100 text-slate-600 transition"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="space-y-3">
              {/* <--- 3. AQUÍ CONECTAMOS EL BOTÓN AL CARRITO */}
              <button
                onClick={() => addToCart(product)}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <ShoppingCart size={20} /> Agregar al Carrito
              </button>

              <button
                onClick={handleWhatsApp}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-lg shadow-green-600/20 transform hover:-translate-y-1"
              >
                <MessageCircle size={20} /> Pedir por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
