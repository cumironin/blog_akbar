import { Router } from "express";
import type { NextFunction, Request, Response } from "express";

const route = Router();

route.get("/", async (req: Request, res: Response, next: NextFunction) => {
	res.send("Hello World");
});

export default route;
