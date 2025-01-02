import express from "express";
import { handler } from "./dist/server/entry.mjs";

const app = express();
const port = process.env.PORT || 3000;

// Add middleware to handle Astro SSR
app.use(handler);

app.listen(port, "0.0.0.0", () => {
	console.log(`Server is running on http://0.0.0.0:${port}`);
});
