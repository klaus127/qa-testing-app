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

export default function PlanesPage() {
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [proyectoId, setProyectoId] = useState<number | null>(null);
  const [planes, setPlanes] = useState<any[]>([]);
  const [loadingPlanes, setLoadingPlanes] = useState(false);
  const [form, setForm] = useState({ versionId: "", nombre: "", criticidad: "", descripcion: "", responsable: "" });
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [versiones, setVersiones] = useState<any[]>([]);
  const [versionForm, setVersionForm] = useState({ nombre: "", fechaInicio: "", fechaFin: "" });
  const [versionError, setVersionError] = useState("");
  const [versionSuccess, setVersionSuccess] = useState("");
  const [enviandoVersion, setEnviandoVersion] = useState(false);

  // Cargar proyectos al inicio
  useEffect(() => {
    getProyectos().then(setProyectos);
  }, []);

  // Cargar versiones y planes cuando cambia el proyecto
  useEffect(() => {
    if (proyectoId) {
      const proyecto = proyectos.find((p) => p.id === Number(proyectoId));
      setVersiones(proyecto?.versiones || []);
      cargarPlanes(proyectoId);
    } else {
      setPlanes([]);
      setVersiones([]);
    }
  }, [proyectoId, proyectos]);

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
    if (!form.versionId || !form.nombre || !form.criticidad || !form.descripcion || !form.responsable) {
      setFormError("Todos los campos son obligatorios.");
      return;
    }
    setEnviando(true);
    try {
      await crearPlan(Number(proyectoId), form);
      setSuccess("¡Plan de prueba creado!");
      setForm({ versionId: "", nombre: "", criticidad: "", descripcion: "", responsable: "" });
      cargarPlanes(Number(proyectoId));
    } catch {
      setFormError("Error al crear el plan.");
    }
    setEnviando(false);
  }

  async function handleVersionSubmit(e: React.FormEvent) {
    e.preventDefault();
    setVersionError("");
    setVersionSuccess("");
    if (!versionForm.nombre || !versionForm.fechaInicio || !versionForm.fechaFin) {
      setVersionError("Todos los campos son obligatorios.");
      return;
    }
    setEnviandoVersion(true);
    try {
      await crearVersion(Number(proyectoId), versionForm);
      setVersionSuccess("¡Versión creada!");
      setVersionForm({ nombre: "", fechaInicio: "", fechaFin: "" });
      // Recargar proyectos para actualizar las versiones
      getProyectos().then(setProyectos);
    } catch {
      setVersionError("Error al crear la versión.");
    }
    setEnviandoVersion(false);
  }

  return (
    <main className="p-4 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Planes de Prueba</h1>
      <Card className="p-6 mb-8">
        <div className="mb-4">
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
        {proyectoId && (
          <Card className="p-4 mb-6 bg-gray-50">
            <h3 className="font-semibold mb-2">Agregar versión al proyecto</h3>
            <form onSubmit={handleVersionSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <Label htmlFor="version-nombre">Nombre</Label>
                <Input
                  id="version-nombre"
                  value={versionForm.nombre}
                  onChange={e => setVersionForm({ ...versionForm, nombre: e.target.value })}
                  placeholder="Nombre de la versión"
                  required
                />
              </div>
              <div>
                <Label htmlFor="version-fechaInicio">Fecha inicio</Label>
                <Input
                  id="version-fechaInicio"
                  type="date"
                  value={versionForm.fechaInicio}
                  onChange={e => setVersionForm({ ...versionForm, fechaInicio: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="version-fechaFin">Fecha fin</Label>
                <Input
                  id="version-fechaFin"
                  type="date"
                  value={versionForm.fechaFin}
                  onChange={e => setVersionForm({ ...versionForm, fechaFin: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={enviandoVersion} className="w-full sm:w-auto">
                {enviandoVersion ? "Creando..." : "Crear versión"}
              </Button>
            </form>
            {versionError && <div className="text-red-500 text-sm mt-2">{versionError}</div>}
            {versionSuccess && <div className="text-green-600 text-sm mt-2">{versionSuccess}</div>}
          </Card>
        )}
        {proyectoId && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="versionId">Versión</Label>
                <select
                  id="versionId"
                  className="w-full mt-1 p-2 border rounded"
                  value={form.versionId}
                  onChange={e => setForm({ ...form, versionId: e.target.value })}
                  required
                >
                  <option value="">-- Selecciona versión --</option>
                  {versiones.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.nombre}</option>
                  ))}
                </select>
              </div>
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
        )}
      </Card>
      <Card className="p-4 shadow border border-gray-200">
        {loadingPlanes ? (
          <div className="text-center py-8">Cargando planes...</div>
        ) : planes.length === 0 ? (
          <div className="text-center py-8">No hay planes registrados para este proyecto.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 font-semibold">ID</th>
                  <th className="border px-4 py-2 font-semibold">Versión</th>
                  <th className="border px-4 py-2 font-semibold">Nombre</th>
                  <th className="border px-4 py-2 font-semibold">Criticidad</th>
                  <th className="border px-4 py-2 font-semibold">Responsable</th>
                  <th className="border px-4 py-2 font-semibold">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {planes.map((plan: any) => (
                  <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="border px-4 py-2">{plan.id}</td>
                    <td className="border px-4 py-2">{plan.version?.nombre}</td>
                    <td className="border px-4 py-2">{plan.nombre}</td>
                    <td className="border px-4 py-2">{plan.criticidad}</td>
                    <td className="border px-4 py-2">{plan.responsable}</td>
                    <td className="border px-4 py-2">{plan.descripcion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </main>
  );
} 