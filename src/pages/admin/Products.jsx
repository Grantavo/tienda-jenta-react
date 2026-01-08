import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Search,
  FileSpreadsheet,
  FileText,
  Trash2,
  Edit2,
  X,
  UploadCloud,
  Image as ImageIcon,
} from "lucide-react";
import * as XLSX from "xlsx";

// 1. IMPORTAR SONNER
import { toast } from "sonner";

import { db } from "../../firebase/config";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const generateRandomRef = () => `REF-${Math.floor(Math.random() * 1000000)}`;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para búsqueda

  const [categories] = useState(() => {
    try {
      const saved = localStorage.getItem("shopCategories");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showVariants, setShowVariants] = useState(false);

  const initialForm = {
    title: "",
    price: "",
    oldPrice: "",
    categoryId: "",
    subcategoryId: "",
    stock: "",
    bestSeller: "no",
    description: "",
    reference: "",
    brand: "",
    items: [],
    images: [null, null, null, null],
  };
  const [formData, setFormData] = useState(initialForm);

  // CORRECCIÓN: Definimos la colección dentro del callback para eliminar el error de dependencia
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const productsCollection = collection(db, "products"); // Definido aquí dentro
      const querySnapshot = await getDocs(productsCollection);
      const docs = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setProducts(docs);
    } catch {
      console.error("Error al cargar productos");
      toast.error("Error al conectar con la base de datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      toast.info(`Excel leído: ${data.length} filas encontradas`, {
        description: "La subida masiva se habilitará próximamente.",
      });
    };
    reader.readAsBinaryString(file);
  };

  const excelInputRef = useRef(null);

  const selectedCatObj = categories.find((c) => c.id == formData.categoryId);
  const availableSubcats = selectedCatObj ? selectedCatObj.subcategories : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        return toast.warning("Imagen pesada", {
          description: "Máximo 1MB recomendado",
        });
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...formData.images];
        newImages[index] = reader.result;
        setFormData((prev) => ({ ...prev, images: newImages }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleVariants = (e) => {
    setShowVariants(e.target.checked);
    if (e.target.checked && formData.items.length === 0) {
      setFormData((prev) => ({ ...prev, items: ["", "", "", ""] }));
    }
  };

  const handleVariantChange = (index, value) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addVariantSlot = () => {
    setFormData((prev) => ({ ...prev, items: [...prev.items, ""] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productsCollection = collection(db, "products"); // Definido aquí para el guardado
      const finalRef = formData.reference || generateRandomRef();
      const productData = {
        title: formData.title || "Sin Título",
        price: Number(formData.price) || 0,
        oldPrice: Number(formData.oldPrice) || 0,
        categoryId: formData.categoryId || "",
        subcategoryId: formData.subcategoryId || "",
        stock: Number(formData.stock) || 0,
        bestSeller: formData.bestSeller || "no",
        description: formData.description || "",
        reference: finalRef,
        brand: formData.brand || "Genérica",
        items: formData.items
          ? formData.items.filter((i) => i && i.trim() !== "")
          : [],
        images: formData.images.map((img) => img || null),
        updatedAt: new Date(),
      };

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), productData);
        toast.success("Producto actualizado correctamente ✅");
      } else {
        await addDoc(productsCollection, {
          ...productData,
          createdAt: new Date(),
        });
        toast.success("Producto publicado exitosamente 🚀");
      }

      closeModal();
      fetchProducts();
    } catch {
      toast.error("Error al guardar en la nube");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (product) => {
    const safeImages = [null, null, null, null];
    if (product.images) {
      product.images.forEach((img, i) => {
        if (i < 4) safeImages[i] = img;
      });
    }

    setFormData({ ...initialForm, ...product, images: safeImages });
    setEditingId(product.id);
    setShowVariants(product.items && product.items.length > 0);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialForm);
    setShowVariants(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este producto de la nube?")) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, "products", id));
        toast.info("Producto eliminado del inventario");
        await fetchProducts();
      } catch {
        toast.error("No se pudo eliminar el producto");
      } finally {
        setLoading(false);
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // FILTRO DE BÚSQUEDA
  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const labelClass =
    "block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2";
  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Gestión de Productos
          </h1>
          <p className="text-sm text-slate-500">Administra tu inventario.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-md shadow-blue-600/20"
          >
            <Plus size={18} /> Agregar
          </button>
          <div className="relative">
            <button
              onClick={() => excelInputRef.current.click()}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition shadow-md shadow-green-600/20"
            >
              <FileSpreadsheet size={18} /> Excel
            </button>
            <input
              type="file"
              ref={excelInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls"
              className="hidden"
            />
          </div>
          <button className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition shadow-md shadow-slate-700/20">
            <FileText size={18} /> PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              id="search-products-table"
              name="search-products-table"
              type="text"
              placeholder="Buscar por título, ID..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Imagen</th>
                <th className="px-6 py-4">Título</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Ref/Marca</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-center">Destacado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-12 text-slate-400 animate-pulse"
                  >
                    Cargando productos de la nube...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-8 text-slate-400 italic"
                  >
                    No hay productos. ¡Agrega uno!
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt="Miniatura"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td
                      className="px-6 py-3 font-medium text-slate-800 max-w-[200px] truncate"
                      title={product.title}
                    >
                      {product.title}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">
                          {formatPrice(product.price)}
                        </span>
                        {product.oldPrice > product.price && (
                          <span className="text-xs text-red-400 line-through">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-xs">
                          {product.reference || "-"}
                        </span>
                        <span className="text-xs text-slate-400">
                          {product.brand || "Genérica"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      {categories.find((c) => c.id == product.categoryId)
                        ?.name || "Sin cat."}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          product.stock > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.stock > 0 ? `${product.stock} un.` : "Agotado"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      {product.bestSeller === "si" && (
                        <span className="text-yellow-500 font-bold">★ Sí</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right space-x-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-full transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 transition-opacity">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white flex-none">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingId ? "Editar Producto" : "Agregar Nuevo Producto"}
                </h2>
                <p className="text-xs text-slate-400">
                  Completa la información detallada
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <form
                id="product-form"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="product-title" className={labelClass}>
                    Título del Producto (*)
                  </label>
                  <input
                    id="product-title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className={inputClass}
                    placeholder="Ej: Minipulidora 1100w"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="product-category" className={labelClass}>
                      Categoría (*)
                    </label>
                    <select
                      id="product-category"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      required
                      className={inputClass}
                    >
                      <option value="">Selecciona Categoría</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="product-subcategory" className={labelClass}>
                      Subcategoría (*)
                    </label>
                    <select
                      id="product-subcategory"
                      name="subcategoryId"
                      value={formData.subcategoryId}
                      onChange={handleInputChange}
                      className={inputClass}
                      disabled={!formData.categoryId}
                    >
                      <option value="">Selecciona Subcategoría</option>
                      {availableSubcats.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="product-price" className={labelClass}>
                      Precio Real (*)
                    </label>
                    <input
                      id="product-price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className={inputClass + " font-bold text-slate-700"}
                      placeholder="$ 0"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-oldPrice" className={labelClass}>
                      Precio Tachado (Antes)
                    </label>
                    <div className="relative">
                      <input
                        id="product-oldPrice"
                        name="oldPrice"
                        type="number"
                        value={formData.oldPrice}
                        onChange={handleInputChange}
                        className={inputClass + " text-slate-500"}
                        placeholder="$ 0"
                      />
                      {formData.price && formData.oldPrice > formData.price && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
                          -
                          {Math.round(
                            ((formData.oldPrice - formData.price) /
                              formData.oldPrice) *
                              100
                          )}
                          %
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label htmlFor="product-reference" className={labelClass}>
                      Referencia
                    </label>
                    <input
                      id="product-reference"
                      name="reference"
                      type="text"
                      value={formData.reference}
                      onChange={handleInputChange}
                      className={inputClass}
                      placeholder="Ej: REF-001"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-brand" className={labelClass}>
                      Marca
                    </label>
                    <input
                      id="product-brand"
                      name="brand"
                      type="text"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className={inputClass}
                      placeholder="Ej: Genérica"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="product-stock" className={labelClass}>
                      Stock Disponible
                    </label>
                    <input
                      id="product-stock"
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      className={inputClass}
                      placeholder="Ej: 50"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-bestseller" className={labelClass}>
                      Destacado
                    </label>
                    <select
                      id="product-bestseller"
                      name="bestSeller"
                      value={formData.bestSeller}
                      onChange={handleInputChange}
                      className={inputClass}
                    >
                      <option value="no">Normal</option>
                      <option value="si">¡Más Vendido!</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="product-description" className={labelClass}>
                    Descripción Detallada
                  </label>
                  <textarea
                    id="product-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className={inputClass + " resize-none"}
                    placeholder="Características principales..."
                  ></textarea>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-bold text-slate-700">
                      Items (Opcional)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer select-none">
                      Dar a elegir a los clientes
                      <input
                        type="checkbox"
                        checked={showVariants}
                        onChange={toggleVariants}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                  {showVariants && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl">
                      {formData.items.map((item, idx) => (
                        <input
                          key={idx}
                          type="text"
                          value={item}
                          onChange={(e) =>
                            handleVariantChange(idx, e.target.value)
                          }
                          className="px-3 py-2 text-sm rounded border border-slate-200 focus:border-blue-500 outline-none"
                          placeholder={`Item ${idx + 1}`}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={addVariantSlot}
                        className="flex items-center justify-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition"
                      >
                        <Plus size={14} /> Más
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelClass + " block mb-3"}>
                    Galería (Máx 4)
                  </label>
                  <div className="grid grid-cols-4 gap-4">
                    {[0, 1, 2, 3].map((index) => (
                      <div key={index} className="aspect-square relative group">
                        <label className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition overflow-hidden bg-white">
                          {formData.images[index] ? (
                            <img
                              src={formData.images[index]}
                              alt={`Upload ${index}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center text-slate-300 group-hover:text-blue-400">
                              <UploadCloud size={24} className="mx-auto mb-1" />
                              <span className="text-[10px] font-bold">
                                {index === 0 ? "PORTADA" : `Foto ${index + 1}`}
                              </span>
                            </div>
                          )}
                          <input
                            type="file"
                            onChange={(e) => handleImageUpload(index, e)}
                            className="hidden"
                            accept="image/*"
                          />
                        </label>
                        {formData.images[index] && (
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...formData.images];
                              newImages[index] = null;
                              setFormData((prev) => ({
                                ...prev,
                                images: newImages,
                              }));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 opacity-0 group-hover:opacity-100 transition"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex-none rounded-b-3xl">
              <button
                form="product-form"
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition transform active:scale-[0.99]"
              >
                {loading
                  ? "Sincronizando..."
                  : editingId
                  ? "Guardar Cambios"
                  : "Publicar Producto"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}</style>
    </div>
  );
}
