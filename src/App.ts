import dotenv from "dotenv";
import "reflect-metadata";
import { Container } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";
import { bindings } from "./inversify.config";
import express from "express";
import { CustomAuthProvider } from "@churchapps/apihelper";
import cors from "cors";

export const init = async () => {
  dotenv.config();
  const container = new Container();
  await container.loadAsync(bindings);
  const app = new InversifyExpressServer(container, null, null, null, CustomAuthProvider);


  const configFunction = (expApp: express.Application) => {
    // Configure CORS first
    expApp.use(cors({ origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"] }));

    // Handle preflight requests early
    expApp.options("*", (req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
      res.sendStatus(200);
    });

    // Handle body parsing from @codegenie/serverless-express
    expApp.use((req, res, next) => {
      const contentType = req.headers["content-type"] || "";

      // Handle Buffer instances (most common case with serverless-express)
      if (Buffer.isBuffer(req.body)) {
        try {
          const bodyString = req.body.toString("utf8");
          if (contentType.includes("application/json")) {
            req.body = JSON.parse(bodyString);
          } else {
            req.body = bodyString;
          }
        } catch {
          req.body = {};
        }
      } else if (req.body && req.body.type === "Buffer" && Array.isArray(req.body.data)) {
        try {
          const bodyString = Buffer.from(req.body.data).toString("utf8");
          if (contentType.includes("application/json")) {
            req.body = JSON.parse(bodyString);
          } else {
            req.body = bodyString;
          }
        } catch {
          req.body = {};
        }
      } else if (typeof req.body === "string" && req.body.length > 0) {
        try {
          if (contentType.includes("application/json")) {
            req.body = JSON.parse(req.body);
          }
        } catch {
          // Silently ignore JSON parse errors for non-JSON content
        }
      }

      next();
    });
  };

  const server = app.setConfig(configFunction).build();
  return server;
};
