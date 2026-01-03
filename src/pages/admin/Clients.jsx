import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ShoppingBag,
  DollarSign,
  Edit2,
  Trash2,
  Plus,
  X,
  Star,
} from "lucide-react";

export default function Clients() {
  // --- 1. DATOS ---
  const [clients, setClients] = useState(() => {
    const savedClients = JSON.parse(
      localStorage.getItem("shopClients") || "[]"
    );
    const savedOrders = JSON.parse(localStorage.getItem("shopOrders") || "[]");

    // Generar clientes desde pedidos (si no existen)
    const clientsFromOrders = savedOrders.reduce(
      (acc, order) => {
        const existing = acc.find((c) => c.phone === order.phone);
        if (!existing) {
          acc.push({
            id: Date.now() + Math.random(),
            name: order.client,
            phone: order.phone,
            email: "no-email@registrado.com",
            address: "Dirección del pedido",
            notes: "Cliente generado automáticamente por pedido.",
            isVip: false,
            joinDate: order.date,
          });
        }
        return acc;
      },
      [...savedClients]
    );

    // Filtrar duplicados
    const uniqueClients = clientsFromOrders.filter(
      (v, i, a) => a.findIndex((t) => t.phone === v.phone) === i
    );
    return uniqueClients;
  });

  const [orders] = useState(() =>
    JSON.parse(localStorage.getItem("shopOrders") || "[]")
  );

  // Estados de Interfaz
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulario
  const initialForm = {
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  };
  const [formData, setFormData] = useState(initialForm);

  // --- 2. PERSISTENCIA ---
  useEffect(() => {
    localStorage.setItem("shopClients", JSON.stringify(clients));
  }, [clients]);

  // --- 3. CÁLCULOS ---
  const getClientStats = (phone) => {
    const clientOrders = orders.filter((o) => o.phone === phone);
    const totalSpent = clientOrders.reduce(
      (acc, order) => acc + order.total,
      0
    );
    return {
      count: clientOrders.length,
      total: totalSpent,
      history: clientOrders,
    };
  };

  // --- 4. FUNCIONES ---
  const handleSave = (e) => {
    e.preventDefault();
    const newClient = {
      ...formData,
      id: Date.now(),
      isVip: false,
      joinDate: new Date().toISOString().split("T")[0],
    };
    setClients([...clients, newClient]);
    setIsModalOpen(false);
    setFormData(initialForm);
  };

  const deleteClient = (id) => {
    if (window.confirm("¿Eliminar cliente?")) {
      setClients(clients.filter((c) => c.id !== id));
      setSelectedClient(null);
    }
  };

  const toggleVip = (id) => {
    setClients(
      clients.map((c) => (c.id === id ? { ...c, isVip: !c.isVip } : c))
    );
    if (selectedClient && selectedClient.id === id) {
      setSelectedClient((prev) => ({ ...prev, isVip: !prev.isVip }));
    }
  };

  const openWhatsApp = (phone, name) => {
    const msg = `Hola ${name}, te escribimos de Tienda Genta...`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  // --- RENDER ---
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  return (
    // CAMBIO 1: Usamos h-full para que se adapte al contenedor padre sin desbordarse
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Cartera de Clientes
          </h1>
          <p className="text-sm text-slate-500">
            {clients.length} contactos registrados
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex flex-col md:flex-row gap-6 h-full overflow-hidden pb-2">
        {/* --- COLUMNA IZQUIERDA: LISTA --- */}
        <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          {/* Buscador */}
          <div className="p-4 border-b border-slate-100 shrink-0">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar cliente..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Lista Scrollable */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredClients.map((client) => {
              const stats = getClientStats(client.phone);
              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${
                    selectedClient?.id === client.id
                      ? "bg-blue-50 border-l-4 border-l-blue-600"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${
                          client.isVip ? "bg-yellow-500" : "bg-slate-400"
                        }`}
                      >
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm truncate max-w-[150px]">
                          {client.name}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone size={10} /> {client.phone}
                        </p>
                      </div>
                    </div>
                    {client.isVip && (
                      <Star
                        size={14}
                        className="text-yellow-500 fill-yellow-500"
                      />
                    )}
                  </div>
                  <div className="mt-3 flex justify-between items-center text-xs">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold">
                      {stats.count} Pedidos
                    </span>
                    <span className="text-green-600 font-bold">
                      ${stats.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- COLUMNA DERECHA: DETALLE 360 --- */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative flex flex-col">
          {selectedClient ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* HEADER DECORATIVO */}
              <div className="h-40 bg-gradient-to-r from-slate-800 to-slate-900 relative">
                <button
                  onClick={() => deleteClient(selectedClient.id)}
                  className="absolute top-4 right-4 bg-white/10 text-white p-2 rounded-full hover:bg-red-500 hover:text-white transition z-10"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* INFO PRINCIPAL (Con margen negativo para subir sobre el header) */}
              <div className="px-8 -mt-16 pb-6 relative z-0">
                <div className="flex justify-between items-end mb-6">
                  <div className="flex items-end gap-5">
                    {/* Avatar Grande */}
                    <div className="w-28 h-28 bg-white rounded-full p-1.5 shadow-xl">
                      <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-4xl font-bold text-slate-400">
                        {selectedClient.name.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                    {/* Nombre y VIP */}
                    <div className="mb-3">
                      <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        {selectedClient.name}
                        <button
                          onClick={() => toggleVip(selectedClient.id)}
                          className={`transition ${
                            selectedClient.isVip
                              ? "text-yellow-400"
                              : "text-slate-300 hover:text-yellow-400"
                          }`}
                        >
                          <Star
                            size={24}
                            className={
                              selectedClient.isVip ? "fill-yellow-400" : ""
                            }
                          />
                        </button>
                      </h2>
                      <p className="text-sm text-slate-500 font-medium">
                        Cliente desde: {selectedClient.joinDate}
                      </p>
                    </div>
                  </div>

                  {/* Botón Contactar */}
                  <button
                    onClick={() =>
                      openWhatsApp(selectedClient.phone, selectedClient.name)
                    }
                    className="mb-4 bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-green-600/30 hover:bg-green-700 hover:-translate-y-1 transition transform flex items-center gap-2"
                  >
                    <MessageCircle size={20} />{" "}
                    <span className="hidden lg:inline">Contactar</span>
                  </button>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">
                      Contacto
                    </p>
                    <div className="flex items-center gap-3 text-sm text-slate-700 mb-2 font-medium">
                      <div className="bg-white p-2 rounded-full shadow-sm">
                        <Phone size={14} />
                      </div>
                      {selectedClient.phone}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                      <div className="bg-white p-2 rounded-full shadow-sm">
                        <Mail size={14} />
                      </div>
                      {selectedClient.email || "Sin correo"}
                    </div>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">
                      Dirección
                    </p>
                    <div className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                      <div className="bg-white p-2 rounded-full shadow-sm">
                        <MapPin size={14} />
                      </div>
                      {selectedClient.address || "Sin dirección registrada"}
                    </div>
                  </div>
                </div>

                {/* Notas CRM */}
                <div className="mb-8">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                    Notas Internas (Solo Admin)
                  </label>
                  <textarea
                    className="w-full bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 resize-none shadow-sm"
                    rows="2"
                    placeholder="Escribe aquí preferencias del cliente..."
                    value={selectedClient.notes}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedClient({ ...selectedClient, notes: val });
                      setClients(
                        clients.map((c) =>
                          c.id === selectedClient.id ? { ...c, notes: val } : c
                        )
                      );
                    }}
                  ></textarea>
                </div>

                {/* Historial de Pedidos */}
                <div className="pb-8">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                    <ShoppingBag size={20} className="text-blue-600" />{" "}
                    Historial de Compras
                  </h3>
                  {getClientStats(selectedClient.phone).history.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                      <p className="text-slate-400 text-sm">
                        No hay pedidos registrados.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getClientStats(selectedClient.phone).history.map(
                        (order) => (
                          <div
                            key={order.id}
                            className="flex justify-between items-center p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition shadow-sm bg-white"
                          >
                            <div className="flex items-center gap-4">
                              <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600 font-bold">
                                #{order.id.slice(-4)}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-400 block mb-0.5">
                                  {order.date}
                                </span>
                                <span className="text-sm font-bold text-slate-800">
                                  {order.items.length} productos
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="block font-black text-slate-800 text-lg">
                                ${order.total.toLocaleString()}
                              </span>
                              <span
                                className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                                  order.status === "Entregado"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                <User size={48} className="opacity-50" />
              </div>
              <p className="font-medium text-lg">Selecciona un cliente</p>
              <p className="text-sm opacity-70">
                Verás su historial y detalles aquí
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL NUEVO CLIENTE (Sin cambios) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">
                Registrar Cliente
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="text-slate-400 hover:text-red-500" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <input
                type="text"
                placeholder="Nombre Completo"
                required
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Teléfono (WhatsApp)"
                required
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Correo Electrónico (Opcional)"
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <textarea
                placeholder="Dirección de Envío"
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition resize-none"
                rows="2"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              ></textarea>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
              >
                Guardar Cliente
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
