import nodeCron from "node-cron";
import { prisma } from "../database";

export async function deleteExpiredDrafts(now = new Date()) {
  const result = await prisma.gift.deleteMany({
    where: {
      status: "brouillon",
      draftExpiresAt: {
        lte: now,
      },
    },
  });
  return result.count;
}

export function scheduleExpiredDraftsDeletion() {
  nodeCron.schedule("0 2 * * *", async () => {
    try {
      const deletedCOunt = await deleteExpiredDrafts();
      console.log("Brouillons supprimés : ", deletedCOunt);
    } catch (error) {
      console.error(
        "Erreur lors de la suppression des brouillons expirés : ",
        error,
      );
    }
  });
}
