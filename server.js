import cors from "cors";
import path from "path";
import express from "express";
import Config from "./config/envConfig.js";
import connectDb from "./config/connectDb.js";
import { agenda } from "./services/emailScheduler.js";
import sequenceRoute from "./routes/sequence.route.js";

const app = express();

app.use(
  cors({
    origin: Config.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/sequence", sequenceRoute);

app.listen(Config.PORT, () => {
  connectDb();
  agenda.on("ready", () => {
    agenda.start();
  });
  agenda.on("error", (error) => {
    console.error("Agenda error:", error);
  });
  console.log(`Server is running on port ${Config.PORT}`);
});
