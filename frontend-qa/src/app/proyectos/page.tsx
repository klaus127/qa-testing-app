// Página para mostrar la lista de proyectos desde el backend
import React from "react";

// Función para obtener los proyectos del backend
async function getProyectos() {
  // Cambia la URL si tu backend está en otra dirección
  const res = await fetch("http://localhost:3001/proyectos", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Error al obtener proyectos");
  }
  return res.json();
}

export default async function ProyectosPage() {
  let proyectos = [];
  let error = "";
  try {
    proyectos = await getProyectos();
  } catch (e) {
    error = "No se pudieron cargar los proyectos.";
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Lista de Proyectos</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Cliente</th>
            <th className="border px-4 py-2">Responsable</th>
            <th className="border px-4 py-2">Activo</th>
          </tr>
        </thead>
        <tbody>
          {proyectos.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-4">No hay proyectos registrados.</td>
            </tr>
          ) : (
            proyectos.map((proyecto: any) => (
              <tr key={proyecto.id}>
                <td className="border px-4 py-2">{proyecto.id}</td>
                <td className="border px-4 py-2">{proyecto.nombre}</td>
                <td className="border px-4 py-2">{proyecto.cliente}</td>
                <td className="border px-4 py-2">{proyecto.responsable}</td>
                <td className="border px-4 py-2">{proyecto.activo ? "Sí" : "No"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  );
} 