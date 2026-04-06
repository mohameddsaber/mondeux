import mongoose from "mongoose";
import { appConfig } from "../config/env.js";

const connectDB = async () => {
  try {
    if (!appConfig.mongoUri) {
      throw new Error("MONGO_URI is not configured");
    }

    await mongoose.connect(appConfig.mongoUri, {});
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
