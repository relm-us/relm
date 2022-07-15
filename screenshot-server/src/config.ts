import dotenv from "dotenv";

dotenv.config();

const SCREENSHOTS_DIR = process.env.SCREENSHOT_DIR;
const SCREENSHOT_API_PORT = process.env.PORT || 3001;

export {
  SCREENSHOTS_DIR,
  SCREENSHOT_API_PORT
};