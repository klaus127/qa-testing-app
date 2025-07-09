import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="h-screen w-56 bg-gray-900 text-white flex flex-col py-6 px-4 shadow-lg">
      <h2 className="text-xl font-bold mb-8 text-center">QA App</h2>
      <nav className="flex flex-col gap-4">
        <Link href="/proyectos" className="hover:bg-gray-800 rounded px-3 py-2 transition-colors">
          Proyectos
        </Link>
        <Link href="/planes" className="hover:bg-gray-800 rounded px-3 py-2 transition-colors">
          Planes de Prueba
        </Link>
        {/* Puedes agregar más enlaces aquí */}
      </nav>
    </aside>
  );
} 