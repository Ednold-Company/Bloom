import { Router } from "express";
import { prisma } from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { predictCycle, predictSymptoms } from "../ai/predictor";

const router = Router();

router.get("/next", requireAuth, async (req: AuthRequest, res) => {
  const cycles = await prisma.cycle.findMany({ where: { userId: req.userId } });
  const symptoms = await prisma.symptom.findMany({ where: { userId: req.userId } });

  const cyclePrediction = predictCycle(cycles);
  const symptomPrediction = predictSymptoms(symptoms);

  return res.json({
    cyclePrediction,
    symptomPrediction,
  });
});

export default router;
