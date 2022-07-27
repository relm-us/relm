import { EmailDetails } from "./mail.js";
import * as path from "path";
import * as fs from "fs";
import * as url from "url";

const getDirName = () => {
  const __filename = url.fileURLToPath(import.meta.url);
  return path.dirname(__filename);
};

const EMAIL_TEMPLATE_FOLDER_PATH = path.join(getDirName(), "..", "..", "emails");

const templates: { [template: string]: EmailDetails } = {};

// Gather all email templates
const emailTemplateFolders = fs.readdirSync(EMAIL_TEMPLATE_FOLDER_PATH);
for (const folderName of emailTemplateFolders) {
  const emailHTML = fs.readFileSync(path.join(EMAIL_TEMPLATE_FOLDER_PATH, folderName, "email.html"), "utf-8");
  const emailJSON = JSON.parse(fs.readFileSync(path.join(EMAIL_TEMPLATE_FOLDER_PATH, folderName, "email.json"), "utf-8"));

  templates[folderName] = {
    subject: emailJSON.subject,
    content: emailJSON.content,
    html: emailHTML
  };

}

function applyParams(content: string, params = {}): string {
  let str = content;

  for (const key in params) {
    str = str.replace(new RegExp(`{{${key}}}`, "gi"), params[key]);
  }

  return str;
}

export function createEmailFromTemplate(templateName: string, params = {}): EmailDetails {
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