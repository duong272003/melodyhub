import mongoose from "mongoose";

export async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not set");
  }
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      maxPoolSize: 10,
    });
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("🔴 MongoDB Connection Error Details:", error);
    throw error;
  }
}
