import bcrypt from "bcryptjs";
import { prisma } from "./db";

async function main() {
  await prisma.chatLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.symptom.deleteMany();
  await prisma.cycle.deleteMany();
  await prisma.user.deleteMany();

  const email = "demo@bloom.app";
  const password = "Password123!";
  const passwordHash = await bcrypt.hash(password, 10);

  const demo = await prisma.user.create({
    data: { email, passwordHash, isAnonymous: false },
  });

  await prisma.cycle.createMany({
    data: [
      { userId: demo.id, startDate: new Date("2025-12-06"), endDate: new Date("2025-12-10") },
      { userId: demo.id, startDate: new Date("2026-01-03"), endDate: new Date("2026-01-07") },
      { userId: demo.id, startDate: new Date("2026-01-30"), endDate: new Date("2026-02-03") },
      { userId: demo.id, startDate: new Date("2026-02-26"), endDate: new Date("2026-03-02") },
      { userId: demo.id, startDate: new Date("2026-03-25"), endDate: new Date("2026-03-29") },
    ],
  });

  await prisma.symptom.createMany({
    data: [
      { userId: demo.id, date: new Date("2025-12-07"), mood: "calm", cramps: 2, sleep: 4, energy: 3, notes: "Light cramps, good sleep." },
      { userId: demo.id, date: new Date("2025-12-09"), mood: "tired", cramps: 3, sleep: 3, energy: 2, notes: "Low energy day." },
      { userId: demo.id, date: new Date("2026-01-04"), mood: "happy", cramps: 1, sleep: 5, energy: 5 },
      { userId: demo.id, date: new Date("2026-01-31"), mood: "moody", cramps: 4, sleep: 2, energy: 2, notes: "Heavier symptoms." },
      { userId: demo.id, date: new Date("2026-02-02"), mood: "relieved", cramps: 1, sleep: 4, energy: 4 },
      { userId: demo.id, date: new Date("2026-02-27"), mood: "anxious", cramps: 3, sleep: 3, energy: 2 },
      { userId: demo.id, date: new Date("2026-03-01"), mood: "content", cramps: 2, sleep: 4, energy: 3 },
      { userId: demo.id, date: new Date("2026-03-26"), mood: "tender", cramps: 3, sleep: 3, energy: 3 },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { userId: demo.id, type: "PERIOD_START", scheduledFor: new Date("2026-03-25T08:00:00Z"), delivered: false },
      { userId: demo.id, type: "FERTILITY_WINDOW", scheduledFor: new Date("2026-03-11T08:00:00Z"), delivered: true },
      { userId: demo.id, type: "SYMPTOM_REMINDER", scheduledFor: new Date("2026-03-18T20:00:00Z"), delivered: false },
    ],
  });

  await prisma.chatLog.createMany({
    data: [
      { userId: demo.id, role: "USER", message: "I feel cramps today. Any tips?" },
      { userId: demo.id, role: "ASSISTANT", message: "Try a warm compress, gentle stretching, and hydration." },
      { userId: demo.id, role: "USER", message: "Thanks! Also feeling tired." },
      { userId: demo.id, role: "ASSISTANT", message: "Rest if you can and consider light iron-rich foods." },
    ],
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded demo user ${email} with password ${password}`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
