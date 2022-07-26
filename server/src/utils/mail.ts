import Mailgun from "mailgun.js";
import type Client from "mailgun.js/client.js";
import { MAILGUN_DOMAIN, MAILGUN_FROM, MAILGUN_KEY } from "../config.js";

export type EmailDetails = {
  subject: string;
  content: string;
  html?: string;
}

let cachedClient: Client;
export async function getMailClient() {
  if (!cachedClient) {
    const { default: formData } = await import("form-data");
    const mailgunApi = new Mailgun(formData);
    
    cachedClient = mailgunApi.client({
      username: "api",
      key: MAILGUN_KEY
    });
  }

  return cachedClient;
}

export async function sendEmail(recipients: string|string[], details: EmailDetails) {
  const client = await getMailClient();
  
  return client.messages.create(MAILGUN_DOMAIN, {
    from: MAILGUN_FROM,
    to: recipients,
    subject: details.subject,
    text: details.content,
    html: details.html
  });
}