import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Printer,
  MessageCircle,
  AlertTriangle,
  X,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Filter,
  Edit,
  Minus,
} from "lucide-react";

// 1. IMPORTAR FIREBASE (Asegúrate de que la ruta sea correcta)
import { db } from "../../firebase/config";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  getDoc, // Ahora sí lo usamos para la configuración de la tirilla
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";

export default function Orders() {
  // --- 1. ESTADOS ---
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configuración de la Tirilla (Estado inicial vacío, cargará de la nube)
  const [ticketConfig, setTicketConfig] = useState({
    name: "MI TIENDA",
    nit: "123456789",
    footer: "¡Gracias por su compra!",
  });

  // Modales
  const [showPosModal, setShowPosModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Pendiente");

  // Estados del POS (Carrito)
  const [posCart, setPosCart] = useState([]);
  const [posSearch, setPosSearch] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  // Estado para Edición
  const [editingId, setEditingId] = useState(null);

  // --- 2. CARGAR DATOS (Pedidos, Productos y Configuración) ---
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // A. Cargar Pedidos
        const ordersSnap = await getDocs(collection(db, "orders"));
        const ordersData = ordersSnap.docs.map((d) => ({
          ...d.data(),
          id: parseInt(d.id) || d.id,
        }));
        ordersData.sort((a, b) => b.id - a.id); // Ordenar por ID (más nuevo primero)
        setOrders(ordersData);

        // B. Cargar Productos
        const productsSnap = await getDocs(collection(db, "products"));
        const productsData = productsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setProducts(productsData);

        // C. Cargar Configuración de Tirilla (Desde 'settings/ticket')
        const ticketSnap = await getDoc(doc(db, "settings", "ticket"));
        if (ticketSnap.exists()) {
          setTicketConfig(ticketSnap.data());
        }
      } catch (error) {
        console.error("Error general cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // --- 3. LÓGICA DE ID ---
  const generateOrderId = () => {
    if (orders.length === 0) return 1001;
    const ids = orders
      .map((o) => {
        const cleanId = String(o.id).replace(/\D/g, "");
        return parseInt(cleanId);
      })
      .filter((n) => !isNaN(n));

    if (ids.length === 0) return 1001;
    return Math.max(...ids) + 1;
  };

  // --- 4. GESTIÓN DE STOCK Y PAGOS ---
  const togglePayment = async (orderId) => {
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return;

    const order = orders[orderIndex];
    const newPaymentStatus = !order.isPaid;
    let stockError = false;

    const batch = writeBatch(db);
    const orderRef = doc(db, "orders", String(orderId));
    const updatedProducts = [...products];

    // Lógica: Si paga, resta stock. Si despaga, devuelve stock.
    if (newPaymentStatus === true) {
      for (const item of order.items) {
        const prodIndex = updatedProducts.findIndex((p) => p.id === item.id);
        if (prodIndex !== -1) {
          if (updatedProducts[prodIndex].stock >= item.qty) {
            updatedProducts[prodIndex].stock -= item.qty;
            const prodRef = doc(db, "products", item.id);
            batch.update(prodRef, { stock: updatedProducts[prodIndex].stock });
          } else {
            stockError = true;
            alert(`¡Error! Sin stock suficiente de ${item.title}.`);
            break;
          }
        }
      }
    } else {
      for (const item of order.items) {
        const prodIndex = updatedProducts.findIndex((p) => p.id === item.id);
        if (prodIndex !== -1) {
          updatedProducts[prodIndex].stock += item.qty;
          const prodRef = doc(db, "products", item.id);
          batch.update(prodRef, { stock: updatedProducts[prodIndex].stock });
        }
      }
    }

    if (!stockError) {
      try {
        batch.update(orderRef, { isPaid: newPaymentStatus });
        await batch.commit();

        // Actualizar UI
        setProducts(updatedProducts);
        const newOrders = [...orders];
        newOrders[orderIndex].isPaid = newPaymentStatus;
        setOrders(newOrders);
      } catch (error) {
        console.error("Error en base de datos:", error);
        alert("Error de conexión al actualizar el pago.");
      }
    }
  };

  // --- 5. GESTIÓN DE ESTADOS (FLUJO) ---
  const moveOrder = async (orderId, direction) => {
    const states = ["Pendiente", "Preparación", "Terminado", "Entregado"];
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const currentIndex = states.indexOf(order.status);
    let nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= states.length) nextIndex = states.length - 1;

    const newStatus = states[nextIndex];

    try {
      await updateDoc(doc(db, "orders", String(orderId)), {
        status: newStatus,
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (error) {
      console.error("Error al mover estado:", error);
    }
  };

  const cancelOrder = async (orderId) => {
    if (window.confirm("¿Anular pedido?")) {
      try {
        await updateDoc(doc(db, "orders", String(orderId)), {
          status: "Anulado",
        });
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "Anulado" } : o))
        );
      } catch (error) {
        console.error("Error al anular:", error);
      }
    }
  };

  const deleteOrder = async (orderId) => {
    if (window.confirm("¿Eliminar definitivamente?")) {
      try {
        await deleteDoc(doc(db, "orders", String(orderId)));
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  // --- 6. FUNCIONES DEL POS (CARRITO) ---

  // Abrir POS para crear
  const openNewOrder = () => {
    setEditingId(null);
    setPosCart([]);
    setClientName("");
    setClientPhone("");
    setShowPosModal(true);
  };

  // Abrir POS para editar
  const openEditOrder = (order) => {
    setEditingId(order.id);
    setPosCart(JSON.parse(JSON.stringify(order.items))); // Clon profundo
    setClientName(order.client);
    setClientPhone(order.phone);
    setShowPosModal(true);
  };

  const addToPosCart = (product) => {
    setPosCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        // Validación simple de stock al agregar
        if (existing.qty + 1 > product.stock) {
          alert("No hay más stock disponible");
          return prev;
        }
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // Función nueva para controlar cantidad (+/-)
  const updateQty = (id, delta) => {
    setPosCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          if (newQty < 1) return item; // Mínimo 1

          // Buscar producto original para validar stock
          const originalProd = products.find((p) => p.id === id);
          if (originalProd && newQty > originalProd.stock) {
            alert("Stock insuficiente");
            return item;
          }
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const removeFromPosCart = (id) => {
    setPosCart((prev) => prev.filter((p) => p.id !== id));
  };

  // --- 7. GUARDAR PEDIDO (CREAR O ACTUALIZAR) ---
  const handleSaveOrder = async () => {
    if (posCart.length === 0) return alert("El carrito está vacío");
    if (!clientName) return alert("Escribe el nombre del cliente");

    const total = posCart.reduce((acc, item) => acc + item.price * item.qty, 0);

    try {
      if (editingId) {
        // --- MODO EDICIÓN ---
        const orderRef = doc(db, "orders", String(editingId));

        await updateDoc(orderRef, {
          client: clientName,
          phone: clientPhone || "573000000000",
          items: posCart,
          total: total,
        });

        // Actualizar local
        setOrders((prev) =>
          prev.map((o) =>
            o.id === editingId
              ? {
                  ...o,
                  client: clientName,
                  phone: clientPhone,
                  items: posCart,
                  total: total,
                }
              : o
          )
        );
        alert("Pedido actualizado correctamente ✅");
      } else {
        // --- MODO CREACIÓN ---
        const newId = generateOrderId();
        const newOrder = {
          id: newId,
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
          createdAt: new Date(),
        };

        // Guardamos con setDoc usando el ID como nombre del documento
        await setDoc(doc(db, "orders", String(newId)), newOrder);

        setOrders([newOrder, ...orders]);
        alert("Pedido creado exitosamente 🚀");
      }

      // Limpiar
      setShowPosModal(false);
      setPosCart([]);
      setClientName("");
      setClientPhone("");
      setEditingId(null);
    } catch (error) {
      console.error("Error guardando pedido:", error);
      alert("Error al guardar en la nube. Revisa tu conexión.");
    }
  };

  // --- 8. GUARDAR CONFIGURACIÓN DE TIRILLA ---
  const handleSaveConfig = async () => {
    try {
      await setDoc(doc(db, "settings", "ticket"), ticketConfig);
      alert("Configuración de tirilla guardada en la nube ☁️");
      setShowConfigModal(false);
    } catch (error) {
      console.error("Error guardando config:", error);
      alert("Error al guardar configuración");
    }
  };

  // --- 9. UTILIDADES (Impresión y WhatsApp) ---
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
                <span>$${Number(order.total).toLocaleString()}</span>
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
    }* está: *${order.status.toUpperCase()}*. Total: $${Number(
      order.total
    ).toLocaleString()}.`;
    window.open(
      `https://wa.me/${order.phone}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  const handleResetDatabase = async () => {
    if (
      window.confirm(
        "⚠️ ¿BORRAR TODOS LOS PEDIDOS DE LA NUBE?\n\nEsta acción no se puede deshacer."
      )
    ) {
      try {
        const batch = writeBatch(db);
        orders.forEach((o) => {
          const ref = doc(db, "orders", String(o.id));
          batch.delete(ref);
        });
        await batch.commit();
        setOrders([]);
        alert("Base de datos de pedidos reiniciada.");
      } catch (error) {
        console.error("Error reseteando:", error);
      }
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

  if (loading)
    return (
      <div className="p-10 text-center text-slate-400">Cargando pedidos...</div>
    );

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
          <button
            onClick={handleResetDatabase}
            className="bg-red-50 text-red-600 px-3 py-2 rounded-lg font-bold hover:bg-red-100 transition flex items-center gap-1 border border-red-100"
            title="Borrar todo"
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
            onClick={openNewOrder}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20"
          >
            <Plus size={18} /> Nuevo Pedido
          </button>
        </div>
      </div>

      {/* TABS */}
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

      {/* LISTA DE PEDIDOS */}
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
              {/* 1. INFO PRINCIPAL */}
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
                    {order.items
                      ? order.items.map((i) => `${i.qty} ${i.title}`).join(", ")
                      : "Sin items"}
                  </span>
                </p>
              </div>

              {/* 2. ESTADO Y PAGO */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                <div className="text-right mr-4">
                  <span className="block font-black text-lg text-slate-800">
                    ${Number(order.total).toLocaleString()}
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

              {/* 3. ACCIONES */}
              <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 justify-end">
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

                {/* BOTÓN EDITAR */}
                {order.status !== "Anulado" && order.status !== "Entregado" && (
                  <button
                    onClick={() => openEditOrder(order)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Editar Pedido"
                  >
                    <Edit size={18} />
                  </button>
                )}

                <button
                  onClick={() => handlePrint(order)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  <Printer size={18} />
                </button>
                <button
                  onClick={() => handleNotify(order)}
                  className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                >
                  <MessageCircle size={18} />
                </button>

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

      {/* --- MODAL 1: POS (CREAR / EDITAR) --- */}
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
                          ${Number(product.price).toLocaleString()}
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
                <h2 className="text-xl font-bold">
                  {editingId ? `Editar #${editingId}` : "Nuevo Pedido"}
                </h2>
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
                      className="flex justify-between items-center mb-3 text-sm border-b border-slate-50 pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-bold text-slate-700 w-32 truncate">
                          {item.title}
                        </p>
                        {/* CONTROLES DE CANTIDAD */}
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center hover:bg-slate-200"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center hover:bg-slate-200"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-slate-800">
                          ${(item.price * item.qty).toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeFromPosCart(item.id)}
                          className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Borrar
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
                  onClick={handleSaveOrder}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  {editingId ? "Guardar Cambios" : "Crear Pedido"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: CONFIGURACIÓN TIRILLA --- */}
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
                onClick={handleSaveConfig}
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
