import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { db, mongoClient } from "./mongodb.js";

export const auth = betterAuth({
  appName: "momo",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "development-secret-change-before-production",
  database: mongodbAdapter(db, {
    client: mongoClient,
    transaction: false,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    modelName: "users",
    additionalFields: {
      gender: { type: "string", required: true },
      nickname: { type: "string", required: true },
      region: { type: "string", required: true },
      category: { type: "string[]", required: true },
    },
  },
  session: { modelName: "sessions" },
  account: { modelName: "accounts" },
  verification: { modelName: "verifications" },
  advanced: {
    database: {
      joins: true,
      validateSchema: false,
    },
  },
  plugins: [nextCookies()],
});
