import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const databaseName = process.env.MONGODB_DB_NAME || "momo";

const globalMongo = globalThis;

if (!globalMongo.momoMongoClient) {
  globalMongo.momoMongoClient = new MongoClient(mongoUri, {
    appName: "momo",
    serverSelectionTimeoutMS: 3000,
  });
}

export const mongoClient = globalMongo.momoMongoClient;
export const database = mongoClient.db(databaseName);

export async function getDatabase() {
  await mongoClient.connect();
  return database;
}
