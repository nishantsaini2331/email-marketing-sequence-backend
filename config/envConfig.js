import dotenv from "dotenv";

dotenv.config();

export default {
  PORT: Number(process.env.PORT),
  MONGODB_URI: process.env.MONGODB_URI,
  NODEMAILER_USER: process.env.NODEMAILER_USER,
  NODEMAILER_PASS: process.env.NODEMAILER_PASS,
  NODEMAILER_HOST: process.env.NODEMAILER_HOST,
  NODEMAILER_PORT: Number(process.env.NODEMAILER_PORT),
  FRONTEND_URL: process.env.FRONTEND_URL,
};
