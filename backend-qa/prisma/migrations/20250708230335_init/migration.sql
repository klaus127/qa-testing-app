-- CreateTable
CREATE TABLE "Proyecto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Version" (
    "id" SERIAL NOT NULL,
    "proyectoId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" SERIAL NOT NULL,
    "versionId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "criticidad" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CasoPrueba" (
    "id" SERIAL NOT NULL,
    "planId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "pasos" TEXT NOT NULL,
    "resultadoEsperado" TEXT NOT NULL,
    "prioridad" TEXT NOT NULL,
    "estimado" INTEGER NOT NULL,
    "asignadoA" TEXT NOT NULL,

    CONSTRAINT "CasoPrueba_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ejecucion" (
    "id" SERIAL NOT NULL,
    "casoId" INTEGER NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL,
    "tiempoReal" INTEGER NOT NULL,
    "observaciones" TEXT NOT NULL,

    CONSTRAINT "Ejecucion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incidente" (
    "id" SERIAL NOT NULL,
    "ejecucionId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "severidad" TEXT NOT NULL,
    "reproducir" TEXT NOT NULL,
    "esperado" TEXT NOT NULL,
    "actual" TEXT NOT NULL,
    "asignadoA" TEXT NOT NULL,
    "estado" TEXT NOT NULL,

    CONSTRAINT "Incidente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidencia" (
    "id" SERIAL NOT NULL,
    "ejecucionId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "Evidencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bitacora" (
    "id" SERIAL NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "ip" TEXT NOT NULL,
    "detalle" TEXT NOT NULL,

    CONSTRAINT "Bitacora_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasoPrueba" ADD CONSTRAINT "CasoPrueba_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ejecucion" ADD CONSTRAINT "Ejecucion_casoId_fkey" FOREIGN KEY ("casoId") REFERENCES "CasoPrueba"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidente" ADD CONSTRAINT "Incidente_ejecucionId_fkey" FOREIGN KEY ("ejecucionId") REFERENCES "Ejecucion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidencia" ADD CONSTRAINT "Evidencia_ejecucionId_fkey" FOREIGN KEY ("ejecucionId") REFERENCES "Ejecucion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
