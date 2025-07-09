"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

// Obtener proyecto y versiones
async function getProyecto(id: string) {
  const res = await fetch(`http://localhost:3001/proyectos`);
  if (!res.ok) throw new Error("Error al obtener proyecto");
  const proyectos = await res.json();
  return proyectos.find((p: any) => p.id === Number(id));
}

// Obtener versiones de un proyecto
async function getVersiones(id: string) {
  const res = await fetch(`http://localhost:3001/proyectos/${id}`);
  if (!res.ok) throw new Error("Error al obtener versiones");
  const proyecto = await res.json();
  return proyecto.versiones || [];
}

// Crear una versión
async function crearVersion(proyectoId: string, data: any) {
  const res = await fetch(`http://localhost:3001/proyectos/${proyectoId}/versiones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear la versión");
  return res.json();
}

export default function ProyectoDetallePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [proyecto, setProyecto] = useState<any>(null);
  const [versiones, setVersiones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: "", fechaInicio: "", fechaFin: "" });
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
      const v = await getVersiones(params.id);
      setVersiones(v);
    } catch {
      setProyecto(null);
      setVersiones([]);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSuccess("");
    if (!form.nombre || !form.fechaInicio || !form.fechaFin) {
      setFormError("Todos los campos son obligatorios.");
      return;
    }
    setEnviando(true);
    try {
      await crearVersion(params.id, form);
      setSuccess("¡Versión creada!");
      setForm({ nombre: "", fechaInicio: "", fechaFin: "" });
      cargarDatos();
    } catch {
      setFormError("Error al crear la versión.");
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
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Versiones del proyecto</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end mb-6">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre de la versión"
              required
            />
          </div>
          <div>
            <Label htmlFor="fechaInicio">Fecha inicio</Label>
            <Input
              id="fechaInicio"
              type="date"
              value={form.fechaInicio}
              onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="fechaFin">Fecha fin</Label>
            <Input
              id="fechaFin"
              type="date"
              value={form.fechaFin}
              onChange={e => setForm({ ...form, fechaFin: e.target.value })}
              required
            />
          </div>
          <Button type="submit" disabled={enviando} className="w-full sm:w-auto">
            {enviando ? "Creando..." : "Crear versión"}
          </Button>
        </form>
        {formError && <div className="text-red-500 text-sm mb-2">{formError}</div>}
        {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 font-semibold">ID</th>
                <th className="border px-4 py-2 font-semibold">Nombre</th>
                <th className="border px-4 py-2 font-semibold">Fecha inicio</th>
                <th className="border px-4 py-2 font-semibold">Fecha fin</th>
              </tr>
            </thead>
            <tbody>
              {versiones.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-4">No hay versiones registradas.</td>
                </tr>
              ) : (
                versiones.map((v: any) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="border px-4 py-2">{v.id}</td>
                    <td className="border px-4 py-2">{v.nombre}</td>
                    <td className="border px-4 py-2">{v.fechaInicio?.slice(0, 10)}</td>
                    <td className="border px-4 py-2">{v.fechaFin?.slice(0, 10)}</td>
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