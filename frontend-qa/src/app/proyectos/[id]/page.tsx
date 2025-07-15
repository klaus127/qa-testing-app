"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

// Obtener proyecto
async function getProyecto(id: string) {
  const res = await fetch(`http://localhost:3001/proyectos`);
  if (!res.ok) throw new Error("Error al obtener proyecto");
  const proyectos = await res.json();
  return proyectos.find((p: any) => p.id === Number(id));
}

// Obtener planes de un proyecto
async function getPlanes(id: string) {
  const res = await fetch(`http://localhost:3001/proyectos/${id}/planes`);
  if (!res.ok) throw new Error("Error al obtener planes");
  return res.json();
}

// Crear un plan de prueba
async function crearPlan(proyectoId: string, data: any) {
  const res = await fetch(`http://localhost:3001/proyectos/${proyectoId}/planes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear el plan");
  return res.json();
}

export default function ProyectoDetallePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [proyecto, setProyecto] = useState<any>(null);
  const [planes, setPlanes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: "", criticidad: "", descripcion: "", responsable: "" });
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line
  }, [params.id]);

  async function cargarDatos() {
    setLoading(true);
    try {
      const p = await getProyecto(params.id);
      setProyecto(p);
      const pl = await getPlanes(params.id);
      setPlanes(pl);
    } catch {
      setProyecto(null);
      setPlanes([]);
    }
    setLoading(false);
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
      await crearPlan(params.id, form);
      setSuccess("¡Plan creado!");
      setForm({ nombre: "", criticidad: "", descripcion: "", responsable: "" });
      cargarDatos();
    } catch {
      setFormError("Error al crear el plan.");
    }
    setEnviando(false);
  }

  if (loading) return <div className="p-8 text-center">Cargando...</div>;
  if (!proyecto) return <div className="p-8 text-center text-red-500">Proyecto no encontrado.</div>;

  return (
    <main className="p-4 sm:p-8 max-w-3xl mx-auto">
      <Button variant="outline" className="mb-4" onClick={() => router.push("/proyectos")}>← Volver a proyectos</Button>
      <Card className="p-6 mb-8">
        <h1 className="text-2xl font-bold mb-2">{proyecto.nombre}</h1>
        <div className="mb-2 text-gray-700">Cliente: <span className="font-semibold">{proyecto.cliente}</span></div>
        <div className="mb-2 text-gray-700">Responsable: <span className="font-semibold">{proyecto.responsable}</span></div>
        <div className="mb-2 text-gray-700">Activo: <span className="font-semibold">{proyecto.activo ? "Sí" : "No"}</span></div>
      </Card>
      {/* Formulario para crear nuevo plan de prueba */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Agregar nuevo plan de prueba</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end mb-6">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
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
          <Button type="submit" disabled={enviando} className="w-full sm:w-auto">
            {enviando ? "Creando..." : "Crear plan"}
          </Button>
        </form>
        {formError && <div className="text-red-500 text-sm mb-2">{formError}</div>}
        {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
      </Card>
      {/* Tabla de planes de prueba */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Planes de prueba del proyecto</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 font-semibold">ID</th>
                <th className="border px-4 py-2 font-semibold">Nombre</th>
                <th className="border px-4 py-2 font-semibold">Criticidad</th>
                <th className="border px-4 py-2 font-semibold">Responsable</th>
                <th className="border px-4 py-2 font-semibold">Descripción</th>
                <th className="border px-4 py-2 font-semibold">Versiones</th>
              </tr>
            </thead>
            <tbody>
              {planes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-4">No hay planes registrados.</td>
                </tr>
              ) : (
                planes.map((plan: any) => (
                  <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="border px-4 py-2">{plan.id}</td>
                    <td className="border px-4 py-2">{plan.nombre}</td>
                    <td className="border px-4 py-2">{plan.criticidad}</td>
                    <td className="border px-4 py-2">{plan.responsable}</td>
                    <td className="border px-4 py-2">{plan.descripcion}</td>
                    <td className="border px-4 py-2 text-center">
                      <a href={`/planes/${plan.id}`} className="text-blue-600 underline hover:text-blue-800">Ver versiones</a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
} 