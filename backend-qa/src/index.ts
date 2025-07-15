// src/index.ts

import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";

// Carga las variables de entorno (.env)
dotenv.config();

// Inicializa Prisma (conexión a la base de datos)
const prisma = new PrismaClient();

// Configurar multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Crear carpeta de evidencias si no existe
    const uploadDir = path.join(__dirname, '../uploads/evidencias');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `evidencia-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

// Inicializa Express
const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Obtener un proyecto por id (sin include)
app.get("/proyectos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await prisma.proyecto.findUnique({
      where: { id: Number(id) },
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
      where: { proyectoId: Number(id) },
    });
    res.json(planes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los planes" });
  }
});

// Crear un plan de prueba para un proyecto
app.post("/proyectos/:id/planes", async (req, res) => {
  const { id } = req.params;
  const { nombre, criticidad, descripcion, responsable } = req.body;
  // Validar que el proyecto existe
  const proyecto = await prisma.proyecto.findUnique({ where: { id: Number(id) } });
  if (!proyecto) {
    return res.status(404).json({ error: "Proyecto no encontrado" });
  }
  try {
    console.log("Iniciando transacción para crear plan y versión inicial");
    const resultado = await prisma.$transaction(async (tx) => {
      console.log("Creando plan...");
      const nuevoPlan = await tx.plan.create({
        data: {
          proyectoId: Number(id),
          nombre,
          criticidad,
          descripcion,
          responsable,
        },
      });
      console.log("Plan creado:", nuevoPlan);
      const now = new Date();
      console.log("Creando versión inicial...");
      const nuevaVersion = await tx.version.create({
        data: {
          planId: nuevoPlan.id,
          nombre: "Versión Inicial",
          fechaInicio: now,
          fechaFin: now,
        },
      });
      console.log("Versión creada:", nuevaVersion);
      return { nuevoPlan, nuevaVersion };
    });
    console.log("Transacción completada con éxito");
    res.status(201).json(resultado.nuevoPlan);
  } catch (error) {
    console.error("Error al crear el plan de prueba y la versión inicial:", error);
    res.status(500).json({ error: "Error al crear el plan de prueba y la versión inicial", detalle: (error as any)?.message });
  }
});

// Obtener un plan por id (con versiones)
app.get("/planes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await prisma.plan.findUnique({
      where: { id: Number(id) },
      include: { versiones: true }
    });
    if (!plan) {
      return res.status(404).json({ error: "Plan no encontrado" });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el plan" });
  }
});

// Obtener las versiones de un plan de prueba
app.get("/planes/:planId/versiones", async (req, res) => {
  try {
    const { planId } = req.params;
    const versiones = await prisma.version.findMany({
      where: { planId: Number(planId) },
    });
    res.json(versiones);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las versiones del plan" });
  }
});

// Crear una versión para un plan de prueba
app.post("/planes/:planId/versiones", async (req, res) => {
  try {
    const { planId } = req.params;
    const { nombre, fechaInicio, fechaFin } = req.body;
    const nuevaVersion = await prisma.version.create({
      data: {
        planId: Number(planId),
        nombre,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
      },
    });
    res.status(201).json(nuevaVersion);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la versión del plan" });
  }
});

// Obtener los casos de prueba de una versión
app.get("/versiones/:versionId/casos", async (req, res) => {
  try {
    const { versionId } = req.params;
    const casos = await prisma.casoPrueba.findMany({
      where: { versionId: Number(versionId) },
    });
    res.json(casos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los casos de prueba" });
  }
});

// Crear un caso de prueba para una versión
app.post("/versiones/:versionId/casos", async (req, res) => {
  try {
    const { versionId } = req.params;
    const { titulo, pasos, resultadoEsperado, prioridad, estimado, asignadoA } = req.body;
    // Validar que la versión existe
    const version = await prisma.version.findUnique({ where: { id: Number(versionId) } });
    if (!version) {
      return res.status(404).json({ error: "Versión no encontrada" });
    }
    const nuevoCaso = await prisma.casoPrueba.create({
      data: {
        versionId: Number(versionId),
        titulo,
        pasos,
        resultadoEsperado,
        prioridad,
        estimado,
        asignadoA,
      },
    });
    res.status(201).json(nuevoCaso);
  } catch (error) {
    console.error("Error al crear el caso de prueba:", error);
    res.status(500).json({ error: "Error al crear el caso de prueba", detalle: (error as any)?.message });
  }
});

// Obtener las ejecuciones de un caso de prueba
app.get("/casos/:casoId/ejecuciones", async (req, res) => {
  try {
    const { casoId } = req.params;
    const ejecuciones = await prisma.ejecucion.findMany({
      where: { casoId: Number(casoId) },
      include: {
        evidencias: true
      }
    });
    res.json(ejecuciones);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las ejecuciones" });
  }
});

// Crear una ejecución para un caso de prueba
app.post("/casos/:casoId/ejecuciones", async (req, res) => {
  try {
    const { casoId } = req.params;
    const { usuarioId, fecha, estado, tiempoReal, observaciones } = req.body;
    // Validar que el caso existe
    const caso = await prisma.casoPrueba.findUnique({ where: { id: Number(casoId) } });
    if (!caso) {
      return res.status(404).json({ error: "Caso de prueba no encontrado" });
    }
    const nuevaEjecucion = await prisma.ejecucion.create({
      data: {
        casoId: Number(casoId),
        usuarioId,
        fecha: fecha ? new Date(fecha) : new Date(),
        estado,
        tiempoReal,
        observaciones,
      },
    });
    res.status(201).json(nuevaEjecucion);
  } catch (error) {
    console.error("Error al crear la ejecución:", error);
    res.status(500).json({ error: "Error al crear la ejecución", detalle: (error as any)?.message });
  }
});

// Subir evidencia para una ejecución
app.post("/ejecuciones/:ejecucionId/evidencia", upload.single('evidencia'), async (req, res) => {
  try {
    const { ejecucionId } = req.params;
    
    // Validar que la ejecución existe
    const ejecucion = await prisma.ejecucion.findUnique({ 
      where: { id: Number(ejecucionId) } 
    });
    if (!ejecucion) {
      return res.status(404).json({ error: "Ejecución no encontrada" });
    }

    // Verificar que se subió un archivo
    if (!req.file) {
      return res.status(400).json({ error: "No se subió ningún archivo" });
    }

    // Guardar la ruta de la evidencia en la base de datos
    const rutaEvidencia = `/uploads/evidencias/${req.file.filename}`;
    
    // Crear el registro de evidencia
    const nuevaEvidencia = await prisma.evidencia.create({
      data: {
        ejecucionId: Number(ejecucionId),
        url: rutaEvidencia,
        descripcion: `Evidencia subida el ${new Date().toLocaleString()}`
      }
    });

    res.json({
      mensaje: "Evidencia subida correctamente",
      evidencia: nuevaEvidencia,
      archivo: req.file.filename
    });

  } catch (error) {
    console.error("Error al subir evidencia:", error);
    res.status(500).json({ 
      error: "Error al subir evidencia", 
      detalle: (error as any)?.message 
    });
  }
});

// Inicia el servidor en el puerto 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend QA escuchando en http://localhost:${PORT}`);
}); 