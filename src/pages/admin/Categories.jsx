import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

export default function Categories() {
  // 1. ESTADO: Leemos de la memoria al iniciar
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("shopCategories");
    if (saved) return JSON.parse(saved);

    // Datos por defecto si es la primera vez
    return [
      {
        id: 1,
        name: "Tecnología",
        image: null,
        subcategories: [
          { id: 101, name: "Celulares" },
          { id: 102, name: "Laptops" },
        ],
      },
      {
        id: 2,
        name: "Hogar",
        image: null,
        subcategories: [],
      },
    ];
  });

  // 2. EFECTO MAGICO: Guardar en memoria cada vez que cambia algo
  useEffect(() => {
    localStorage.setItem("shopCategories", JSON.stringify(categories));
  }, [categories]);

  // --- (El resto de la lógica de modales sigue igual) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [currentItem, setCurrentItem] = useState(null);

  const catNameRef = useRef("");
  const subNameRef = useRef("");
  const parentSelectRef = useRef("");
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);

  const openAddCategory = () => {
    setModalType("addCategory");
    setImagePreview(null);
    setIsModalOpen(true);
  };
  const openAddSubcategory = () => {
    setModalType("addSub");
    setIsModalOpen(true);
  };
  const openEdit = (item, type, parentId = null) => {
    setCurrentItem({ ...item, parentId });
    setModalType(type);
    setImagePreview(item.image || null);
    setIsModalOpen(true);
  };
  const openDelete = (item, type, parentId = null) => {
    setCurrentItem({ ...item, parentId });
    setModalType("delete");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (modalType === "addCategory") {
      const newCat = {
        id: Date.now(),
        name: catNameRef.current.value,
        image: imagePreview,
        subcategories: [],
      };
      setCategories([...categories, newCat]);
    } else if (modalType === "addSub") {
      const parentId = parseInt(parentSelectRef.current.value);
      const newSub = { id: Date.now(), name: subNameRef.current.value };
      setCategories((cats) =>
        cats.map((cat) =>
          cat.id === parentId
            ? { ...cat, subcategories: [...cat.subcategories, newSub] }
            : cat
        )
      );
    }
    closeModal();
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (modalType === "editCategory") {
      setCategories((cats) =>
        cats.map((cat) =>
          cat.id === currentItem.id
            ? { ...cat, name: catNameRef.current.value, image: imagePreview }
            : cat
        )
      );
    } else if (modalType === "editSub") {
      setCategories((cats) =>
        cats.map((cat) => {
          if (cat.id === currentItem.parentId) {
            return {
              ...cat,
              subcategories: cat.subcategories.map((sub) =>
                sub.id === currentItem.id
                  ? { ...sub, name: subNameRef.current.value }
                  : sub
              ),
            };
          }
          return cat;
        })
      );
    }
    closeModal();
  };

  const handleConfirmDelete = () => {
    if (modalType === "delete") {
      if (currentItem.parentId) {
        setCategories((cats) =>
          cats.map((cat) => {
            if (cat.id === currentItem.parentId) {
              return {
                ...cat,
                subcategories: cat.subcategories.filter(
                  (sub) => sub.id !== currentItem.id
                ),
              };
            }
            return cat;
          })
        );
      } else {
        setCategories((cats) =>
          cats.filter((cat) => cat.id !== currentItem.id)
        );
      }
    }
    closeModal();
  };

  const labelClass =
    "block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2";
  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Categorías de Productos
          </h1>
          <p className="text-sm text-slate-500">
            Organiza tu inventario para facilitar la navegación
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openAddCategory}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow-md shadow-blue-600/20"
          >
            <Plus size={18} /> Agregar Categoría
          </button>
          <button
            onClick={openAddSubcategory}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition font-medium"
          >
            <Plus size={18} /> SubCategoría
          </button>
        </div>
      </div>

      <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        {categories.map((category, index) => (
          <div key={category.id}>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 group hover:border-blue-300 transition-all">
              <div className="flex items-center gap-4">
                <span className="font-bold text-blue-600">{index + 1}.</span>
                {category.image && (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-10 h-10 rounded-md object-cover border border-slate-200"
                  />
                )}
                <span className="font-semibold text-slate-800 text-lg">
                  {category.name}
                </span>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(category, "editCategory")}
                  className="p-2 hover:bg-blue-100 text-blue-600 rounded-full transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => openDelete(category, "category")}
                  className="p-2 hover:bg-red-100 text-red-600 rounded-full transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="ml-8 mt-2 space-y-2 border-l-2 border-slate-100 pl-4">
              {category.subcategories.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 hover:border-slate-200 group transition-all"
                >
                  <span className="text-slate-600 flex items-center gap-2">
                    <span className="text-slate-300">-</span> {sub.name}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(sub, "editSub", category.id)}
                      className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-full transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() =>
                        openDelete(sub, "subcategory", category.id)
                      }
                      className="p-1.5 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {category.subcategories.length === 0 && (
                <p className="text-xs text-slate-400 italic py-2 pl-2">
                  Sin subcategorías
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">
                {modalType === "addCategory" && "Agregar Categoría"}
                {modalType === "addSub" && "Agregar SubCategoría"}
                {modalType.startsWith("edit") && "Editar"}
                {modalType === "delete" && "¿Estás seguro?"}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1 transition"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              {["addCategory", "editCategory"].includes(modalType) && (
                <form
                  onSubmit={
                    modalType === "addCategory" ? handleAdd : handleUpdate
                  }
                  className="space-y-6"
                >
                  <div>
                    <label className={labelClass}>Nombre (*)</label>
                    <input
                      ref={catNameRef}
                      defaultValue={currentItem?.name || ""}
                      type="text"
                      required
                      className={inputClass}
                      placeholder="Ej: Ferretería"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Imagen (Opcional)</label>
                    <div
                      className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition cursor-pointer group"
                      onClick={() => fileInputRef.current.click()}
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-lg shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-slate-300 transition">
                          <ImageIcon size={24} />
                        </div>
                      )}
                      <div className="flex-1 text-sm text-slate-500">
                        <p className="font-medium text-blue-600 group-hover:underline">
                          Subir imagen
                        </p>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-lg shadow-blue-600/20"
                  >
                    {modalType === "addCategory" ? "Agregar" : "Guardar"}
                  </button>
                </form>
              )}
              {["addSub", "editSub"].includes(modalType) && (
                <form
                  onSubmit={modalType === "addSub" ? handleAdd : handleUpdate}
                  className="space-y-6"
                >
                  {modalType === "addSub" && (
                    <div>
                      <label className={labelClass}>Categoría (*)</label>
                      <div className="relative">
                        <select
                          ref={parentSelectRef}
                          required
                          className={`${inputClass} appearance-none cursor-pointer`}
                        >
                          <option value="">Selecciona...</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={20}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className={labelClass}>Nombre (*)</label>
                    <input
                      ref={subNameRef}
                      defaultValue={currentItem?.name || ""}
                      type="text"
                      required
                      className={inputClass}
                      placeholder="Ej: Martillos"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-lg shadow-blue-600/20"
                  >
                    {modalType === "addSub" ? "Agregar" : "Guardar"}
                  </button>
                </form>
              )}
              {modalType === "delete" && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <AlertTriangle size={40} className="text-red-600" />
                  </div>
                  <p className="text-slate-600 mb-2">
                    Eliminar{" "}
                    <span className="font-bold">"{currentItem?.name}"</span>?
                  </p>
                  <div className="flex gap-4 justify-center mt-6">
                    <button
                      onClick={closeModal}
                      className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition shadow-lg shadow-red-600/20"
                    >
                      Sí, eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
