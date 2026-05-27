import { createApp } from "./app";
import { config } from "./config";
import { initDatabase } from "./database";
import {
  detectOverdueCheckIns,
  scheduleCheckInReminders,
} from "./jobs/checkInReminders";
import { deleteExpiredDrafts } from "./jobs/deleteExpiredDrafts";

async function bootstrap() {
  await initDatabase();
  deleteExpiredDrafts();
  detectOverdueCheckIns().catch((error) => {
    console.error("Erreur lors de la detection des check-ins : ", error);
  });
  scheduleCheckInReminders();

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`API auth template running on http://localhost:${config.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start API:", error);
  process.exit(1);
});
