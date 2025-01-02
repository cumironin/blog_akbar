import express from "express";
import { handler as ssrHandler } from "./dist/server/entry.mjs";

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || "0.0.0.0";

// Handle SSR requests
app.use(ssrHandler);

app.listen(port, host, () => {
	console.log(`Server listening on http://${host}:${port}`);
});
