// src/index.ts

import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Carga las variables de entorno (.env)
dotenv.config();

// Inicializa Prisma (conexión a la base de datos)
const prisma = new PrismaClient();

// Inicializa Express
const app = express();
app.use(cors());
app.use(express.json());

// Ruta de prueba para saber si el backend funciona
app.get("/", (req, res) => {
  res.send("¡Backend QA funcionando!");
});

// Ejemplo: obtener todos los proyectos (puedes probarlo luego)
app.get("/proyectos", async (req, res) => {
  try {
    const proyectos = await prisma.proyecto.findMany();
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener proyectos" });
  }
});

// Ruta para crear un nuevo proyecto
app.post("/proyectos", async (req, res) => {
  try {
    const { nombre, cliente, responsable, activo } = req.body;
    const nuevoProyecto = await prisma.proyecto.create({
      data: {
        nombre,
        cliente,
        responsable,
        activo: activo !== undefined ? activo : true,
      },
    });
    res.status(201).json(nuevoProyecto);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el proyecto" });
  }
});

// Obtener un proyecto por id (con versiones)
app.get("/proyectos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await prisma.proyecto.findUnique({
      where: { id: Number(id) },
      include: { versiones: true },
    });
    if (!proyecto) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }
    res.json(proyecto);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el proyecto" });
  }
});

// Obtener los planes de un proyecto
app.get("/proyectos/:id/planes", async (req, res) => {
  try {
    const { id } = req.params;
    const planes = await prisma.plan.findMany({
      where: { version: { proyectoId: Number(id) } },
      include: { version: true },
    });
    res.json(planes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los planes" });
  }
});

// Crear un plan de prueba para un proyecto
app.post("/proyectos/:id/planes", async (req, res) => {
  try {
    const { id } = req.params;
    const { versionId, nombre, criticidad, descripcion, responsable } = req.body;
    // versionId debe ser de una versión del proyecto
    const nuevaPlan = await prisma.plan.create({
      data: {
        versionId: Number(versionId),
        nombre,
        criticidad,
        descripcion,
        responsable,
      },
    });
    res.status(201).json(nuevaPlan);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el plan de prueba" });
  }
});

// Inicia el servidor en el puerto 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend QA escuchando en http://localhost:${PORT}`);
}); 