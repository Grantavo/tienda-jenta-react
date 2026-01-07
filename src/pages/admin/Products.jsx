import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Package,
  Image as ImageIcon,
  Check,
  AlertTriangle,
} from "lucide-react";

// 1. IMPORTAR SONNER Y FIREBASE
import { toast } from "sonner";
import { db } from "../../firebase/config";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Estados del Formulario
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    stock: "",
    category: "",
    description: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // --- 2. CARGA DE DATOS CON useCallback (SOLUCIÓN AL ERROR) ---
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(docs);
    } catch (error) {
      console.error("Error cargando productos:", error);
      toast.error("Error al conectar con la nube");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- 3. FUNCIONES DE LÓGICA ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Capitalización automática para el título
    if (name === "title") {
      finalValue = value.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1000000) {
        return toast.warning("Imagen muy pesada", {
          description: "Máximo 1MB permitido.",
        });
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      return toast.warning("Campos obligatorios", {
        description: "Título y precio son necesarios.",
      });
    }

    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        image: imagePreview,
        updatedAt: new Date(),
      };

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), productData);
        toast.success("Producto actualizado correctamente");
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: new Date(),
        });
        toast.success("Producto creado exitosamente");
      }

      closeModal();
      fetchProducts();
    } catch (error) {
      console.error("Error guardando:", error);
      toast.error("Error al guardar en la nube");
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm("¿Eliminar este producto permanentemente?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        toast.info("Producto eliminado");
        fetchProducts();
      } catch (error) {
        console.error("Error eliminando:", error);
        toast.error("No se pudo eliminar");
      }
    }
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      title: product.title,
      price: product.price,
      stock: product.stock,
      category: product.category || "",
      description: product.description || "",
    });
    setImagePreview(product.image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      title: "",
      price: "",
      stock: "",
      category: "",
      description: "",
    });
    setImagePreview(null);
  };

  // --- RENDER ---
  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Inventario de Productos
          </h1>
          <p className="text-sm text-slate-500">
            {products.length} artículos en total
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Plus size={18} /> Nuevo
          </button>
        </div>
      </div>

      {/* TABLA / GRID */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">
          Cargando inventario...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="aspect-video bg-slate-100 relative">
                {product.image ? (
                  <img
                    src={product.image}
                    className="w-full h-full object-cover"
                    alt={product.title}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon size={48} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(product)}
                    className="p-2 bg-white rounded-full shadow-lg text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 bg-white rounded-full shadow-lg text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-800 mb-1">
                  {product.title}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-black text-lg">
                    ${Number(product.price).toLocaleString()}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      product.stock > 0
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    Stock: {product.stock}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800">
                {editingId ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-full transition"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* IZQUIERDA: IMAGEN */}
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-blue-300 transition-all overflow-hidden relative group"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  ) : (
                    <>
                      <ImageIcon size={48} className="text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-400">
                        Click para subir foto
                      </p>
                    </>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    Cambiar Imagen
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              {/* DERECHA: DATOS */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                    Nombre del Producto (*)
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                      Precio (*)
                    </label>
                    <input
                      type="number"
                      name="price"
                      required
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      name="stock"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all"
                      value={formData.stock}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all resize-none"
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
                >
                  {editingId ? "Guardar Cambios" : "Crear Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSS PARA OCULTAR FLECHAS Y SCROLLBAR */}
      <style>{`
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
