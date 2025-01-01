import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import routes from "./routes/index.js";

dotenv.config();

const app = express();
routes(app);

export default app;
