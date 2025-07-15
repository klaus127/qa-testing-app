"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Función para obtener el detalle del plan
async function getPlan(id: string) {
  const res = await fetch(`http://localhost:3001/planes/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener el plan");
  return res.json();
}

// Función para obtener las versiones de un plan
async function getVersiones(planId: string) {
  const res = await fetch(`http://localhost:3001/planes/${planId}/versiones`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener versiones");
  return res.json();
}

// Función para crear una nueva versión
async function crearVersion(planId: string, data: any) {
  const res = await fetch(`http://localhost:3001/planes/${planId}/versiones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear la versión");
  return res.json();
}

// Función para crear un caso de prueba
async function crearCaso(versionId: string, data: any) {
  const res = await fetch(`http://localhost:3001/versiones/${versionId}/casos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear el caso");
  return res.json();
}

// Función para obtener los casos de una versión
async function getCasos(versionId: string) {
  const res = await fetch(`http://localhost:3001/versiones/${versionId}/casos`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener casos");
  return res.json();
}

// Función para eliminar un caso de prueba
async function eliminarCaso(casoId: number) {
  const res = await fetch(`http://localhost:3001/casos/${casoId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar el caso");
  return res.json();
}

export default function DetallePlanPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;
  const [plan, setPlan] = useState<any>(null);
  const [versiones, setVersiones] = useState<any[]>([]);
  const [versionId, setVersionId] = useState<string>("");
  const [casos, setCasos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", fechaInicio: "", fechaFin: "" });
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [showCasoForm, setShowCasoForm] = useState(false);
  const [casoForm, setCasoForm] = useState({
    titulo: "",
    pasos: "",
    resultadoEsperado: "",
    prioridad: "",
    estimado: 1,
    asignadoA: ""
  });
  const [casoFormError, setCasoFormError] = useState("");
  const [casoSuccess, setCasoSuccess] = useState("");
  const [enviandoCaso, setEnviandoCaso] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null); // Solo una fila editable
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredGap, setHoveredGap] = useState<number | null>(null);
  const [newCase, setNewCase] = useState<any>({
    titulo: "",
    pasos: "",
    resultadoEsperado: "",
    prioridad: "",
    estimado: 1,
    asignadoA: "",
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar datos del plan y sus versiones
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const planData = await getPlan(planId);
        setPlan(planData);
        // Ordenar versiones por fechaInicio descendente
        const vers = [...(planData.versiones || [])].sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime());
        setVersiones(vers);
        // Seleccionar la última versión por defecto
        if (vers.length > 0) {
          setVersionId(vers[0].id.toString());
        }
      } catch {
        setPlan(null);
        setVersiones([]);
      }
      setLoading(false);
    }
    fetchData();
  }, [planId]);

  // Cargar casos de la versión seleccionada
  useEffect(() => {
    if (!versionId) {
      setCasos([]);
      return;
    }
    async function fetchCasos() {
      try {
        const casosData = await getCasos(versionId);
        setCasos(casosData);
      } catch {
        setCasos([]);
      }
    }
    fetchCasos();
  }, [versionId]);

  // Manejar el envío del formulario de nueva versión
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
      await crearVersion(planId, form);
      setSuccess("¡Versión creada!");
      setForm({ nombre: "", fechaInicio: "", fechaFin: "" });
      setShowForm(false);
      // Recargar versiones y seleccionar la nueva
      const planData = await getPlan(planId);
      const vers = [...(planData.versiones || [])].sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime());
      setVersiones(vers);
      if (vers.length > 0) {
        setVersionId(vers[0].id.toString());
      }
    } catch {
      setFormError("Error al crear la versión.");
    }
    setEnviando(false);
  }

  // Manejar el envío del formulario de nuevo caso
  async function handleCasoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCasoFormError("");
    setCasoSuccess("");
    if (!casoForm.titulo || !casoForm.pasos || !casoForm.resultadoEsperado || !casoForm.prioridad || !casoForm.asignadoA) {
      setCasoFormError("Todos los campos son obligatorios.");
      return;
    }
    setEnviandoCaso(true);
    try {
      await crearCaso(versionId, casoForm);
      setCasoSuccess("¡Caso de prueba creado!");
      setCasoForm({ titulo: "", pasos: "", resultadoEsperado: "", prioridad: "", estimado: 1, asignadoA: "" });
      setShowCasoForm(false);
      // Recargar casos
      const casosData = await getCasos(versionId);
      setCasos(casosData);
    } catch {
      setCasoFormError("Error al crear el caso de prueba.");
    }
    setEnviandoCaso(false);
  }

  // Guardar nuevo caso desde fila editable
  async function handleSaveNewCase(idx: number) {
    if (!newCase.titulo || !newCase.pasos || !newCase.resultadoEsperado || !newCase.prioridad || !newCase.asignadoA) {
      setCasoFormError("Todos los campos son obligatorios.");
      return;
    }
    setEnviandoCaso(true);
    try {
      await crearCaso(versionId, newCase);
      setCasoSuccess("¡Caso de prueba creado!");
      setNewCase({ titulo: "", pasos: "", resultadoEsperado: "", prioridad: "", estimado: 1, asignadoA: "" });
      setEditingRow(null);
      const casosData = await getCasos(versionId);
      setCasos(casosData);
    } catch {
      setCasoFormError("Error al crear el caso de prueba.");
    }
    setEnviandoCaso(false);
  }

  // Eliminar caso
  async function handleDeleteCase(casoId: number) {
    if (!confirm("¿Eliminar este caso de prueba?")) return;
    setEnviandoCaso(true);
    try {
      await eliminarCaso(casoId);
      setCasoSuccess("¡Caso eliminado!");
      const casosData = await getCasos(versionId);
      setCasos(casosData);
    } catch {
      setCasoFormError("Error al eliminar el caso de prueba.");
    }
    setEnviandoCaso(false);
  }

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }
  if (!plan) {
    return <div className="text-center py-12 text-red-500">No se encontró el plan.</div>;
  }

  return (
    <main className="p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Plan: {plan.nombre}</h1>
        <Button variant="outline" onClick={() => router.back()}>Volver</Button>
      </div>
      {/* Info del plan */}
      <Card className="p-6 mb-8 shadow-lg border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="font-semibold">Criticidad:</span> {plan.criticidad}
          </div>
          <div>
            <span className="font-semibold">Responsable:</span> {plan.responsable}
          </div>
          <div className="sm:col-span-2">
            <span className="font-semibold">Descripción:</span> {plan.descripcion}
          </div>
        </div>
      </Card>
      {/* Selector de versiones y botón nueva versión */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <Label htmlFor="version-select">Versión</Label>
          <select
            id="version-select"
            className="w-full mt-1 p-2 border rounded"
            value={versionId}
            onChange={e => setVersionId(e.target.value)}
            disabled={versiones.length === 0}
          >
            {versiones.map((v) => (
              <option key={v.id} value={v.id}>{v.nombre} ({v.fechaInicio?.slice(0,10)})</option>
            ))}
          </select>
        </div>
        <Button
          className="ml-4 px-4 py-2 font-semibold text-lg bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition-all"
          onClick={() => {
            setShowForm((prev) => !prev);
            setForm({ nombre: "", fechaInicio: "", fechaFin: "" });
            setFormError("");
            setSuccess("");
          }}
        >
          {showForm ? "Cancelar" : "➕ Nueva versión"}
        </Button>
      </div>
      {/* Formulario para nueva versión */}
      {showForm && (
        <Card className="p-6 mb-4 animate-fade-in-down">
          <h3 className="font-semibold mb-2">Crear nueva versión</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
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
            <div className="sm:col-span-3 flex flex-col gap-2 mt-2">
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <Button type="submit" disabled={enviando} className="w-full sm:w-auto">
                {enviando ? "Creando..." : "Crear versión"}
              </Button>
            </div>
          </form>
        </Card>
      )}
      {/* Tabla de casos de la versión seleccionada */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Casos de prueba de la versión seleccionada</h2>
          <Button
            className="ml-4 px-4 py-2 font-semibold text-md bg-green-600 hover:bg-green-700 text-white rounded shadow transition-all"
            onClick={() => {
              setShowCasoForm((prev) => !prev);
              setCasoForm({ titulo: "", pasos: "", resultadoEsperado: "", prioridad: "", estimado: 1, asignadoA: "" });
              setCasoFormError("");
              setCasoSuccess("");
            }}
            disabled={!versionId}
          >
            {showCasoForm ? "Cancelar" : "➕ Nuevo caso de prueba"}
          </Button>
        </div>
        {showCasoForm && (
          <Card className="p-6 mb-4 animate-fade-in-down">
            <h3 className="font-semibold mb-2">Crear nuevo caso de prueba</h3>
            <form onSubmit={handleCasoSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="titulo">Nombre</Label>
                <Input
                  id="titulo"
                  value={casoForm.titulo}
                  onChange={e => setCasoForm({ ...casoForm, titulo: e.target.value })}
                  placeholder="Título del caso"
                  required
                />
              </div>
              <div>
                <Label htmlFor="prioridad">Prioridad</Label>
                <Input
                  id="prioridad"
                  value={casoForm.prioridad}
                  onChange={e => setCasoForm({ ...casoForm, prioridad: e.target.value })}
                  placeholder="Alta, Media, Baja"
                  required
                />
              </div>
              <div>
                <Label htmlFor="asignadoA">Responsable</Label>
                <Input
                  id="asignadoA"
                  value={casoForm.asignadoA}
                  onChange={e => setCasoForm({ ...casoForm, asignadoA: e.target.value })}
                  placeholder="Nombre del responsable"
                  required
                />
              </div>
              <div>
                <Label htmlFor="estimado">Tiempo estimado (minutos)</Label>
                <Input
                  id="estimado"
                  type="number"
                  min={1}
                  value={casoForm.estimado}
                  onChange={e => setCasoForm({ ...casoForm, estimado: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="sm:col-span-3">
                <Label htmlFor="pasos">Pasos</Label>
                <Input
                  id="pasos"
                  value={casoForm.pasos}
                  onChange={e => setCasoForm({ ...casoForm, pasos: e.target.value })}
                  placeholder="Pasos para ejecutar el caso"
                  required
                />
              </div>
              <div className="sm:col-span-3">
                <Label htmlFor="resultadoEsperado">Descripción</Label>
                <Input
                  id="resultadoEsperado"
                  value={casoForm.resultadoEsperado}
                  onChange={e => setCasoForm({ ...casoForm, resultadoEsperado: e.target.value })}
                  placeholder="¿Qué se espera que ocurra?"
                  required
                />
              </div>
              <div className="sm:col-span-3 flex flex-col gap-2 mt-2">
                {casoFormError && <div className="text-red-500 text-sm">{casoFormError}</div>}
                {casoSuccess && <div className="text-green-600 text-sm">{casoSuccess}</div>}
                <Button type="submit" disabled={enviandoCaso} className="w-full sm:w-auto">
                  {enviandoCaso ? "Creando..." : "Crear caso de prueba"}
                </Button>
              </div>
            </form>
          </Card>
        )}
        {casos.length === 0 ? (
          <div className="mb-6 text-gray-500">No hay casos registrados para esta versión.</div>
        ) : (
          <Card className="mb-6 relative overflow-visible"> {/* Añadido relative aquí */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Paso a Producción</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(casos.length + 1)].map((_, idx) => (
                  <React.Fragment key={"gap-" + idx}>
                    {/* Gap entre filas (antes de la primera, entre todas, pero no al final) */}
                    {idx < casos.length && (
                      <tr
                        onMouseEnter={() => setHoveredGap(idx)}
                        onMouseLeave={() => setHoveredGap(null)}
                        style={{ height: 0 }}
                      >
                        <td colSpan={7} className="relative p-0 h-2">
                          {hoveredGap === idx && editingRow === null && (
                            <button
                              aria-label="Agregar caso aquí"
                              className="absolute left-[-9px] top-1/2 -translate-y-1/2 z-20 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition focus:outline-none focus:ring-2 focus:ring-green-400"
                              style={{ width: 18, height: 18 }}
                              onClick={() => {
                                setEditingRow(idx);
                                setNewCase({ titulo: "", pasos: "", resultadoEsperado: "", prioridad: "", estimado: 1, asignadoA: "" });
                                setCasoFormError("");
                                setCasoSuccess("");
                                setTimeout(() => inputRef.current?.focus(), 100);
                              }}
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="5" cy="5" r="5" fill="none"/>
                                <rect x="4.5" y="2" width="1" height="6" rx="0.5" fill="currentColor"/>
                                <rect x="2" y="4.5" width="6" height="1" rx="0.5" fill="currentColor"/>
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    )}
                    {/* Fila de datos */}
                    {idx < casos.length && (
                      <TableRow
                        className="group transition-colors"
                        onMouseEnter={() => setHoveredGap(idx)}
                        onMouseLeave={() => setHoveredGap(null)}
                      >
                        <TableCell>{casos[idx].titulo}</TableCell>
                        <TableCell>{casos[idx].resultadoEsperado}</TableCell>
                        <TableCell>{casos[idx].pasos}</TableCell>
                        <TableCell>{casos[idx].asignadoA}</TableCell>
                        <TableCell>{casos[idx].prioridad}</TableCell>
                        <TableCell>{casos[idx].estimado}</TableCell>
                        <TableCell>{/* Acciones vacías */}</TableCell>
                      </TableRow>
                    )}
                    {/* Fila editable justo debajo si corresponde */}
                    {editingRow === idx && (
                      <TableRow className="bg-white animate-fade-in">
                        <TableCell colSpan={7}>
                          <form
                            className="flex flex-wrap gap-2 items-end"
                            onSubmit={e => {
                              e.preventDefault();
                              handleSaveNewCase(idx - 1);
                            }}
                          >
                            <Input
                              ref={inputRef}
                              className="w-32"
                              placeholder="Título"
                              value={newCase.titulo}
                              onChange={e => setNewCase({ ...newCase, titulo: e.target.value })}
                              required
                            />
                            <Input
                              className="w-40"
                              placeholder="Descripción"
                              value={newCase.resultadoEsperado}
                              onChange={e => setNewCase({ ...newCase, resultadoEsperado: e.target.value })}
                              required
                            />
                            <Input
                              className="w-40"
                              placeholder="Pasos"
                              value={newCase.pasos}
                              onChange={e => setNewCase({ ...newCase, pasos: e.target.value })}
                              required
                            />
                            <Input
                              className="w-28"
                              placeholder="Responsable"
                              value={newCase.asignadoA}
                              onChange={e => setNewCase({ ...newCase, asignadoA: e.target.value })}
                              required
                            />
                            <Input
                              className="w-20"
                              placeholder="Prioridad"
                              value={newCase.prioridad}
                              onChange={e => setNewCase({ ...newCase, prioridad: e.target.value })}
                              required
                            />
                            <Input
                              className="w-20"
                              type="number"
                              min={1}
                              placeholder="Estimado"
                              value={newCase.estimado}
                              onChange={e => setNewCase({ ...newCase, estimado: Number(e.target.value) })}
                              required
                            />
                            <button
                              type="submit"
                              className="bg-green-500 text-white rounded px-2 py-1 hover:bg-green-600 transition"
                              disabled={enviandoCaso}
                            >
                              ✔️ Guardar
                            </button>
                            <button
                              type="button"
                              className="bg-gray-200 text-gray-700 rounded px-2 py-1 hover:bg-gray-300 transition"
                              onClick={() => setEditingRow(null)}
                            >
                              Cancelar
                            </button>
                          </form>
                          {casoFormError && <div className="text-red-500 text-sm mt-1">{casoFormError}</div>}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
                {/* Elimina los botones + fijos al inicio y final de la tabla. */}
              </TableBody>
            </Table>
          </Card>
        )}
      </section>
      <style jsx global>{`
        .animate-fade-in-down {
          animation: fadeInDown 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeInDown {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
} 