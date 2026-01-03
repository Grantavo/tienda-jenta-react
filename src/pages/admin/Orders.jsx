import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Printer,
  MessageCircle,
  DollarSign,
  CheckCircle,
  X,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Filter,
  AlertTriangle,
} from "lucide-react";

export default function Orders() {
  // --- 1. ESTADOS Y DATOS ---
  const [orders, setOrders] = useState(() =>
    JSON.parse(localStorage.getItem("shopOrders") || "[]")
  );
  const [products, setProducts] = useState(() =>
    JSON.parse(localStorage.getItem("shopProducts") || "[]")
  );

  // Configuración de la Tirilla
  const [ticketConfig, setTicketConfig] = useState(() =>
    JSON.parse(
      localStorage.getItem("shopTicketConfig") ||
        '{"name":"MI TIENDA","nit":"123456789","footer":"¡Gracias por su compra!"}'
    )
  );

  // Modales y Filtros
  const [showPosModal, setShowPosModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Estado para filtrar la lista verticalmente (Pestañas)
  const [activeTab, setActiveTab] = useState("Pendiente");

  // Estados del POS
  const [posCart, setPosCart] = useState([]);
  const [posSearch, setPosSearch] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  // --- 2. PERSISTENCIA ---
  useEffect(() => {
    localStorage.setItem("shopOrders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("shopProducts", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("shopTicketConfig", JSON.stringify(ticketConfig));
  }, [ticketConfig]);

  // --- 3. LÓGICA CONSECUTIVA DE ID (INICIA EN 1001) ---
  const generateOrderId = () => {
    // Si no hay pedidos, arrancamos con el 1001 (Estándar Pro)
    if (orders.length === 0) return 1001;

    // Extraemos solo los números de los pedidos existentes para evitar errores con formatos viejos
    const ids = orders
      .map((o) => {
        const cleanId = String(o.id).replace(/\D/g, "");
        return parseInt(cleanId);
      })
      .filter((n) => !isNaN(n));

    if (ids.length === 0) return 1001;

    // Buscamos el mayor y sumamos 1
    return Math.max(...ids) + 1;
  };

  // --- 4. LÓGICA DE STOCK Y PAGOS ---
  const togglePayment = (orderId) => {
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return;

    const order = orders[orderIndex];
    const newPaymentStatus = !order.isPaid;

    const newProducts = [...products];
    let stockError = false;

    if (newPaymentStatus === true) {
      order.items.forEach((item) => {
        const prodIndex = newProducts.findIndex((p) => p.id === item.id);
        if (prodIndex !== -1) {
          if (newProducts[prodIndex].stock >= item.qty) {
            newProducts[prodIndex].stock -= item.qty;
          } else {
            stockError = true;
            alert(`¡Error! Sin stock suficiente de ${item.title}.`);
          }
        }
      });
    } else {
      order.items.forEach((item) => {
        const prodIndex = newProducts.findIndex((p) => p.id === item.id);
        if (prodIndex !== -1) newProducts[prodIndex].stock += item.qty;
      });
    }

    if (!stockError) {
      setProducts(newProducts);
      const newOrders = [...orders];
      newOrders[orderIndex].isPaid = newPaymentStatus;
      setOrders(newOrders);
    }
  };

  // --- 5. LÓGICA DE FLUJO (VERTICAL) ---
  const moveOrder = (orderId, direction) => {
    const states = ["Pendiente", "Preparación", "Terminado", "Entregado"];
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const currentIndex = states.indexOf(o.status);
        if (currentIndex === -1) return o;

        let nextIndex =
          direction === "next" ? currentIndex + 1 : currentIndex - 1;
        if (nextIndex < 0) nextIndex = 0;
        if (nextIndex >= states.length) nextIndex = states.length - 1;

        return { ...o, status: states[nextIndex] };
      })
    );
  };

  const cancelOrder = (orderId) => {
    if (window.confirm("¿Anular pedido?")) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "Anulado" } : o))
      );
    }
  };

  const deleteOrder = (orderId) => {
    if (window.confirm("¿Eliminar definitivamente del historial?")) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  };

  // --- 6. POS (CREAR PEDIDO) ---
  const addToPosCart = (product) => {
    setPosCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromPosCart = (id) => {
    setPosCart((prev) => prev.filter((p) => p.id !== id));
  };

  const createOrder = () => {
    if (posCart.length === 0) return alert("El carrito está vacío");
    if (!clientName) return alert("Escribe el nombre del cliente");

    const total = posCart.reduce((acc, item) => acc + item.price * item.qty, 0);

    const newOrder = {
      id: generateOrderId(), // <--- AHORA USA EL NUEVO GENERADOR (1001...)
      date: new Date().toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      client: clientName,
      phone: clientPhone || "573000000000",
      items: posCart,
      total: total,
      status: "Pendiente",
      isPaid: false,
    };

    setOrders([newOrder, ...orders]);
    setPosCart([]);
    setClientName("");
    setClientPhone("");
    setPosSearch("");
    setShowPosModal(false);
  };

  // --- 7. IMPRESIÓN Y NOTIFICACIÓN ---
  const handlePrint = (order) => {
    const printWindow = window.open("", "", "width=300,height=600");
    const itemsHtml = order.items
      .map(
        (item) => `
        <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size: 12px;">
            <span>${item.qty} x ${item.title.substring(0, 15)}</span>
            <span>$${(item.price * item.qty).toLocaleString()}</span>
        </div>
    `
      )
      .join("");

    printWindow.document.write(`
        <html>
        <head>
            <style>
                body { font-family: 'Courier New', monospace; width: 58mm; margin: 0; padding: 10px; color: black; }
                .center { text-align: center; }
                .line { border-bottom: 1px dashed #000; margin: 10px 0; }
                h2, p { margin: 5px 0; }
            </style>
        </head>
        <body>
            <div class="center">
                <h2>${ticketConfig.name}</h2>
                <p>NIT: ${ticketConfig.nit}</p>
                <p>Pedido: #${order.id}</p>
                <p>${order.date}</p>
            </div>
            <div class="line"></div>
            <p><strong>Cliente:</strong> ${order.client}</p>
            <div class="line"></div>
            ${itemsHtml}
            <div class="line"></div>
            <div style="display:flex; justify-content:space-between; font-weight:bold;">
                <span>TOTAL:</span>
                <span>$${order.total.toLocaleString()}</span>
            </div>
            <div class="line"></div>
            <div class="center"><p>${ticketConfig.footer}</p></div>
            <script>window.print(); window.close();</script>
        </body>
        </html>
    `);
    printWindow.document.close();
  };

  const handleNotify = (order) => {
    const msg = `Hola ${order.client}, tu pedido *#${
      order.id
    }* está: *${order.status.toUpperCase()}*. Total: $${order.total.toLocaleString()}.`;
    window.open(
      `https://wa.me/${order.phone}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  // --- UTILIDAD: RESETEAR BASE DE DATOS (PARA LIMPIAR IDs VIEJOS) ---
  const handleResetDatabase = () => {
    if (
      window.confirm(
        "⚠️ ¿ESTÁS SEGURO?\n\nEsto borrará TODOS los pedidos actuales para reiniciar el contador a #1001.\n\nEsta acción no se puede deshacer."
      )
    ) {
      setOrders([]);
      localStorage.removeItem("shopOrders");
      window.location.reload();
    }
  };

  // --- RENDERIZADO ---
  const tabs = [
    "Pendiente",
    "Preparación",
    "Terminado",
    "Entregado",
    "Anulado",
    "Todos",
  ];

  const filteredOrders =
    activeTab === "Todos"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Control de Pedidos
          </h1>
          <p className="text-sm text-slate-500">Gestión de flujo operativo</p>
        </div>
        <div className="flex gap-2">
          {/* BOTÓN RESET DE EMERGENCIA */}
          <button
            onClick={handleResetDatabase}
            className="bg-red-50 text-red-600 px-3 py-2 rounded-lg font-bold hover:bg-red-100 transition flex items-center gap-1 border border-red-100"
            title="Borrar todo y reiniciar contador"
          >
            <AlertTriangle size={16} />{" "}
            <span className="hidden md:inline">Reset</span>
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-bold hover:bg-slate-200"
          >
            <Printer size={18} />
          </button>
          <button
            onClick={() => setShowPosModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20"
          >
            <Plus size={18} /> Nuevo Pedido
          </button>
        </div>
      </div>

      {/* --- VISTA VERTICAL: PESTAÑAS DE FILTRO --- */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab
                ? "bg-slate-800 text-white shadow-md"
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab}
            <span
              className={`ml-2 text-xs py-0.5 px-1.5 rounded-full ${
                activeTab === tab
                  ? "bg-slate-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {
                orders.filter((o) =>
                  tab === "Todos" ? true : o.status === tab
                ).length
              }
            </span>
          </button>
        ))}
      </div>

      {/* --- LISTA VERTICAL DE TARJETAS --- */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Filter className="mx-auto mb-2 opacity-50" size={32} />
            <p>
              No hay pedidos en estado: <strong>{activeTab}</strong>
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-4 items-center animate-in slide-in-from-bottom-2"
            >
              {/* 1. INFO PRINCIPAL (Izquierda) */}
              <div className="flex-1 w-full md:w-auto">
                <div className="flex items-center gap-3 mb-1">
                  <span className="bg-slate-100 text-slate-700 font-black px-3 py-1 rounded-lg text-sm">
                    #{order.id}
                  </span>
                  <h3 className="font-bold text-slate-800">{order.client}</h3>
                  {order.status === "Anulado" && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">
                      ANULADO
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 flex gap-2">
                  <span>{order.date}</span>
                  <span>•</span>
                  <span className="text-slate-500 font-medium truncate max-w-[200px]">
                    {order.items.map((i) => `${i.qty} ${i.title}`).join(", ")}
                  </span>
                </p>
              </div>

              {/* 2. ESTADO Y PAGO (Centro) */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                <div className="text-right mr-4">
                  <span className="block font-black text-lg text-slate-800">
                    ${order.total.toLocaleString()}
                  </span>
                  <button
                    onClick={() => togglePayment(order.id)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                      order.isPaid
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                    }`}
                  >
                    {order.isPaid ? "PAGADO" : "PENDIENTE PAGO"}
                  </button>
                </div>
              </div>

              {/* 3. ACCIONES (Derecha) */}
              <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 justify-end">
                {/* Botones de flujo (Anterior / Siguiente) */}
                {order.status !== "Anulado" && (
                  <div className="flex bg-slate-100 rounded-lg p-1 mr-2">
                    <button
                      disabled={order.status === "Pendiente"}
                      onClick={() => moveOrder(order.id, "prev")}
                      className="p-1.5 hover:bg-white rounded-md text-slate-500 disabled:opacity-30 transition"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <span className="px-2 flex items-center text-xs font-bold text-slate-600 min-w-[80px] justify-center">
                      {order.status}
                    </span>
                    <button
                      disabled={order.status === "Entregado"}
                      onClick={() => moveOrder(order.id, "next")}
                      className="p-1.5 hover:bg-white rounded-md text-blue-600 disabled:opacity-30 transition"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {/* Herramientas */}
                <button
                  onClick={() => handlePrint(order)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                  title="Imprimir Ticket"
                >
                  <Printer size={18} />
                </button>
                <button
                  onClick={() => handleNotify(order)}
                  className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                  title="Notificar por WhatsApp"
                >
                  <MessageCircle size={18} />
                </button>

                {/* Borrar solo si está anulado, entregado o pendiente */}
                {(order.status === "Anulado" ||
                  order.status === "Entregado" ||
                  order.status === "Pendiente") && (
                  <button
                    onClick={() =>
                      order.status === "Pendiente"
                        ? cancelOrder(order.id)
                        : deleteOrder(order.id)
                    }
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Eliminar/Anular"
                  >
                    {order.status === "Pendiente" ? (
                      <X size={18} />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- MODAL 1: POS --- */}
      {showPosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl flex overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            {/* Columna Izquierda: Productos */}
            <div className="w-2/3 bg-slate-50 p-6 flex flex-col border-r border-slate-200">
              <div className="relative mb-6">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                  value={posSearch}
                  onChange={(e) => setPosSearch(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1 content-start">
                {products
                  .filter((p) =>
                    p.title.toLowerCase().includes(posSearch.toLowerCase())
                  )
                  .map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToPosCart(product)}
                      disabled={product.stock <= 0}
                      className={`p-4 rounded-xl border text-left transition ${
                        product.stock > 0
                          ? "bg-white border-slate-200 hover:border-blue-500 hover:shadow-md"
                          : "bg-slate-100 border-slate-100 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <h4 className="font-bold text-slate-700 text-sm line-clamp-2">
                        {product.title}
                      </h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-blue-600">
                          ${product.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] bg-slate-100 px-2 rounded text-slate-500">
                          Stock: {product.stock}
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Columna Derecha: Resumen */}
            <div className="w-1/3 bg-white p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Nuevo Pedido</h2>
                <button onClick={() => setShowPosModal(false)}>
                  <X className="text-slate-400 hover:text-red-500" />
                </button>
              </div>
              <div className="space-y-3 mb-6">
                <input
                  type="text"
                  placeholder="Nombre Cliente (*)"
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Teléfono"
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </div>
              <div className="flex-1 overflow-y-auto mb-4 border-t border-b border-slate-100 py-2 custom-scrollbar">
                {posCart.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-10">
                    Carrito vacío
                  </p>
                ) : (
                  posCart.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center mb-3 text-sm"
                    >
                      <div>
                        <p className="font-bold text-slate-700">
                          {item.title.substring(0, 15)}...
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.qty} x ${item.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          ${(item.price * item.qty).toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeFromPosCart(item.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-auto">
                <div className="flex justify-between items-center mb-4 text-xl font-black text-slate-800">
                  <span>Total:</span>
                  <span>
                    $
                    {posCart
                      .reduce((acc, i) => acc + i.price * i.qty, 0)
                      .toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={createOrder}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  Crear Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: CONFIGURACIÓN --- */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Printer /> Configurar Tirilla
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                className="w-full p-2 border border-slate-200 rounded-lg"
                value={ticketConfig.name}
                onChange={(e) =>
                  setTicketConfig({ ...ticketConfig, name: e.target.value })
                }
                placeholder="Nombre Empresa"
              />
              <input
                type="text"
                className="w-full p-2 border border-slate-200 rounded-lg"
                value={ticketConfig.nit}
                onChange={(e) =>
                  setTicketConfig({ ...ticketConfig, nit: e.target.value })
                }
                placeholder="NIT"
              />
              <textarea
                className="w-full p-2 border border-slate-200 rounded-lg"
                rows="3"
                value={ticketConfig.footer}
                onChange={(e) =>
                  setTicketConfig({ ...ticketConfig, footer: e.target.value })
                }
                placeholder="Pie de página"
              ></textarea>
              <button
                onClick={() => setShowConfigModal(false)}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 mt-4"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}</style>
    </div>
  );
}
