import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Shield,
  Check,
  X,
  Key,
  User,
  Lock,
} from "lucide-react";

// --- ZONA SEGURA (Fuera del componente) ---
// Al estar aquí, el linter de React sabe que esto no afecta el renderizado visual.
const generateId = () => Date.now();
const getTodayDate = () => new Date().toISOString().split("T")[0];

// LISTA MAESTRA DE MÓDULOS
const APP_MODULES = [
  { id: "dashboard", label: "Dashboard (Ver Métricas)" },
  { id: "pedidos", label: "Gestión de Pedidos" },
  { id: "productos", label: "Gestión de Productos" },
  { id: "categorias", label: "Gestión de Categorías" },
  { id: "clientes", label: "Cartera de Clientes" },
  { id: "banners", label: "Diseño y Banners" },
  { id: "usuarios", label: "Gestión de Usuarios (Peligroso)" },
  { id: "ajustes", label: "Configuración de Tienda" },
];

export default function Users() {
  // --- 1. DATOS INICIALES ---
  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem("shopRoles");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "role_admin",
        name: "Super Admin",
        permissions: APP_MODULES.map((m) => m.id),
        isSystem: true,
      },
      {
        id: "role_vendedor",
        name: "Vendedor",
        permissions: ["pedidos", "clientes"],
        isSystem: false,
      },
    ];
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("shopUsers");
    if (saved) return JSON.parse(saved);

    // Usamos las funciones externas
    return [
      {
        id: 1,
        name: "Super Admin",
        email: "admin@genta.com",
        password: "123",
        roleId: "role_admin",
        createdAt: getTodayDate(),
        isSystem: true,
      },
    ];
  });

  // --- 2. ESTADOS ---
  const [activeTab, setActiveTab] = useState("users");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Formularios
  const initialUserForm = { name: "", email: "", password: "", roleId: "" };
  const initialRoleForm = { name: "", permissions: [] };

  const [userForm, setUserForm] = useState(initialUserForm);
  const [roleForm, setRoleForm] = useState(initialRoleForm);

  // --- 3. PERSISTENCIA ---
  useEffect(() => {
    localStorage.setItem("shopRoles", JSON.stringify(roles));
  }, [roles]);
  useEffect(() => {
    localStorage.setItem("shopUsers", JSON.stringify(users));
  }, [users]);

  // --- 4. LÓGICA USUARIOS ---
  const handleSaveUser = (e) => {
    e.preventDefault();

    if (editingId) {
      // Editar
      setUsers(
        users.map((u) =>
          u.id === editingId
            ? { ...u, ...userForm, password: userForm.password || u.password }
            : u
        )
      );
    } else {
      // Crear
      if (!userForm.password) return alert("La contraseña es obligatoria");

      // SOLUCIÓN FINAL: Llamamos a las funciones externas
      setUsers([
        ...users,
        {
          ...userForm,
          id: generateId(), // <--- Función externa
          createdAt: getTodayDate(), // <--- Función externa
          isSystem: false,
        },
      ]);
    }
    closeModal();
  };

  const deleteUser = (id, isSystem) => {
    if (isSystem)
      return alert("No puedes eliminar al Super Admin del sistema.");
    if (
      window.confirm("¿Eliminar usuario? Perderá el acceso inmediatamente.")
    ) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  // --- 5. LÓGICA ROLES ---
  const handleSaveRole = (e) => {
    e.preventDefault();

    if (editingId) {
      // Editar Rol
      setRoles(
        roles.map((r) =>
          r.id === editingId
            ? { ...r, name: roleForm.name, permissions: roleForm.permissions }
            : r
        )
      );
    } else {
      // Crear Rol
      const newRoleId = `role_${generateId()}`; // <--- Función externa

      setRoles([
        ...roles,
        {
          ...roleForm,
          id: newRoleId,
          isSystem: false,
        },
      ]);
    }
    closeModal();
  };

  const deleteRole = (id, isSystem) => {
    if (isSystem)
      return alert("Este rol es vital para el sistema. No se puede borrar.");
    const usersInRole = users.filter((u) => u.roleId === id);
    if (usersInRole.length > 0)
      return alert(
        `No puedes borrar este rol porque hay ${usersInRole.length} usuarios usándolo.`
      );

    if (window.confirm("¿Eliminar Rol?")) {
      setRoles(roles.filter((r) => r.id !== id));
    }
  };

  const togglePermission = (moduleId) => {
    const currentPerms = roleForm.permissions;
    if (currentPerms.includes(moduleId)) {
      setRoleForm({
        ...roleForm,
        permissions: currentPerms.filter((p) => p !== moduleId),
      });
    } else {
      setRoleForm({ ...roleForm, permissions: [...currentPerms, moduleId] });
    }
  };

  // --- AUXILIARES ---
  const openEditUser = (user) => {
    setUserForm({
      name: user.name,
      email: user.email,
      password: "",
      roleId: user.roleId,
    });
    setEditingId(user.id);
    setActiveTab("users");
    setIsModalOpen(true);
  };

  const openEditRole = (role) => {
    if (role.isSystem)
      return alert(
        "El rol Super Admin tiene todos los permisos por defecto y no se debe editar."
      );
    setRoleForm({ name: role.name, permissions: role.permissions });
    setEditingId(role.id);
    setActiveTab("roles");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setUserForm(initialUserForm);
    setRoleForm(initialRoleForm);
  };

  // --- RENDER ---
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Gestión de Acceso
          </h1>
          <p className="text-sm text-slate-500">
            Administra quién puede entrar y qué puede ver.
          </p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-md text-sm font-bold transition ${
              activeTab === "users"
                ? "bg-blue-100 text-blue-700"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Usuarios ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-4 py-2 rounded-md text-sm font-bold transition ${
              activeTab === "roles"
                ? "bg-blue-100 text-blue-700"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Roles y Permisos ({roles.length})
          </button>
        </div>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setEditingId(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 flex items-center gap-2"
        >
          <Plus size={18} />{" "}
          {activeTab === "users" ? "Agregar Usuario" : "Crear Rol"}
        </button>
      </div>

      {/* --- TABLA DE USUARIOS --- */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol Asignado</th>
                <th className="px-6 py-4">Fecha Creación</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const userRole = roles.find((r) => r.id === user.roleId);
                return (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                          {user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold border ${
                          userRole?.isSystem
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {userRole?.name || "Rol desconocido"}
                      </span>
                    </td>
                    <td className="px-6 py-4">{user.createdAt}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditUser(user)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition"
                      >
                        <Edit2 size={18} />
                      </button>
                      {!user.isSystem && (
                        <button
                          onClick={() => deleteUser(user.id, user.isSystem)}
                          className="text-red-400 hover:bg-red-50 p-2 rounded-full transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      {user.isSystem && (
                        <button
                          title="Protegido"
                          className="text-slate-300 cursor-not-allowed p-2"
                        >
                          <Lock size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- TABLA DE ROLES --- */}
      {activeTab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col relative group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Shield
                    size={20}
                    className={
                      role.isSystem ? "text-green-600" : "text-blue-600"
                    }
                  />
                  <h3 className="font-bold text-lg text-slate-800">
                    {role.name}
                  </h3>
                </div>
                {!role.isSystem && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditRole(role)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteRole(role.id, role.isSystem)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                {role.isSystem && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">
                    Sistema
                  </span>
                )}
              </div>

              <p className="text-xs font-bold text-slate-400 uppercase mb-3">
                Permisos Habilitados:
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {role.isSystem ? (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                    Acceso Total (Super Admin)
                  </span>
                ) : (
                  role.permissions.map((perm) => {
                    const mod = APP_MODULES.find((m) => m.id === perm);
                    return (
                      <span
                        key={perm}
                        className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded"
                      >
                        {mod ? mod.label.split("(")[0] : perm}
                      </span>
                    );
                  })
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-slate-50 text-xs text-slate-400 flex justify-between">
                <span>Usuarios con este rol:</span>
                <span className="font-bold text-slate-700">
                  {users.filter((u) => u.roleId === role.id).length}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {activeTab === "users"
                  ? editingId
                    ? "Editar Usuario"
                    : "Nuevo Usuario"
                  : editingId
                  ? "Editar Rol"
                  : "Crear Nuevo Rol"}
              </h2>
              <button onClick={closeModal}>
                <X className="text-slate-400 hover:text-red-500" />
              </button>
            </div>

            {activeTab === "users" && (
              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                    value={userForm.name}
                    onChange={(e) =>
                      setUserForm({ ...userForm, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Correo (Login)
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm({ ...userForm, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Rol de Acceso
                  </label>
                  <select
                    required
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-white"
                    value={userForm.roleId}
                    onChange={(e) =>
                      setUserForm({ ...userForm, roleId: e.target.value })
                    }
                  >
                    <option value="">Seleccione un rol...</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    Contraseña{" "}
                    {editingId && (
                      <span className="text-slate-400 font-normal lowercase">
                        (Dejar vacía para no cambiar)
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Key
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="password"
                      className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                      placeholder="******"
                      value={userForm.password}
                      onChange={(e) =>
                        setUserForm({ ...userForm, password: e.target.value })
                      }
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition mt-2"
                >
                  Guardar Usuario
                </button>
              </form>
            )}

            {activeTab === "roles" && (
              <form onSubmit={handleSaveRole} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Nombre del Rol
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Vendedor, Logística..."
                    required
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                    value={roleForm.name}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                    Permisos de Acceso
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto custom-scrollbar border border-slate-100 p-2 rounded-xl">
                    {APP_MODULES.map((module) => (
                      <label
                        key={module.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                          roleForm.permissions.includes(module.id)
                            ? "bg-blue-50 border-blue-200"
                            : "bg-white border-slate-100 hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border ${
                            roleForm.permissions.includes(module.id)
                              ? "bg-blue-600 border-blue-600"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {roleForm.permissions.includes(module.id) && (
                            <Check size={14} className="text-white" />
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={roleForm.permissions.includes(module.id)}
                          onChange={() => togglePermission(module.id)}
                        />
                        <span
                          className={`text-sm ${
                            roleForm.permissions.includes(module.id)
                              ? "font-bold text-blue-900"
                              : "text-slate-600"
                          }`}
                        >
                          {module.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition mt-2"
                >
                  Guardar Configuración del Rol
                </button>
              </form>
            )}
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
