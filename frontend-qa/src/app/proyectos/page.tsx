"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Link from "next/link";

// Función para obtener los proyectos del backend
async function getProyectos() {
  const res = await fetch("http://localhost:3001/proyectos", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Error al obtener proyectos");
  }
  return res.json();
}

// Función para crear un proyecto en el backend
async function crearProyecto(data: any) {
  const res = await fetch("http://localhost:3001/proyectos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Error al crear proyecto");
  }
  return res.json();
}

export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ nombre: "", cliente: "", responsable: "" });
  const [formError, setFormError] = useState("");
  const [enviando, setEnviando] = useState(false);

  React.useEffect(() => {
    cargarProyectos();
  }, []);

  async function cargarProyectos() {
    setLoading(true);
    setError("");
    try {
      const data = await getProyectos();
      setProyectos(data);
    } catch (e) {
      setError("No se pudieron cargar los proyectos.");
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSuccess("");
    if (!form.nombre || !form.cliente || !form.responsable) {
      setFormError("Todos los campos son obligatorios.");
      return;
    }
    setEnviando(true);
    try {
      await crearProyecto({ ...form, activo: true });
      setSuccess("¡Proyecto creado exitosamente!");
      setForm({ nombre: "", cliente: "", responsable: "" });
      cargarProyectos();
    } catch (e) {
      setFormError("Error al crear el proyecto.");
    }
    setEnviando(false);
  }

  return (
    <main className="p-4 sm:p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Lista de Proyectos</h1>
      <Card className="p-6 mb-8 shadow-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Agregar nuevo proyecto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                placeholder="Nombre del proyecto"
                required
              />
            </div>
            <div>
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                id="cliente"
                value={form.cliente}
                onChange={e => setForm({ ...form, cliente: e.target.value })}
                placeholder="Nombre del cliente"
                required
              />
            </div>
            <div>
              <Label htmlFor="responsable">Responsable</Label>
              <Input
                id="responsable"
                value={form.responsable}
                onChange={e => setForm({ ...form, responsable: e.target.value })}
                placeholder="Responsable del proyecto"
                required
              />
            </div>
          </div>
          {formError && <div className="text-red-500 text-sm">{formError}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <Button type="submit" disabled={enviando} className="w-full sm:w-auto">
            {enviando ? "Creando..." : "Crear proyecto"}
          </Button>
        </form>
      </Card>
      <Card className="p-4 shadow border border-gray-200">
        {loading ? (
          <div className="text-center py-8">Cargando proyectos...</div>
        ) : error ? (
          <div className="text-red-500 mb-4 text-center">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 font-semibold">ID</th>
                  <th className="border px-4 py-2 font-semibold">Nombre</th>
                  <th className="border px-4 py-2 font-semibold">Cliente</th>
                  <th className="border px-4 py-2 font-semibold">Responsable</th>
                  <th className="border px-4 py-2 font-semibold">Activo</th>
                  <th className="border px-4 py-2 font-semibold">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {proyectos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-4">No hay proyectos registrados.</td>
                  </tr>
                ) : (
                  proyectos.map((proyecto: any) => (
                    <tr key={proyecto.id} className="hover:bg-gray-50 transition-colors">
                      <td className="border px-4 py-2">{proyecto.id}</td>
                      <td className="border px-4 py-2">{proyecto.nombre}</td>
                      <td className="border px-4 py-2">{proyecto.cliente}</td>
                      <td className="border px-4 py-2">{proyecto.responsable}</td>
                      <td className="border px-4 py-2">{proyecto.activo ? "Sí" : "No"}</td>
                      <td className="border px-4 py-2 text-center">
                        <Link href={`/proyectos/${proyecto.id}`} className="text-blue-600 underline hover:text-blue-800">Ver detalle</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </main>
  );
} 