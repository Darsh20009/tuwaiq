import mongoose from "mongoose";

let isMongooseConnected = false;

export async function connectMongoose(): Promise<void> {
  if (isMongooseConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI must be set.");
  }

  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isMongooseConnected = true;
    console.log("[Mongoose] Connected to MongoDB successfully");

    mongoose.connection.on("error", (err) => {
      console.error("[Mongoose] Connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("[Mongoose] Disconnected from MongoDB");
      isMongooseConnected = false;
    });
  } catch (error) {
    console.error("[Mongoose] Connection failed:", error);
    throw error;
  }
}

export function getMongooseConnection() {
  return mongoose.connection;
}
