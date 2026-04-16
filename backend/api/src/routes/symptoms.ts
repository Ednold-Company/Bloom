import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

const symptomSchema = z.object({
  date: z.string(),
  mood: z.string().optional(),
  cramps: z.number().min(1).max(5).optional(),
  sleep: z.number().min(1).max(5).optional(),
  energy: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
});

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const symptoms = await prisma.symptom.findMany({
    where: { userId: req.userId },
    orderBy: { date: "desc" },
  });
  return res.json({ symptoms });
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = symptomSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const symptom = await prisma.symptom.create({
    data: {
      userId: req.userId!,
      date: new Date(parsed.data.date),
      mood: parsed.data.mood,
      cramps: parsed.data.cramps,
      sleep: parsed.data.sleep,
      energy: parsed.data.energy,
      notes: parsed.data.notes,
    },
  });

  return res.status(201).json({ symptom });
});

router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  const parsed = symptomSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const existing = await prisma.symptom.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Symptom not found" });
  }

  const symptom = await prisma.symptom.update({
    where: { id: existing.id },
    data: {
      date: new Date(parsed.data.date),
      mood: parsed.data.mood,
      cramps: parsed.data.cramps,
      sleep: parsed.data.sleep,
      energy: parsed.data.energy,
      notes: parsed.data.notes,
    },
  });

  return res.json({ symptom });
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const existing = await prisma.symptom.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Symptom not found" });
  }

  await prisma.symptom.delete({ where: { id: existing.id } });
  return res.json({ success: true });
});

export default router;
