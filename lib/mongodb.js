import { MongoClient } from "mongodb";

const mongodbUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const databaseName = process.env.MONGODB_DB || "momo";

const globalMongo = globalThis;

if (!globalMongo.momoMongoClient) {
  globalMongo.momoMongoClient = new MongoClient(mongodbUri);
}

export const mongoClient = globalMongo.momoMongoClient;
export const db = mongoClient.db(databaseName);
