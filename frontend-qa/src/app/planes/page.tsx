"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

// Obtener proyectos del backend
async function getProyectos() {
  const res = await fetch("http://localhost:3001/proyectos", { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener proyectos");
  return res.json();
}

// Obtener planes de un proyecto
async function getPlanes(proyectoId: number) {
  const res = await fetch(`http://localhost:3001/proyectos/${proyectoId}/planes`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener planes");
  return res.json();
}

// Crear un plan de prueba
async function crearPlan(proyectoId: number, data: any) {
  const res = await fetch(`http://localhost:3001/proyectos/${proyectoId}/planes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear el plan");
  return res.json();
}

// Crear una versión para un proyecto
async function crearVersion(proyectoId: number, data: any) {
  const res = await fetch(`http://localhost:3001/proyectos/${proyectoId}/versiones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear la versión");
  return res.json();
}

// Función para actualizar un plan
async function actualizarPlan(planId: number, data: any) {
  const res = await fetch(`http://localhost:3001/planes/${planId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar el plan");
  return res.json();
}

export default function PlanesPage() {
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [proyectoId, setProyectoId] = useState<number | null>(null);
  const [planes, setPlanes] = useState<any[]>([]);
  const [loadingPlanes, setLoadingPlanes] = useState(false);
  const [form, setForm] = useState({ nombre: "", criticidad: "", descripcion: "", responsable: "" });
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [planEdit, setPlanEdit] = useState<any>(null);
  const [editForm, setEditForm] = useState({ nombre: "", criticidad: "", descripcion: "", responsable: "" });
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Cargar proyectos al inicio
  useEffect(() => {
    getProyectos().then(setProyectos);
  }, []);

  // Cargar planes cuando cambia el proyecto
  useEffect(() => {
    if (proyectoId) {
      cargarPlanes(proyectoId);
    } else {
      setPlanes([]);
    }
    // Ocultar y limpiar el formulario al cambiar de proyecto
    setShowForm(false);
    setForm({ nombre: "", criticidad: "", descripcion: "", responsable: "" });
    setFormError("");
    setSuccess("");
  }, [proyectoId]);

  async function cargarPlanes(id: number) {
    setLoadingPlanes(true);
    try {
      const data = await getPlanes(id);
      setPlanes(data);
    } catch {
      setPlanes([]);
    }
    setLoadingPlanes(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSuccess("");
    if (!form.nombre || !form.criticidad || !form.descripcion || !form.responsable) {
      setFormError("Todos los campos son obligatorios.");
      return;
    }
    setEnviando(true);
    try {
      await crearPlan(Number(proyectoId), form);
      setSuccess("¡Plan de prueba creado!");
      setForm({ nombre: "", criticidad: "", descripcion: "", responsable: "" });
      setShowForm(false); // Ocultar el formulario
      cargarPlanes(Number(proyectoId));
    } catch {
      setFormError("Error al crear el plan.");
    }
    setEnviando(false);
  }

  function handleNuevoClick() {
    setShowForm((prev) => {
      // Si se va a mostrar, limpiar el formulario
      if (!prev) {
        setForm({ nombre: "", criticidad: "", descripcion: "", responsable: "" });
        setFormError("");
        setSuccess("");
      }
      return !prev;
    });
  }

  // Abrir modal de edición
  function openEditModal(plan: any) {
    setPlanEdit(plan);
    setEditForm({
      nombre: plan.nombre,
      criticidad: plan.criticidad,
      descripcion: plan.descripcion,
      responsable: plan.responsable,
    });
    setEditError("");
    setEditSuccess("");
    setEditModalOpen(true);
  }

  // Guardar cambios de edición
  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");
    if (!editForm.nombre || !editForm.criticidad || !editForm.descripcion || !editForm.responsable) {
      setEditError("Todos los campos son obligatorios.");
      return;
    }
    setEditLoading(true);
    try {
      await actualizarPlan(planEdit.id, editForm);
      setEditSuccess("¡Plan actualizado!");
      setEditModalOpen(false);
      cargarPlanes(planEdit.proyectoId);
    } catch {
      setEditError("Error al actualizar el plan.");
    }
    setEditLoading(false);
  }

  return (
    <main className="p-4 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Planes de Prueba</h1>
      <Card className="p-6 mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <Label htmlFor="proyecto">Selecciona un proyecto</Label>
              <select
                id="proyecto"
                className="w-full mt-1 p-2 border rounded"
                value={proyectoId || ""}
                onChange={e => setProyectoId(Number(e.target.value) || null)}
              >
                <option value="">-- Selecciona --</option>
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleNuevoClick}
              className="ml-4 px-4 py-2 font-semibold text-lg bg-green-600 hover:bg-green-700 text-white rounded shadow transition-all"
              style={{ minWidth: 120 }}
              disabled={!proyectoId}
            >
              {showForm ? "Cancelar" : "➕ Nuevo"}
            </Button>
          </div>

          {/* Formulario animado */}
          {showForm && (
            <div className="animate-fade-in-down">
              <form onSubmit={handleSubmit} className="space-y-4 mb-6 bg-white rounded shadow p-4 border border-gray-200 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre del plan</Label>
                    <Input
                      id="nombre"
                      value={form.nombre}
                      onChange={e => setForm({ ...form, nombre: e.target.value })}
                      placeholder="Nombre del plan"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="criticidad">Criticidad</Label>
                    <Input
                      id="criticidad"
                      value={form.criticidad}
                      onChange={e => setForm({ ...form, criticidad: e.target.value })}
                      placeholder="Alta, Media, Baja..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsable">Responsable</Label>
                    <Input
                      id="responsable"
                      value={form.responsable}
                      onChange={e => setForm({ ...form, responsable: e.target.value })}
                      placeholder="Responsable del plan"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Input
                    id="descripcion"
                    value={form.descripcion}
                    onChange={e => setForm({ ...form, descripcion: e.target.value })}
                    placeholder="Descripción breve"
                    required
                  />
                </div>
                {formError && <div className="text-red-500 text-sm">{formError}</div>}
                {success && <div className="text-green-600 text-sm">{success}</div>}
                <Button type="submit" disabled={enviando} className="w-full sm:w-auto">
                  {enviando ? "Creando..." : "Crear plan de prueba"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </Card>
      <Card className="p-4 shadow border border-gray-200">
        {loadingPlanes ? (
          <div className="text-center py-8">Cargando planes...</div>
        ) : planes.length === 0 ? (
          <div className="text-center py-8">No hay planes registrados para este proyecto.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-2 text-left">Nombre</th>
                  <th className="px-2 py-2 text-left">Criticidad</th>
                  <th className="px-2 py-2 text-left">Responsable</th>
                  <th className="px-2 py-2 text-left">Descripción</th>
                  <th className="px-2 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {planes.map((plan) => (
                  <tr key={plan.id} className="border-t group hover:bg-gray-50 transition">
                    <td className="px-2 py-2">{plan.nombre}</td>
                    <td className="px-2 py-2">{plan.criticidad}</td>
                    <td className="px-2 py-2">{plan.responsable}</td>
                    <td className="px-2 py-2">{plan.descripcion}</td>
                    <td className="px-2 py-2 flex gap-2 items-center">
                      {/* Ejecutar (play) - SIEMPRE visible */}
                      <button
                        onClick={() => window.location.href = `/planes/${plan.id}`}
                        className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-700 shadow transition"
                        title="Ejecutar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.25v13.5l13.5-6.75-13.5-6.75z" />
                        </svg>
                      </button>
                      {/* Modificar (lápiz) - SOLO al pasar mouse */}
                      <button
                        onClick={() => openEditModal(plan)}
                        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 shadow transition opacity-0 group-hover:opacity-100"
                        title="Modificar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.25 2.25 0 1 1 3.182 3.182L7.5 20.25H3.75v-3.75L16.862 4.487z" />
                        </svg>
                      </button>
                      {/* Eliminar (tacho) - SOLO al pasar mouse */}
                      <button
                        className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700 shadow transition opacity-0 group-hover:opacity-100"
                        title="Eliminar (próximamente)"
                        disabled
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {/* Modal de edición */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg animate-fade-in-down relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setEditModalOpen(false)}
              title="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold mb-4">Modificar plan de prueba</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-nombre">Nombre</Label>
                  <Input
                    id="edit-nombre"
                    value={editForm.nombre}
                    onChange={e => setEditForm({ ...editForm, nombre: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-criticidad">Criticidad</Label>
                  <Input
                    id="edit-criticidad"
                    value={editForm.criticidad}
                    onChange={e => setEditForm({ ...editForm, criticidad: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-responsable">Responsable</Label>
                  <Input
                    id="edit-responsable"
                    value={editForm.responsable}
                    onChange={e => setEditForm({ ...editForm, responsable: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-descripcion">Descripción</Label>
                <Input
                  id="edit-descripcion"
                  value={editForm.descripcion}
                  onChange={e => setEditForm({ ...editForm, descripcion: e.target.value })}
                  required
                />
              </div>
              {editError && <div className="text-red-500 text-sm">{editError}</div>}
              {editSuccess && <div className="text-green-600 text-sm">{editSuccess}</div>}
              <div className="flex gap-2 mt-4">
                <Button type="submit" disabled={editLoading} className="w-full sm:w-auto">
                  {editLoading ? "Guardando..." : "Guardar cambios"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                  Volver
                </Button>
              </div>
            </form>
          </div>
          <style jsx global>{`
            .animate-fade-in-down {
              animation: fadeInDown 0.4s cubic-bezier(0.4,0,0.2,1);
            }
            @keyframes fadeInDown {
              0% { opacity: 0; transform: translateY(-20px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </main>
  );
} 