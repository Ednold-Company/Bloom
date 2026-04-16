import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

const cycleSchema = z.object({
  startDate: z.string(),
  endDate: z.string().optional(),
});

function monthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, next };
}

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const cycles = await prisma.cycle.findMany({
    where: { userId: req.userId },
    orderBy: { startDate: "desc" },
  });
  return res.json({ cycles });
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = cycleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { startDate, endDate } = parsed.data;
  const start = new Date(startDate);
  const range = monthRange(start);
  const existingInMonth = await prisma.cycle.findFirst({
    where: {
      userId: req.userId,
      startDate: { gte: range.start, lt: range.next },
    },
  });
  if (existingInMonth) {
    return res.status(409).json({ error: "A period start is already logged for this month." });
  }

  const cycle = await prisma.cycle.create({
    data: {
      userId: req.userId!,
      startDate: start,
      endDate: endDate ? new Date(endDate) : undefined,
    },
  });
  return res.status(201).json({ cycle });
});

router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  const parsed = cycleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const existing = await prisma.cycle.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Cycle not found" });
  }

  const start = new Date(parsed.data.startDate);
  const range = monthRange(start);
  const conflict = await prisma.cycle.findFirst({
    where: {
      userId: req.userId,
      startDate: { gte: range.start, lt: range.next },
      NOT: { id: existing.id },
    },
  });
  if (conflict) {
    return res.status(409).json({ error: "A period start is already logged for this month." });
  }

  const cycle = await prisma.cycle.update({
    where: { id: existing.id },
    data: {
      startDate: start,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    },
  });

  return res.json({ cycle });
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const existing = await prisma.cycle.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Cycle not found" });
  }

  await prisma.cycle.delete({ where: { id: existing.id } });
  return res.json({ success: true });
});

export default router;
