import Mailgun from "mailgun.js";
import type Client from "mailgun.js/client.js";
import * as path from "path";
import * as fs from "fs";
import * as url from "url";
import { MAILGUN_DOMAIN, MAILGUN_FROM, MAILGUN_KEY } from "../config.js";

const getDirName = () => {
  const __filename = url.fileURLToPath(import.meta.url);
  return path.dirname(__filename);
};

const EMAIL_TEMPLATE_FOLDER_PATH = path.join(getDirName(), "..", "..", "templates", "emails");

// Gather all email templates
const templates: { [template: string]: EmailDetails } = {};
const emailTemplateFolders = fs.readdirSync(EMAIL_TEMPLATE_FOLDER_PATH)
  .filter(file => file !== "INFORMATION.md");
for (const folderName of emailTemplateFolders) {
  const htmlFilePath = path.join(EMAIL_TEMPLATE_FOLDER_PATH, folderName, "email.html");
  const jsonFilePath = path.join(EMAIL_TEMPLATE_FOLDER_PATH, folderName, "email.json");
  
  let html = null;
  if (fs.existsSync(htmlFilePath)) {
    html =  fs.readFileSync(htmlFilePath, "utf-8");
  }
  
  if (!fs.existsSync(jsonFilePath)) {
    throw Error(`Invalid email configuration for "${folderName}" (Missing email.json!)`);
  }
  const { subject, content } = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));
  if (!subject || !content) {
    throw Error(`Invalid email configuration for "${folderName}" (Missing property "subject" or "content")`);
  }

  templates[folderName] = {
    subject,
    content,
    html
  };
}

export type EmailDetails = {
  subject: string;
  content: string;
  html?: string;
}

export function createEmailTemplate(templateName: string, params = {}): EmailDetails {
  const emailDetails = templates[templateName];
  if (!emailDetails) {
    throw Error(`Email template ${templateName} doesn't exist!`);
  }

  return {
    subject: applyParams(emailDetails.subject, params),
    content: applyParams(emailDetails.content, params),
    html: applyParams(emailDetails.html, params)
  };
}

/**
 * Given a string e.g. "{{variable}} text," this function can be used to 
 * replace instances of {{variable}} with something else given params being { variable: "replace it with this!" }
 * @param content the content to replace text in
 * @param params the parameters to replace and their values
 * @returns content with params applied
 */
function applyParams(content: string, params = {}): string {
  let str = content;

  for (const key in params) {
    str = str.replace(new RegExp(`{{${key}}}`, "gi"), params[key]);
  }

  return str;
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