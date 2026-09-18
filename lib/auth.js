import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { database, mongoClient } from "@/lib/mongodb";

const localDevelopmentSecret = "momo-local-development-secret-change-before-deploy";

export const auth = betterAuth({
  appName: "momo",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || localDevelopmentSecret,
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
  database: mongodbAdapter(database, {
    client: mongoClient,
    transaction: false,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  user: {
    modelName: "users",
    additionalFields: {
      gender: {
        type: ["남성", "여성"],
        required: true,
        input: true,
      },
      nickname: {
        type: "string",
        required: true,
        input: true,
      },
      region: {
        type: "string",
        required: true,
        input: true,
      },
      category: {
        type: "string[]",
        required: true,
        input: true,
      },
      notificationEnabled: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: true,
      },
    },
  },
  session: {
    modelName: "sessions",
    cookieCache: {
      enabled: false,
    },
  },
  account: {
    modelName: "accounts",
  },
  verification: {
    modelName: "verifications",
  },
  advanced: {
    database: {
      joins: true,
    },
  },
  plugins: [nextCookies()],
});
