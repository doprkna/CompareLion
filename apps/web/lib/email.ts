import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  if (process.env.NODE_ENV === "development") {
    console.log("DEV Email:", { to, subject, html });
    return;
  }

  await resend.emails.send({
    from: "noreply@parel.app",
    to,
    subject,
    html,
  });
}
