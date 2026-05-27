import { config } from "../config";
import nodemailer from "nodemailer";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

export async function sendEmail(message: EmailMessage) {
  if (config.smtpHost) {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: config.smtpUser
        ? {
            user: config.smtpUser,
            pass: config.smtpPassword,
          }
        : undefined,
    });

    await transporter.sendMail({
      from: config.emailFrom,
      ...message,
    });
    return;
  }

  console.log("Email envoye", {
    from: config.emailFrom,
    to: message.to,
    subject: message.subject,
    text: message.text,
  });
}
