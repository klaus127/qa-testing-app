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

// Inicia el servidor en el puerto 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend QA escuchando en http://localhost:${PORT}`);
}); 