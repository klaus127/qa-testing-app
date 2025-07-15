"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Obtener datos de la versión
async function getVersion(id: string) {
  // Aquí podrías tener un endpoint específico, pero usamos el de planes y filtramos
  const res = await fetch(`http://localhost:3001/planes`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener la versión");
  const versiones = await res.json();
  return versiones.find((v: any) => v.id === Number(id));
}

// Obtener casos de prueba de la versión
async function getCasos(versionId: string) {
  const res = await fetch(`http://localhost:3001/versiones/${versionId}/casos`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener casos");
  return res.json();
}

// Crear un caso de prueba
async function crearCaso(versionId: string, data: any) {
  const res = await fetch(`http://localhost:3001/versiones/${versionId}/casos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear el caso");
  return res.json();
}

// Eliminar un caso de prueba
async function eliminarCaso(casoId: number) {
  const res = await fetch(`http://localhost:3001/casos/${casoId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar el caso");
  return res.json();
}

// Obtener ejecuciones de un caso
async function getEjecuciones(casoId: number) {
  const res = await fetch(`http://localhost:3001/casos/${casoId}/ejecuciones`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener ejecuciones");
  return res.json();
}
// Crear una ejecución para un caso
async function crearEjecucion(casoId: number, data: any) {
  const res = await fetch(`http://localhost:3001/casos/${casoId}/ejecuciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear la ejecución");
  return res.json();
}

// Función para subir evidencia (imagen)
async function subirEvidencia(ejecucionId: number, archivo: File) {
  const formData = new FormData();
  formData.append('evidencia', archivo);
  
  const res = await fetch(`http://localhost:3001/ejecuciones/${ejecucionId}/evidencia`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Error al subir evidencia");
  return res.json();
}

export default function CasosVersionPage() {
  const params = useParams();
  const router = useRouter();
  const versionId = params.id as string;
  const [version, setVersion] = useState<any>(null);
  const [casos, setCasos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    titulo: "",
    pasos: "",
    resultadoEsperado: "",
    prioridad: "",
    estimado: 1,
    asignadoA: "",
  });
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null); // Solo una fila editable
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [newCase, setNewCase] = useState<any>({
    titulo: "",
    pasos: "",
    resultadoEsperado: "",
    prioridad: "",
    estimado: 1,
    asignadoA: "",
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar datos de la versión y sus casos
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Aquí podrías tener un endpoint específico para una versión
        // Por ahora solo cargamos los casos
        const casosData = await getCasos(versionId);
        setCasos(casosData);
      } catch {
        setCasos([]);
      }
      setLoading(false);
    }
    fetchData();
  }, [versionId]);

  // Manejar el envío del formulario de nuevo caso
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSuccess("");
    if (!form.titulo || !form.pasos || !form.resultadoEsperado || !form.prioridad || !form.asignadoA) {
      setFormError("Todos los campos son obligatorios.");
      return;
    }
    setEnviando(true);
    try {
      await crearCaso(versionId, form);
      setSuccess("¡Caso de prueba creado!");
      setForm({ titulo: "", pasos: "", resultadoEsperado: "", prioridad: "", estimado: 1, asignadoA: "" });
      // Recargar casos
      const casosData = await getCasos(versionId);
      setCasos(casosData);
    } catch {
      setFormError("Error al crear el caso de prueba.");
    }
    setEnviando(false);
  }

  // Guardar nuevo caso desde fila editable
  async function handleSaveNewCase(idx: number) {
    if (!newCase.titulo || !newCase.pasos || !newCase.resultadoEsperado || !newCase.prioridad || !newCase.asignadoA) {
      setFormError("Todos los campos son obligatorios.");
      return;
    }
    setEnviando(true);
    try {
      await crearCaso(versionId, newCase);
      setSuccess("¡Caso de prueba creado!");
      setNewCase({ titulo: "", pasos: "", resultadoEsperado: "", prioridad: "", estimado: 1, asignadoA: "" });
      setEditingRow(null);
      const casosData = await getCasos(versionId);
      setCasos(casosData);
    } catch {
      setFormError("Error al crear el caso de prueba.");
    }
    setEnviando(false);
  }

  // Eliminar caso
  async function handleDeleteCase(casoId: number) {
    if (!confirm("¿Eliminar este caso de prueba?")) return;
    setEnviando(true);
    try {
      await eliminarCaso(casoId);
      setSuccess("¡Caso eliminado!");
      const casosData = await getCasos(versionId);
      setCasos(casosData);
    } catch {
      setFormError("Error al eliminar el caso de prueba.");
    }
    setEnviando(false);
  }

  // Función para agregar caso entre filas
  function handleAddTestCaseBetween(index: number) {
    setEditingRow(index + 1);
    setNewCase({ titulo: "", pasos: "", resultadoEsperado: "", prioridad: "", estimado: 1, asignadoA: "" });
    setFormError("");
    setSuccess("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <main className="p-4 sm:p-8 max-w-6xl mx-auto overflow-visible">
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Casos de prueba de la versión {versionId}</h1>
        <Button variant="outline" onClick={() => router.back()}>Volver</Button>
      </div>
      
      {/* Sección de casos */}
      <section className="overflow-visible">
        <h2 className="text-xl font-semibold mb-4">Casos de prueba</h2>
        
        {/* Tabla de casos */}
        {casos.length === 0 ? (
          <div className="mb-6 text-gray-500">No hay casos registrados para esta versión.</div>
        ) : (
          <Card className="mb-6 overflow-visible">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Título</TableHead>
                  <TableHead className="w-[100px]">Prioridad</TableHead>
                  <TableHead className="w-[120px]">Asignado a</TableHead>
                  <TableHead className="w-[100px]">Estimado</TableHead>
                  <TableHead className="w-[200px]">Pasos</TableHead>
                  <TableHead className="w-[200px]">Resultado esperado</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {casos.map((c, idx) => (
                  <React.Fragment key={c.id}>
                    {/* Botón "+" entre filas - aparece al hacer hover en la fila actual o la anterior */}
                    {(hoveredRow === idx || hoveredRow === idx - 1) && (
                      <TableRow className="relative">
                        <TableCell colSpan={7} className="p-0 h-2 relative">
                          <div
                            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-10 w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all duration-200"
                            onClick={() => handleAddTestCaseBetween(idx)}
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow
                      className={`group transition-colors ${hoveredRow === idx ? 'bg-gray-100 shadow' : ''}`}
                      onMouseEnter={() => setHoveredRow(idx)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <TableCell className="font-medium">{c.titulo}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          c.prioridad === 'Alta' ? 'bg-red-100 text-red-800' :
                          c.prioridad === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {c.prioridad}
                        </span>
                      </TableCell>
                      <TableCell>{c.asignadoA}</TableCell>
                      <TableCell>{c.estimado} min</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={c.pasos}>{c.pasos}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={c.resultadoEsperado}>{c.resultadoEsperado}</TableCell>
                      <TableCell className="flex gap-2 justify-end items-center min-w-[100px]">
                        {/* Botones solo en hover y si no hay edición activa */}
                        {hoveredRow === idx && editingRow === null && (
                          <>
                            <button
                              aria-label="Agregar caso debajo"
                              className="bg-green-100 text-green-700 rounded-full p-1 transition hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                              onClick={() => {
                                setEditingRow(idx + 1);
                                setNewCase({ titulo: "", pasos: "", resultadoEsperado: "", prioridad: "", estimado: 1, asignadoA: "" });
                                setFormError("");
                                setSuccess("");
                                setTimeout(() => inputRef.current?.focus(), 100);
                              }}
                            >
                              +
                            </button>
                            <button
                              aria-label="Eliminar caso"
                              className="bg-red-100 text-red-700 rounded-full p-1 transition hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                              onClick={() => handleDeleteCase(c.id)}
                            >
                              x
                            </button>
                          </>
                        )}
                        {/* Aquí puedes dejar el botón "Ver ejecuciones" si lo deseas */}
                        {hoveredRow !== idx && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const ejecucionesDiv = document.getElementById(`ejecuciones-${c.id}`);
                              if (ejecucionesDiv) {
                                ejecucionesDiv.classList.toggle('hidden');
                              }
                            }}
                          >
                            Ver ejecuciones
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    {/* Fila editable justo debajo */}
                    {editingRow === idx + 1 && (
                      <TableRow className="bg-white animate-fade-in">
                        <TableCell colSpan={7}>
                          <form
                            className="flex flex-wrap gap-2 items-end"
                            onSubmit={e => {
                              e.preventDefault();
                              handleSaveNewCase(idx);
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
                              className="w-24"
                              placeholder="Prioridad"
                              value={newCase.prioridad}
                              onChange={e => setNewCase({ ...newCase, prioridad: e.target.value })}
                              required
                            />
                            <Input
                              className="w-28"
                              placeholder="Asignado a"
                              value={newCase.asignadoA}
                              onChange={e => setNewCase({ ...newCase, asignadoA: e.target.value })}
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
                            <Input
                              className="w-40"
                              placeholder="Pasos"
                              value={newCase.pasos}
                              onChange={e => setNewCase({ ...newCase, pasos: e.target.value })}
                              required
                            />
                            <Input
                              className="w-40"
                              placeholder="Resultado esperado"
                              value={newCase.resultadoEsperado}
                              onChange={e => setNewCase({ ...newCase, resultadoEsperado: e.target.value })}
                              required
                            />
                            <button
                              type="submit"
                              className="bg-green-500 text-white rounded px-2 py-1 hover:bg-green-600 transition"
                              disabled={enviando}
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
                          {formError && <div className="text-red-500 text-sm mt-1">{formError}</div>}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Ejecuciones expandibles */}
        {casos.map((c) => (
          <div key={`ejecuciones-${c.id}`} id={`ejecuciones-${c.id}`} className="hidden mb-6">
            <EjecucionesCaso casoId={c.id} tituloCaso={c.titulo} />
          </div>
        ))}

        {/* Formulario para nuevo caso */}
        <Card className="p-6 mb-4">
          <h3 className="font-semibold mb-2">Crear nuevo caso de prueba</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={form.titulo}
                onChange={e => setForm({ ...form, titulo: e.target.value })}
                placeholder="Título del caso"
                required
              />
            </div>
            <div>
              <Label htmlFor="prioridad">Prioridad</Label>
              <Input
                id="prioridad"
                value={form.prioridad}
                onChange={e => setForm({ ...form, prioridad: e.target.value })}
                placeholder="Alta, Media, Baja"
                required
              />
            </div>
            <div>
              <Label htmlFor="asignadoA">Asignado a</Label>
              <Input
                id="asignadoA"
                value={form.asignadoA}
                onChange={e => setForm({ ...form, asignadoA: e.target.value })}
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
                value={form.estimado}
                onChange={e => setForm({ ...form, estimado: Number(e.target.value) })}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="pasos">Pasos</Label>
              <Input
                id="pasos"
                value={form.pasos}
                onChange={e => setForm({ ...form, pasos: e.target.value })}
                placeholder="Pasos para ejecutar el caso"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="resultadoEsperado">Resultado esperado</Label>
              <Input
                id="resultadoEsperado"
                value={form.resultadoEsperado}
                onChange={e => setForm({ ...form, resultadoEsperado: e.target.value })}
                placeholder="¿Qué se espera que ocurra?"
                required
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-2 mt-2">
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <Button type="submit" disabled={enviando} className="w-full sm:w-auto">
                {enviando ? "Creando..." : "Crear caso de prueba"}
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </main>
  );
}

// Componente para mostrar y crear ejecuciones de un caso
function EjecucionesCaso({ casoId, tituloCaso }: { casoId: number; tituloCaso: string }) {
  const [ejecuciones, setEjecuciones] = React.useState<any[]>([]);
  const [form, setForm] = React.useState({ 
    usuarioId: "", 
    estado: "", 
    tiempoReal: 1, 
    observaciones: "" 
  });
  const [evidencia, setEvidencia] = React.useState<File | null>(null);
  const [formError, setFormError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [enviando, setEnviando] = React.useState(false);

  React.useEffect(() => {
    getEjecuciones(casoId).then(setEjecuciones).catch(() => setEjecuciones([]));
  }, [casoId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(""); 
    setSuccess("");
    
    if (!form.usuarioId || !form.estado || !form.observaciones) {
      setFormError("Todos los campos son obligatorios."); 
      return;
    }
    
    setEnviando(true);
    try {
      // Crear la ejecución
      const ejecucion = await crearEjecucion(casoId, form);
      
      // Si hay evidencia, subirla
      if (evidencia) {
        await subirEvidencia(ejecucion.id, evidencia);
      }
      
      setSuccess("¡Ejecución registrada!");
      setForm({ usuarioId: "", estado: "", tiempoReal: 1, observaciones: "" });
      setEvidencia(null);
      
      // Recargar ejecuciones
      const ejecs = await getEjecuciones(casoId);
      setEjecuciones(ejecs);
    } catch (error) { 
      setFormError("Error al registrar la ejecución."); 
    }
    setEnviando(false);
  }

  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-4">Ejecuciones - {tituloCaso}</h4>
      
      {/* Lista de ejecuciones existentes */}
      {ejecuciones.length === 0 ? (
        <div className="text-gray-500 mb-4">No hay ejecuciones para este caso.</div>
      ) : (
        <div className="mb-4">
          <h5 className="font-medium mb-2">Ejecuciones anteriores:</h5>
          <div className="space-y-2">
            {ejecuciones.map((e) => (
              <div key={e.id} className="border rounded p-3 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`font-semibold px-2 py-1 rounded text-xs ${
                      e.estado === 'Exitoso' ? 'bg-green-100 text-green-800' :
                      e.estado === 'Fallido' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {e.estado}
                    </span>
                    <span className="text-sm text-gray-600 ml-2">
                      por {e.usuarioId} el {e.fecha?.slice(0,10)} | Tiempo: {e.tiempoReal} min
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-700 mt-1">{e.observaciones}</div>
                {e.evidencias && e.evidencias.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">Evidencias:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {e.evidencias.map((ev: any) => (
                        <div key={ev.id} className="relative">
                          <img 
                            src={`http://localhost:3001${ev.url}`}
                            alt="Evidencia" 
                            className="max-w-xs max-h-32 object-contain border rounded"
                          />
                          <p className="text-xs text-gray-500 mt-1">{ev.descripcion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulario para nueva ejecución */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <Label htmlFor={`usuarioId-${casoId}`}>Usuario</Label>
            <Input 
              id={`usuarioId-${casoId}`} 
              value={form.usuarioId} 
              onChange={e => setForm({ ...form, usuarioId: e.target.value })} 
              placeholder="Nombre del tester"
              required 
            />
          </div>
          <div>
            <Label htmlFor={`estado-${casoId}`}>Estado</Label>
            <Input 
              id={`estado-${casoId}`} 
              value={form.estado} 
              onChange={e => setForm({ ...form, estado: e.target.value })} 
              placeholder="Exitoso, Fallido, Bloqueado..."
              required 
            />
          </div>
          <div>
            <Label htmlFor={`tiempoReal-${casoId}`}>Tiempo (min)</Label>
            <Input 
              id={`tiempoReal-${casoId}`} 
              type="number" 
              min={1} 
              value={form.tiempoReal} 
              onChange={e => setForm({ ...form, tiempoReal: Number(e.target.value) })} 
              required 
            />
          </div>
          <div>
            <Label htmlFor={`observaciones-${casoId}`}>Observaciones</Label>
            <Input 
              id={`observaciones-${casoId}`} 
              value={form.observaciones} 
              onChange={e => setForm({ ...form, observaciones: e.target.value })} 
              placeholder="Resultado de la prueba"
              required 
            />
          </div>
        </div>

        {/* Campo para subir evidencia */}
        <div>
          <Label htmlFor={`evidencia-${casoId}`}>Evidencia (captura de pantalla)</Label>
          <div className="mt-1">
            <Input
              id={`evidencia-${casoId}`}
              type="file"
              accept="image/*"
              onChange={(e) => setEvidencia(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 <strong>Consejo:</strong> Usa <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Windows + Shift + S</kbd> 
              para capturar pantalla, luego pega aquí o sube la imagen.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {formError && <div className="text-red-500 text-sm">{formError}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <Button type="submit" disabled={enviando} className="w-full sm:w-auto">
            {enviando ? "Registrando..." : "Registrar ejecución"}
          </Button>
        </div>
      </form>
    </Card>
  );
} 