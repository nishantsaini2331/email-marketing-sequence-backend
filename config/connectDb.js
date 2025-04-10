import mongoose from "mongoose";
import Config from "./envConfig.js";

function connectDb() {
  mongoose
    .connect(Config.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
}
export default connectDb;
