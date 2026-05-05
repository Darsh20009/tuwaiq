import { MongoClient } from "mongodb";

async function checkConnection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }

  console.log("Attempting to connect to MongoDB...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Successfully connected to MongoDB");
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log("Collections in database:", collections.map(c => c.name));
    await client.close();
    process.exit(0);
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

checkConnection();
