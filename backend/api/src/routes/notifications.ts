import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

const notificationSchema = z.object({
  type: z.enum(["PERIOD_START", "PERIOD_END", "FERTILITY_WINDOW", "SYMPTOM_REMINDER"]),
  scheduledFor: z.string(),
  delivered: z.boolean().optional(),
});

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.userId },
    orderBy: { scheduledFor: "asc" },
  });
  return res.json({ notifications });
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = notificationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const notification = await prisma.notification.create({
    data: {
      userId: req.userId!,
      type: parsed.data.type,
      scheduledFor: new Date(parsed.data.scheduledFor),
      delivered: parsed.data.delivered ?? false,
    },
  });

  return res.status(201).json({ notification });
});

router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  const parsed = notificationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const existing = await prisma.notification.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Notification not found" });
  }

  const notification = await prisma.notification.update({
    where: { id: existing.id },
    data: {
      type: parsed.data.type,
      scheduledFor: new Date(parsed.data.scheduledFor),
      delivered: parsed.data.delivered ?? false,
    },
  });

  return res.json({ notification });
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const existing = await prisma.notification.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Notification not found" });
  }

  await prisma.notification.delete({ where: { id: existing.id } });
  return res.json({ success: true });
});

export default router;
